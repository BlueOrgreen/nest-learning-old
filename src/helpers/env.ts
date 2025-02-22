import fs from 'fs';

import dotenv from 'dotenv';
import findUp from 'find-up';
import { isFunction, isNil } from 'lodash';

import { EnvironmentType } from './constants';

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

// 基础类型接口
type BaseType = boolean | number | string | undefined | null;
// 环境变量类型转义函数接口
type ParseType<T extends BaseType = string> = (value: string) => T;

/**
 * 获取全部环境变量
 *
 * @export
 * @returns {{ [key: string]: string }}
 */
export function env(): { [key: string]: string };
/**
 * 直接获取环境变量
 *
 * @export
 * @template T
 * @param {string} key
 * @returns {T}
 */
export function env<T extends BaseType = string>(key: string): T;

/**
 * 获取类型转义后的环境变量
 *
 * @export
 * @template T
 * @param {string} key
 * @param {ParseType<T>} parseTo
 * @returns {T}
 */
export function env<T extends BaseType = string>(key: string, parseTo: ParseType<T>): T;

/**
 *获取环境变量,不存在则获取默认值
 *
 * @export
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {T}
 */
export function env<T extends BaseType = string>(key: string, defaultValue: T): T;

/**
 *获取类型转义后的环境变量,不存在则获取默认值
 *
 * @export
 * @template T
 * @param {string} key
 * @param {ParseType<T>} parseTo
 * @param {T} defaultValue
 * @returns {T}
 */
export function env<T extends BaseType = string>(
    key: string,
    parseTo: ParseType<T>,
    defaultValue: T,
): T;

/**
 * 获取环境变量的具体实现
 *
 * @export
 * @template T
 * @param {string} key
 * @param {(ParseType<T> | T)} [parseTo]
 * @param {T} [defaultValue]
 * @returns
 */
export function env<T extends BaseType = string>(
    key?: string,
    parseTo?: ParseType<T> | T,
    defaultValue?: T,
) {
    if (!key) return process.env;
    const value = process.env[key];
    if (value !== undefined) {
        if (parseTo && isFunction(parseTo)) {
            return parseTo(value);
        }
        return value as T;
    }
    if (parseTo === undefined && defaultValue === undefined) {
        return undefined;
    }
    if (parseTo && defaultValue === undefined) {
        return isFunction(parseTo) ? undefined : parseTo;
    }
    return defaultValue! as T;
}

export function loadEnvs() {
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = EnvironmentType.PRODUCTION;
    }
    const search = [findUp.sync(['.env'])];
    // console.log(process.env.NODE_ENV);

    if (process.env.NODE_ENV !== EnvironmentType.PRODUCTION) {
        search.push(findUp.sync([`.env.${process.env.NODE_ENV}`]));
    }
    // console.log('search===>', search);
    const envFiles = search.filter((file) => file !== undefined) as string[];
    // console.log(
    //     'dovenv===>',
    //     envFiles.map((itemPath) => dotenv.parse(fs.readFileSync(itemPath))),
    // );

    // 所有文件中配置的环境变量
    const fileEnvs = envFiles
        .map((filePath) => dotenv.parse(fs.readFileSync(filePath)))
        .reduce(
            (oc, nc) => ({
                ...oc,
                ...nc,
            }),
            {},
        );
    // 与系统环境变量合并后赋值给一个常量
    const envs = { ...process.env, ...fileEnvs };
    // 过滤掉在envs中存在而在process.env中不存在的值
    const keys = Object.keys(envs).filter((key) => !(key in process.env));
    // 把.env*中存在而系统环境变量中不存在的值追加到process.env中
    keys.forEach((key) => {
        process.env[key] = envs[key];
    });
}
