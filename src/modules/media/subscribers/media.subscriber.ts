import { extname, join } from 'path';

import { existsSync, removeSync } from 'fs-extra';
import { isNil } from 'lodash';
import { EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

import { MediaEntity } from '../entities';
import { getMediaConfig } from '../helpers';
import { BaseSubscriber } from '@/modules/core/crud';

@EventSubscriber()
export class MediaSubscriber extends BaseSubscriber<MediaEntity> {
    protected entity = MediaEntity;

    async beforeInsert(event: InsertEvent<MediaEntity>) {
        if (isNil(event.entity.ext)) {
            event.entity.ext = extname(event.entity.file);
        }
    }

    async beforeUpdate(event: UpdateEvent<MediaEntity>) {
        event.entity.ext = extname(event.entity.file);
    }

    /**
     * 在删除数据时同时删除文件
     * @param event
     */
    async afterRemove(event: RemoveEvent<MediaEntity>) {
        const { file } = event.entity;
        const filePath = join(getMediaConfig<string>('upload'), file);
        if (existsSync(filePath)) removeSync(filePath);
    }
}
