import { Module } from '@nestjs/common';

import { UserService } from './services/user.service';

import * as RepositoryMaps from './repositories';
import * as entityMaps from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '../core/core.module';

const entities = Object.values(entityMaps);
const repositories = Object.values(RepositoryMaps);

@Module({
    imports: [
        TypeOrmModule.forFeature(entities),
        CoreModule.forRepository(repositories),
        // PassportModule,
        // serviceMaps.AuthService.jwtModuleFactory(),
    ],
    providers: [UserService],
    exports: [CoreModule.forRepository(repositories)],
})
export class UserModule {}
