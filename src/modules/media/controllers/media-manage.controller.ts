import { Controller } from '@nestjs/common';

import { PermissionAction } from '@/modules/rbac/constants';
import { simpleCurdOption } from '@/modules/rbac/helpers';

import { MediaEntity } from '../entities';
import { MediaService } from '../services';
import { RbacCrud } from '@/modules/rbac/decorators/rbac-crud.decorator';
import { PermissionChecker } from '@/modules/rbac/type';
import { BaseController } from '@/modules/core/crud';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, MediaEntity.name),
];

@RbacCrud({
    id: 'media',
    enabled: [
        {
            name: 'list',
            option: simpleCurdOption(permissions, '文件查询,以分页模式展示'),
        },
        { name: 'detail', option: simpleCurdOption(permissions, '文件详情') },
        { name: 'delete', option: simpleCurdOption(permissions, '删除文件,支持批量删除') },
    ],
    dtos: {},
})
@Controller('manage/medias')
export class MediaManageController extends BaseController<MediaService> {
    constructor(protected service: MediaService) {
        super(service);
    }
}
