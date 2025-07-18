import { ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { isNil } from 'lodash';

import { ExtractJwt } from 'passport-jwt';

import { JwtAuthGuard } from '@/modules/user/guards';

import { UserRepository } from '@/modules/user/repositories';
import { TokenService } from '@/modules/user/services';

import { RbacResolver } from '../resolver/rbac.resolver';

import { getCheckers, solveChecker } from './checker';

// 继承自 JwtAuthGuard，表示该守卫先进行 JWT 鉴权，再执行权限校验。
@Injectable()
export class RbacGuard extends JwtAuthGuard {
    /**
     *
     * @param reflector  用于读取元数据装饰器（即权限校验规则）
     * @param resolver   RBAC 配置类，包含权限映射规则。
     * @param tokenService      用于解码 Token
     * @param userRepository    查询用户、角色和权限
     * @param moduleRef         Nest 的 DI 容器，动态解析依赖
     */
    constructor(
        protected reflector: Reflector,
        protected resolver: RbacResolver,
        protected tokenService: TokenService,
        protected userRepository: UserRepository,
        protected moduleRef: ModuleRef,
    ) {
        super(reflector, tokenService);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authCheck = await super.canActivate(context);

        let request = context.switchToHttp().getRequest();
        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        if (!authCheck) return false;
        if (authCheck && isNil(requestToken)) return true;

        // 从控制器上提取权限检查器
        const checkers = getCheckers(context, this.reflector);
        if (isNil(checkers) || checkers.length <= 0) return true;
        // console.log('checkers===>', checkers);

        request = context.switchToHttp().getRequest();
        if (isNil(request.user)) return false;

        // 查找完整的用户数据（含权限）
        // 加载用户及其所有权限，包括：
        // 你是用 UserRepository 来查找 UserEntity，并希望同时查出：roles.permissions 、permissions
        const user = await this.userRepository.findOneOrFail({
            relations: ['roles.permissions', 'permissions'],
            where: {
                id: request.user.id,
            },
        });
        // console.log('Yf======>user', user);

        return solveChecker({
            resolver: this.resolver,
            checkers,
            moduleRef: this.moduleRef,
            user,
            request,
        });
    }
}
