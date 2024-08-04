import crypto from 'crypto';

import { DataSource, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';

import { BaseSubscriber } from '@/modules/core/crud';

import { SubcriberSetting } from '@/modules/core/types';

import { UserEntity } from '../entities/user.entity';
import { encrypt } from '../helpers';
import { UserRepository } from '../repositories';

/**
 * 用户模型监听器
 */
@EventSubscriber()
export class UserSubscriber extends BaseSubscriber<UserEntity> {
    protected entity = UserEntity;

    protected setting: SubcriberSetting = {
        trash: true,
    };

    constructor(protected dataSource: DataSource, protected userRepository: UserRepository) {
        super(dataSource, userRepository);
    }

    /**
     * 生成不重复的随机用户名
     * @param event
     */
    protected async generateUserName(event: InsertEvent<UserEntity>): Promise<string> {
        const username = `user_${crypto.randomBytes(4).toString('hex').slice(0, 8)}`;
        const user = await event.manager.findOne(UserEntity, {
            where: { username },
        });
        return !user ? username : this.generateUserName(event);
    }

    /**
     * 自动生成唯一用户名和密码
     * @param event
     */
    async beforeInsert(event: InsertEvent<UserEntity>) {
        // 自动生成唯一用户名
        if (!event.entity.username) {
            event.entity.username = await this.generateUserName(event);
        }
        // 自动生成密码
        if (!event.entity.password) {
            event.entity.password = crypto.randomBytes(11).toString('hex').slice(0, 22);
        }

        // 自动加密密码
        event.entity.password = encrypt(event.entity.password);
    }

    /**
     * 当密码更改时加密密码
     * @param event
     */
    async beforeUpdate(event: UpdateEvent<UserEntity>) {
        if (this.isUpdated('password', event)) {
            event.entity.password = encrypt(event.entity.password);
        }
    }

    protected isUpdated<E>(cloumn: keyof E, event: UpdateEvent<E>): any {
        return event.updatedColumns.find((item) => item.propertyName === cloumn);
    }
}
