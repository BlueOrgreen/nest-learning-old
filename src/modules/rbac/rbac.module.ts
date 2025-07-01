import { forwardRef, Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// import { addEntities } from '@/helpers';

import { CoreModule } from '../core/core.module';

import { UserModule } from '../user/user.module';

import * as controllerMaps from './controllers';
import * as EntityMaps from './entities';
import { RbacGuard } from './guards';
import * as RepositoryMaps from './repositories';
import { RbacResolver } from './resolver';
import * as serviceMaps from './services';
import * as SubscriberMaps from './subscribers';

const entities = Object.values(EntityMaps);
const repositories = Object.values(RepositoryMaps);
const services = Object.values(serviceMaps);
const subscribers = Object.values(SubscriberMaps);
const controllers = Object.values(controllerMaps);

@Module({
    imports: [
        forwardRef(() => UserModule),
        // addEntities(entities),
        TypeOrmModule.forFeature(entities),
        CoreModule.forRepository(repositories),
    ],
    controllers,
    providers: [
        ...subscribers,
        ...services,
        {
            provide: APP_GUARD, // 把 RbacGuard 注册为全局守卫，控制所有控制器请求。
            useClass: RbacGuard,
        },
        {
            provide: RbacResolver, // 动态注册 RbacResolver，用于提供权限规则（比如哪些权限对应哪些 CASL 条件）
            useFactory: async (dataSource: DataSource) => {
                const resolver = new RbacResolver(dataSource);
                resolver.setOptions({});
                return resolver;
            },
            inject: [getDataSourceToken()],
        },
    ],
    exports: [CoreModule.forRepository(repositories), RbacResolver, ...services],
})
export class RbacModule {}
