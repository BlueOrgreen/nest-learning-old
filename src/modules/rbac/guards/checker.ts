import { createMongoAbility, MongoAbility } from '@casl/ability';
import { ExecutionContext } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import { isNil } from 'lodash';

import { ClassToPlain } from '@/modules/core/types';
import { UserEntity } from '@/modules/user/entities';

import { PERMISSION_CHECKERS } from '../constants';
import { PermissionEntity } from '../entities';
import { RbacResolver } from '../resolver';
import { PermissionChecker } from '../type';

type CheckerParams = {
    resolver: RbacResolver;
    checkers: PermissionChecker[];
    moduleRef: ModuleRef;
    user: ClassToPlain<UserEntity>;
    request?: any;
};

// - getCheckers用于通过 PERMISSION_CHECKERS 的装饰器元数据获取控制器方法上的权限验证器
export const getCheckers = (context: ExecutionContext, reflector: Reflector) => {
    const crudCheckers = Reflect.getMetadata(
        PERMISSION_CHECKERS,
        context.getClass().prototype,
        context.getHandler().name,
    ) as PermissionChecker[];

    const defaultCheckers = reflector.getAllAndOverride<PermissionChecker[]>(PERMISSION_CHECKERS, [
        context.getHandler(),
        context.getClass(),
    ]);

    return crudCheckers ?? defaultCheckers;
};

export const solveChecker = async ({
    checkers,
    moduleRef,
    resolver,
    user,
    request,
}: CheckerParams) => {
    let permissions = user.permissions as PermissionEntity[];
    for (const role of user.roles) {
        permissions = [...permissions, ...role.permissions];
    }
    permissions = permissions.reduce((o, n) => {
        if (o.find(({ name }) => name === n.name)) return o;
        return [...o, n];
    }, []);
    const ability = createMongoAbility(
        permissions.map(({ rule, name }) => {
            const resolve = resolver.permissions.find((p) => p.name === name);
            if (!isNil(resolve) && !isNil(resolve.rule.conditions)) {
                return { ...rule, conditions: resolve.rule.conditions(user) };
            }
            return rule;
        }),
    );
    const results = await Promise.all(
        checkers.map(async (checker) => execChecker(checker, ability, moduleRef, request)),
    );
    return results.every((r) => !!r);
};

const execChecker = (
    checker: PermissionChecker,
    ability: MongoAbility,
    moduleRef: ModuleRef,
    request?: Request,
) => {
    if (typeof checker === 'function') return checker(ability, moduleRef, request);
    return checker.handle(ability, moduleRef, request);
};
