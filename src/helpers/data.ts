import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { isNil } from 'lodash';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';
import { DataSource, DataSourceOptions, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { ADDTIONAL_RELATIONS } from '@/modules/core/constants';
import { DynamicRelation } from '@/modules/core/types';

import { OrderQueryType, PaginateDto } from './types';

/**
 * 手动分页函数
 * @param param0
 * @param data
 */
export function manualPaginate<T extends ObjectLiteral>(
    { page, limit }: PaginateDto,
    data: T[],
): Pagination<T> {
    let items: T[] = [];
    const totalItems = data.length;
    const totalRst = totalItems / limit;
    const totalPages =
        totalRst > Math.floor(totalRst) ? Math.floor(totalRst) + 1 : Math.floor(totalRst);
    let itemCount = 0;
    if (page <= totalPages) {
        itemCount = page === totalPages ? totalItems - (totalPages - 1) * limit : limit;
        const start = (page - 1) * limit;
        items = data.slice(start, start + itemCount);
    }
    const meta: IPaginationMeta = {
        itemCount,
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
    };
    return {
        meta,
        items,
    };
}

export const getOrderByQuery = <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    alias: string,
    orderBy?: OrderQueryType,
) => {
    if (isNil(orderBy)) return qb;
    if (typeof orderBy === 'string') return qb.orderBy(`${alias}.${orderBy}`, 'DESC');
    if (Array.isArray(orderBy)) {
        let q = qb;
        const i = 0;
        for (const item of orderBy) {
            if (i === 0) {
                q =
                    typeof item === 'string'
                        ? q.orderBy(`${alias}.${item}`, 'DESC')
                        : q.orderBy(`${alias}.${item}`, item.order);
            } else {
                q =
                    typeof item === 'string'
                        ? q.addOrderBy(`${alias}.${item}`, 'DESC')
                        : q.addOrderBy(`${alias}.${item}`, item.order);
            }
        }
        return q;
    }
    return qb.orderBy(`${alias}.${(orderBy as any).name}`, (orderBy as any).order);
};

export const loadEntities = (
    entities: EntityClassOrSchema[] = [],
    dataSource?: DataSource | DataSourceOptions | string,
) => {
    console.log('entities', entities);

    const es = entities.map((e) => {
        // 动态关联实现逻辑为读取ADDTIONAL_RELATIONS常量，
        // 通过该常量存储的值来添加关联的column字段与关联关系，
        // 最后把修改后的类通过TypeOrmModule.forFeature加载
        const relationsRegister = Reflect.getMetadata(ADDTIONAL_RELATIONS, e);

        if ('prototype' in e && relationsRegister && typeof relationsRegister === 'function') {
            const relations: DynamicRelation[] = relationsRegister();
            console.log('relations===>', relations, e);
            relations.forEach(({ column, relation }) => {
                const cProperty = Object.getOwnPropertyDescriptor(e.prototype, column);
                if (!cProperty) {
                    Object.defineProperty(e.prototype, column, {
                        writable: true,
                    });
                    relation(e.prototype, column);
                }
            });
        }
        return e;
    });
    return TypeOrmModule.forFeature(es, dataSource);
};

/** ****************************** 类注册及读取 **************************** */

/**
 * 在模块上注册entity
 * @param entities entity类列表
 * @param dataSource 数据连接名称,默认为default
 */
export const addEntities = (entities: EntityClassOrSchema[] = [], dataSource = 'default') => {
    /**
     * 为有动态关联的entity添加动态关联
     */
    const es = entities.map((e) => {
        const relationsRegister = Reflect.getMetadata(ADDTIONAL_RELATIONS, e);
        if ('prototype' in e && relationsRegister && typeof relationsRegister === 'function') {
            const relations: DynamicRelation[] = relationsRegister();
            relations.forEach(({ column, relation, others }) => {
                const cProperty = Object.getOwnPropertyDescriptor(e.prototype, column);
                if (!cProperty) {
                    Object.defineProperty(e.prototype, column, {
                        writable: true,
                    });
                    relation(e.prototype, column);
                    if (!isNil(others)) {
                        for (const other of others) {
                            other(e.prototype, column);
                        }
                    }
                }
            });
        }
        return e;
    });
    return TypeOrmModule.forFeature(es, dataSource);
};
