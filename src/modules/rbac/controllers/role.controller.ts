import { Controller } from '@nestjs/common';

import { BaseController } from '@/modules/core/crud';
import { Crud } from '@/modules/core/decorators';

import { PermissionAction } from '../constants';
import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from '../dtos/role.dto';
import { RoleEntity } from '../entities/role.entity';
import { simpleCurdOption } from '../helpers';
import { RoleService } from '../services/role.service';
import { PermissionChecker } from '../type';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, RoleEntity.name),
];

@Crud({
    id: 'role',
    enabled: [
        { name: 'list', option: simpleCurdOption(permissions, '角色查询,以分页模式展示') },
        { name: 'detail', option: simpleCurdOption(permissions, '角色详情') },
        { name: 'store', option: simpleCurdOption(permissions, '添加角色') },
        { name: 'update', option: simpleCurdOption(permissions, '修改角色信息') },
        {
            name: 'delete',
            option: simpleCurdOption(permissions, '删除角色,支持批量删除(系统角色不可删除)'),
        },
        {
            name: 'restore',
            option: simpleCurdOption(permissions, '恢复回收站中的角色,支持批量恢复'),
        },
    ],
    dtos: {
        query: QueryRoleDto,
        create: CreateRoleDto,
        update: UpdateRoleDto,
    },
})
@Controller('manage/roles')
export class RoleController extends BaseController<RoleService> {
    constructor(protected roleService: RoleService) {
        super(roleService);
    }
}
