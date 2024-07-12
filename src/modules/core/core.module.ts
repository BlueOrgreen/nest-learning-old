import { DynamicModule, ModuleMetadata, Provider, Type } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, ObjectType } from 'typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppFilter, AppInterceptor, AppPipe } from './app';
import { CUSTOM_REPOSITORY_METADATA } from './constants';
import {
    ModelExistConstraint,
    UniqueConstraint,
    UniqueExistConstraint,
    UniqueTreeConstraint,
    UniqueTreeExistConstraint,
} from './constraints';
import { CoreOptions } from './types';
import { createQueueOptions, createRedisOptions } from '@/helpers';
import { isArray, isNil, omit } from 'lodash';
import { RedisService } from './services';

export class CoreModule {
    /**
     * 注册Core模块
     * @param options
     */
    public static forRoot(options: CoreOptions = {}): DynamicModule {
        let imports: ModuleMetadata['imports'] = [];
        if (options.database) imports.push(TypeOrmModule.forRoot(options.database));
        let providers: ModuleMetadata['providers'] = [
            {
                provide: APP_PIPE,
                useFactory: () =>
                    new AppPipe({
                        transform: true,
                        forbidUnknownValues: false,
                        validationError: { target: false },
                    }),
            },
            {
                provide: APP_FILTER,
                useClass: AppFilter,
            },
            {
                provide: APP_INTERCEPTOR,
                useClass: AppInterceptor,
            },
        ];
        const exps: ModuleMetadata['exports'] = [];

        if (options.database) {
            providers = [
                ...providers,
                ModelExistConstraint,
                UniqueConstraint,
                UniqueExistConstraint,
                UniqueTreeConstraint,
                UniqueTreeExistConstraint,
            ];
        }
        if (options.redis) {
            const redis = createRedisOptions(options.redis());
            if (!isNil(redis)) {
                providers.push({
                    provide: RedisService,
                    useFactory: () => {
                        const service = new RedisService(redis);
                        service.createClients();
                        return service;
                    },
                });
                exps.push(RedisService);
                if (options.queue) {
                    const queue = createQueueOptions(options.queue(), redis);
                    console.log('queue===>', queue);
                    if (!isNil(queue)) {
                        if (isArray(queue)) {
                            imports = queue.map((v) =>
                                BullModule.forRoot(v.name, omit(v, ['name'])),
                            );
                        } else {
                            imports.push(BullModule.forRoot(queue));
                        }
                    }
                }
            }
        }
        return {
            global: true,
            imports,
            providers,
            exports: exps,
            module: CoreModule,
        };
    }

    /**
     * @description 注册自定义Repository
     * @static
     * @template T
     * @param {T[]} repositories 需要注册的自定义类列表
     * @param {string} [dataSourceName] 数据池名称,默认为默认连接
     */
    public static forRepository<T extends Type<any>>(
        repositories: T[],
        dataSourceName?: string,
    ): DynamicModule {
        const providers: Provider[] = [];

        for (const Repo of repositories) {
            const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADATA, Repo);

            if (!entity) {
                continue;
            }

            providers.push({
                inject: [getDataSourceToken(dataSourceName)],
                provide: Repo,
                useFactory: (dataSource: DataSource): typeof Repo => {
                    const base = dataSource.getRepository<ObjectType<any>>(entity);
                    return new Repo(base.target, base.manager, base.queryRunner);
                },
            });
        }

        return {
            exports: providers,
            module: CoreModule,
            providers,
        };
    }
}
