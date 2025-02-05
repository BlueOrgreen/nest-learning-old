import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { MessageEntity } from './message.entity';
import { UserEntity } from './user.entity';

/**
 * @description MessagerecevieEntity是UserEnity和MessageEntity的中间表.
 * @description 由于一个消息被读取的状态是需要中间表来实现的，所以我们添加这个中间模型来实现消息和接收者的多对多关联
 * 消息与接收者的中间关联表
 */
@Entity('users_recevies')
export class MessagerecevieEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '是否已读', default: false })
    readed?: boolean;

    @ManyToOne(() => MessageEntity, (message) => message.recevies, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    message!: MessageEntity;

    @ManyToOne(() => UserEntity, (recevie) => recevie.messages, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    recevier!: UserEntity;
}
