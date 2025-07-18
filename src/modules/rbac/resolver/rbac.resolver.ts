import { AbilityOptions, AbilityTuple, MongoQuery } from '@casl/ability';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { isNil, omit } from 'lodash';
import { DataSource, EntityManager, In, Not } from 'typeorm';

import { deepMerge } from '@/helpers';

import { UserEntity } from '@/modules/user/entities';
import { getUserConfig } from '@/modules/user/helpers';

import { UserConfig } from '@/modules/user/types';

import { SystemRoles } from '../constants';
import { PermissionEntity, RoleEntity } from '../entities';
import { Permission, Role } from '../type';

@Injectable()
export class RbacResolver<A extends AbilityTuple = AbilityTuple, C extends MongoQuery = MongoQuery>
    implements OnApplicationBootstrap
{
    protected setuped = false;

    protected options: AbilityOptions<A, C>;

    protected _roles: Role[] = [
        {
            name: SystemRoles.USER,
            label: '普通用户',
            description: '新用户的默认角色',
            permissions: [],
        },
        {
            name: SystemRoles.ADMIN,
            label: '超级管理员',
            description: '拥有整个系统的管理权限',
            permissions: [],
        },
    ];

    protected _permissions: Permission<A, C>[] = [
        {
            name: 'system-manage',
            label: '系统管理',
            description: '管理系统的所有功能',
            rule: {
                action: 'manage',
                subject: 'all',
            } as any,
        },
    ];

    constructor(protected dataSource: DataSource) {}

    setOptions(options: AbilityOptions<A, C>) {
        if (!this.setuped) {
            this.options = options;
            this.setuped = true;
        }
        return this;
    }

    get roles() {
        return this._roles;
    }

    get permissions() {
        return this._permissions;
    }

    addRoles(data: Role[]) {
        this._roles = [...this.roles, ...data];
    }

    addPermissions(data: Permission<A, C>[]) {
        this._permissions = [...this.permissions, ...data].map((p) => {
            if (typeof p.rule.subject === 'string') return p;
            // @ts-ignore
            if ('modelName' in p.rule.subject) {
                const { modelName } = p.rule.subject;
                return { ...p, rule: { ...p.rule, subject: modelName } };
            }
            return { ...p, rule: { ...p.rule, subject: (p.rule.subject as any).name } };
        });
    }

    async onApplicationBootstrap() {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await this.syncRoles(queryRunner.manager);
            await this.syncPermissions(queryRunner.manager);
            await queryRunner.commitTransaction();
        } catch (err) {
            console.log(err);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 同步角色
     * @param manager
     */
    protected async syncRoles(manager: EntityManager) {
        this._roles = this.roles.reduce((o, n) => {
            if (o.map(({ name }) => name).includes(n.name)) {
                return o.map((e) => (e.name === n.name ? deepMerge(e, n, 'merge') : e));
            }
            return [...o, n];
        }, []);

        for (const item of this.roles) {
            let role = await manager.findOne(RoleEntity, {
                relations: ['permissions'],
                where: {
                    name: item.name,
                },
            });
            // console.log('syncRoles ===role ===>', role, item.name);

            if (isNil(role)) {
                // console.log('YUnfan');

                role = await manager.save(
                    manager.create(RoleEntity, {
                        name: item.name,
                        label: item.label,
                        description: item.description,
                        systemed: true,
                    }),
                    {
                        reload: true,
                    },
                );
            } else {
                await manager.update(RoleEntity, role.id, { systemed: true });
            }
        }

        // 清理已经不存在的系统角色
        const systemRoles = await manager.findBy(RoleEntity, { systemed: true });
        const toDels: string[] = [];
        for (const sRole of systemRoles) {
            if (isNil(this.roles.find(({ name }) => sRole.name === name))) toDels.push(sRole.id);
        }
        if (toDels.length > 0) await manager.delete(RoleEntity, toDels);
    }

    /**
     * 同步权限
     * @param manager
     */
    protected async syncPermissions(manager: EntityManager) {
        const superAdmin = getUserConfig<UserConfig['super']>('super');
        console.log('syncPermissions====>yf', superAdmin);
        const permissions = await manager.find(PermissionEntity);
        const roles = await manager.find(RoleEntity, {
            relations: ['permissions'],
            where: { name: Not(SystemRoles.ADMIN) },
        });
        const roleRepo = manager.getRepository(RoleEntity);
        // 合并并去除重复权限
        this._permissions = this.permissions.reduce(
            (o, n) => (o.map(({ name }) => name).includes(n.name) ? o : [...o, n]),
            [],
        );
        const names = this.permissions.map(({ name }) => name);

        /** *********** 同步权限  ************ */
        for (const item of this.permissions) {
            const permission = omit(item, ['conditions']);
            const old = await manager.findOneBy(PermissionEntity, {
                name: permission.name,
            });
            if (isNil(old)) {
                await manager.save(manager.create(PermissionEntity, permission));
            } else {
                await manager.update(PermissionEntity, old.id, permission);
            }
        }

        // 删除冗余权限
        const toDels: string[] = [];
        for (const item of permissions) {
            if (!names.includes(item.name) && item.name !== 'system-manage') toDels.push(item.id);
        }
        if (toDels.length > 0) await manager.delete(PermissionEntity, toDels);

        /** *********** 同步普通角色  ************ */
        for (const role of roles) {
            const rolePermissions = await manager.findBy(PermissionEntity, {
                name: In(this.roles.find(({ name }) => name === role.name).permissions),
            });

            await roleRepo
                .createQueryBuilder('role')
                .relation(RoleEntity, 'permissions')
                .of(role)
                .addAndRemove(
                    rolePermissions.map(({ id }) => id),
                    (role.permissions ?? []).map(({ id }) => id),
                );
        }

        /** *********** 同步超级管理员角色  ************ */

        // 查询出超级管理员角色
        const superRole = await manager.findOneOrFail(RoleEntity, {
            relations: ['permissions'],
            where: { name: 'super-admin' },
        });
        const systemManage = await manager.findOneOrFail(PermissionEntity, {
            where: { name: 'system-manage' },
        });
        // 添加系统管理权限到超级管理员角色
        await roleRepo
            .createQueryBuilder('role')
            .relation(RoleEntity, 'permissions')
            .of(superRole)
            .addAndRemove(
                [systemManage.id],
                (superRole.permissions ?? []).map(({ id }) => id),
            );

        /** *********** 添加超级管理员角色到初始用户  ************ */
        const superUser = await manager.findOne(UserEntity, {
            relations: ['roles'],
            where: { username: superAdmin.username },
        });

        if (!isNil(superUser)) {
            const userRepo = manager.getRepository(UserEntity);
            await userRepo
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(superUser)
                .addAndRemove(
                    [superRole.id],
                    ((superUser.roles ?? []) as RoleEntity[]).map(({ id }) => id),
                );
        }
    }
}
