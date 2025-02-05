import { isNil } from 'lodash';
import { EventSubscriber } from 'typeorm';

import { BaseSubscriber } from '@/modules/core/crud';

import { PermissionEntity } from '../entities/permission.entity';

@EventSubscriber()
export class PermssionSubscriber extends BaseSubscriber<PermissionEntity> {
    protected entity = PermissionEntity;

    async afterLoad(entity: PermissionEntity) {
        if (isNil(entity.label)) {
            entity.label = entity.name;
        }
    }
}
