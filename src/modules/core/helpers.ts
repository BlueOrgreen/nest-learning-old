import dayjs from 'dayjs';

import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import localeData from 'dayjs/plugin/localeData';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { isNil } from 'lodash';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { appConfig } from '@/config';

import { EnvironmentType } from './constants';
import { OrderQueryType, PaginateDto, TimeOptions } from './types';

dayjs.extend(localeData);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(dayOfYear);

export const setRunEnv = () => {
    if (
        isNil(process.env.NODE_ENV) ||
        !Object.values(EnvironmentType).includes(process.env.NODE_ENV as EnvironmentType)
    ) {
        process.env.NODE_ENV = EnvironmentType.PRODUCTION;
    }
};

export const getRunEnv = (): EnvironmentType => {
    setRunEnv();
    return process.env.NODE_ENV as EnvironmentType;
};
/**
 * 用于请求验证中的number数据转义
 *
 * @export
 * @param {(string | number)} [value]
 * @returns {*}  {(number | undefined)}
 */
export function tNumber(value?: string | number): string | number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        try {
            return Number(value);
        } catch (error) {
            return value;
        }
    }

    return value;
}

/**
 * 用于请求验证中的boolean数据转义
 *
 * @export
 * @param {(string | boolean)} [value]
 * @return {*}
 */
export function tBoolean(value?: string | boolean): string | boolean | undefined {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value.toLowerCase());
        } catch (error) {
            return value;
        }
    }
    return value;
}

/**
 * @description 用于请求验证中转义null
 * @export
 * @param {(string | null)} [value]
 * @returns {*}  {(string | null | undefined)}
 */
export function tNull(value?: string | null): string | null | undefined {
    return value === 'null' ? null : value;
}

/**
 * 手动分页函数
 *
 * @export
 * @template T
 * @param {PaginateDto} { page, limit }
 * @param {T[]} data
 * @return {*}  {Pagination<T>}
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

export const getTime = (options?: TimeOptions) => {
    if (!options) return dayjs();
    const { date, format, locale, strict, zonetime } = options;
    const config = appConfig();
    // 每次创建一个新的时间对象
    // 如果没有传入local或timezone则使用应用配置
    const now = dayjs(date, format, locale ?? config.locale, strict).clone();
    return now.tz(zonetime ?? config.timezone);
};

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
