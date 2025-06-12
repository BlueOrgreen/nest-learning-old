import { Controller } from '@nestjs/common';

import { BaseController } from '@/modules/core/crud';
import { Crud } from '@/modules/core/decorators';

import { PermissionAction } from '../constants';
import { QueryPermssionDto } from '../dtos/permission.dto';
import { PermissionEntity } from '../entities/permission.entity';
import { simpleCurdOption } from '../helpers';

import { PermissionService } from '../services/permission.service';
import { PermissionChecker } from '../type';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, PermissionEntity.name),
];

@Crud({
    id: 'permission',
    enabled: [
        { name: 'list', option: simpleCurdOption(permissions, '权限查询,以分页模式展示') },
        { name: 'detail', option: simpleCurdOption(permissions, '权限详情') },
    ],
    dtos: {
        query: QueryPermssionDto,
    },
})
@Controller('manage/permissions')
export class PermissionController extends BaseController<PermissionService> {
    constructor(protected permissionService: PermissionService) {
        super(permissionService);
    }
}
