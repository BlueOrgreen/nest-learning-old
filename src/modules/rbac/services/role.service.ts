import { ForbiddenException, Injectable } from '@nestjs/common';

import { isNil, omit } from 'lodash';
import { In, SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/core/crud';

import { QueryHook } from '@/modules/core/types';

import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from '../dtos/role.dto';
import { RoleEntity } from '../entities';
import { PermissionRepository, RoleRepository } from '../repositories';

@Injectable()
export class RoleService extends BaseService<RoleEntity, RoleRepository> {
    protected enable_trash = true;

    constructor(
        protected roleRepository: RoleRepository,
        protected permissionRepository: PermissionRepository,
    ) {
        super(roleRepository);
    }

    async create(data: CreateRoleDto) {
        const createRoleDto = {
            ...data,
            permissions: data.permissions
                ? await this.permissionRepository.findBy({
                      id: In(data.permissions),
                  })
                : [],
        };
        const item = await this.repository.save(createRoleDto);
        return this.detail(item.id);
    }

    async update(data: UpdateRoleDto) {
        const role = await this.detail(data.id);
        if (data.permissions) {
            await this.repository
                .createQueryBuilder('role') // 创建 QueryBuilder 针对 'role'
                .relation(RoleEntity, 'permissions') // 指定要操作 'permissions' 关系字段
                .of(role) // 目标是某个具体的角色 role
                .addAndRemove(data.permissions, role.permissions ?? []);
        }
        await this.repository.update(data.id, omit(data, ['id', 'permissions']));
        return this.detail(data.id);
    }

    /**
    | 使用场景                 | 是否推荐                                      |
    | -------------------- | ----------------------------------------- |
    | 仅操作关系表，不想查出整张实体      | ✅ 推荐使用 `.relation()`                |
    | 要精确控制 add/remove     | ✅ 推荐使用 `.add`, `.remove`, `.addAndRemove` |
    | 不想用 `.save()` 自动同步关联 | ✅ 更底层、可控性更强                          |
    | 多对多 / 一对多 / 一对一      | ✅ 都适用 `.relation()`                      |
     */

    /**
     * 删除数据
     * @param id
     * @param trash
     */
    async delete(id: string, trash = true) {
        const item = await this.repository.findOneOrFail({
            where: { id } as any,
            withDeleted: this.enable_trash ? true : undefined,
        });
        if (item.systemed) {
            throw new ForbiddenException('can not remove systemed role!');
        }
        if (this.enable_trash && trash && isNil(item.deletedAt)) {
            (item as any).deletedAt = new Date();
            await this.repository.save(item);
            return this.detail(id, true);
        }
        return this.repository.remove(item);
    }

    protected async buildListQuery(
        queryBuilder: SelectQueryBuilder<RoleEntity>,
        options: QueryRoleDto,
        callback?: QueryHook<RoleEntity>,
    ) {
        const qb = await super.buildListQuery(queryBuilder, options, callback);
        qb.leftJoinAndSelect(`${this.repository.getQBName()}.users`, 'users');
        if (!isNil(options.user)) {
            qb.andWhere('users.id IN (:...users)', {
                roles: [options.user],
            });
        }
        return qb;
    }
}
