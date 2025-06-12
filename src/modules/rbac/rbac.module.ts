import { forwardRef, Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { addEntities } from '@/helpers';

import { CoreModule } from '../core/core.module';

import { UserModule } from '../user/user.module';

import * as controllerMaps from './controllers';
import * as EntityMaps from './entities';
import { RbacGuard } from './guards';
import * as RepositoryMaps from './repositories';
import { RbacResolver } from './resolver';
import * as serviceMaps from './services';

const entities = Object.values(EntityMaps);
const repositories = Object.values(RepositoryMaps);
const services = Object.values(serviceMaps);

@Module({
    imports: [
        forwardRef(() => UserModule),
        addEntities(entities),
        CoreModule.forRepository(repositories),
    ],
    providers: [
        ...services,
        {
            provide: APP_GUARD,
            useClass: RbacGuard,
        },
        {
            provide: RbacResolver,
            useFactory: async (dataSource: DataSource) => {
                const resolver = new RbacResolver(dataSource);
                resolver.setOptions({});
                return resolver;
            },
            inject: [getDataSourceToken()],
        },
    ],
    controllers: Object.values(controllerMaps),
    exports: [CoreModule.forRepository(repositories), RbacResolver, ...services],
})
export class RbacModule {}
