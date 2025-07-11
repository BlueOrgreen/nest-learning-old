import { loadEntities } from '@/helpers';
import { forwardRef, Global, Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '../core/core.module';

import { UserModule } from '../user/user.module';

import * as ControllerMaps from './controllers';
import * as dtoMaps from './dtos';
import * as entityMaps from './entities';
import * as RepositoryMaps from './repositories';
import * as serviceMaps from './services';
import * as subscriberMaps from './subscribers';

const entities = Object.values(entityMaps);
const repositories = Object.values(RepositoryMaps);
const services = Object.values(serviceMaps);
const dtos = Object.values(dtoMaps);
const subscribers = Object.values(subscriberMaps);
const controllers = Object.values(ControllerMaps);

@Global()
@Module({
    imports: [
        loadEntities(entities),
        CoreModule.forRepository(repositories),
        forwardRef(() => UserModule),
    ],
    controllers,
    providers: [...dtos, ...subscribers, ...services],
    exports: [...services, CoreModule.forRepository(repositories)],
})
export class MediaModule {}
