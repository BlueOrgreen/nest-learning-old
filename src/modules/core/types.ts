/**
 * 一个类的类型
 */
import { Type } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ClassTransformOptions } from 'class-transformer';
import dayjs from 'dayjs';
import Email from 'email-templates';
import { IPaginationMeta, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { FindTreeOptions, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { Attachment } from 'nodemailer/lib/mailer';
import { OrderType, QueryTrashMode } from './constants';
import { QueueOptions, RedisOptions } from '@/helpers/types';

export type ClassType<T> = { new (...args: any[]): T };
export type ClassToPlain<T> = { [key in keyof T]: T[key] };
/**
 * 嵌套对象
 */
export type NestedRecord = Record<string, Record<string, any>>;
/**
 * 空对象
 */
export type RecordNever = Record<never, never>;

/**
 * 发送接口参数
 */
export interface SmsSendParams {
    appid?: string;
    numbers: string[];
    template: string;
    sign?: string;
    endpoint?: string;
    vars?: Record<string, any>;
    ExtendCode?: string;
    SessionContext?: string;
    SenderId?: string;
}

/**
 * 腾讯云短信驱动配置
 */
export type SmsOptions<T extends NestedRecord = RecordNever> = {
    secretId: string;
    secretKey: string;
    sign: string;
    appid: string;
    region: string;
    endpoint?: string;
} & T;

/**
 * SMTP邮件发送配置
 */
export type SmtpOptions<T extends NestedRecord = RecordNever> = {
    host: string;
    user: string;
    password: string;
    // Email模板总路径
    resource: string;
    from?: string;
    port?: number;
    secure?: boolean;
} & T;

/**
 * 公共发送接口配置
 */
export interface SmtpSendParams {
    // 模板名称
    name?: string;
    // 发信地址
    from?: string;
    // 主题
    subject?: string;
    // 目标地址
    to: string | string[];
    // 回信地址
    reply?: string;
    // 是否加载html模板
    html?: boolean;
    // 是否加载text模板
    text?: boolean;
    // 模板变量
    vars?: Record<string, any>;
    // 是否预览
    preview?: boolean | Email.PreviewEmailOpts;
    // 主题前缀
    subjectPrefix?: string;
    // 附件
    attachments?: Attachment[];
}

export interface CoreOptions {
    database?: TypeOrmModuleOptions;
    queue?: () => QueueOptions;
    sms?: () => SmsOptions;
    smtp?: () => SmtpOptions;
    redis?: () => RedisOptions;
}
/** ****************************** 数据请求 **************************** */
/**
 * 分页验证DTO接口
 *
 * @export
 * @interface PaginateDto
 */
export interface PaginateDto<C extends IPaginationMeta = IPaginationMeta>
    extends Omit<IPaginationOptions<C>, 'page' | 'limit'> {
    page: number;
    limit: number;
}

/**
 * 软删除DTO接口
 */
export interface TrashedDto {
    trashed?: QueryTrashMode;
}

/** ****************************** 数据操作 **************************** */

/**
 * 为query添加查询的回调函数接口
 */
export type QueryHook<Entity> = (
    hookQuery: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

export interface TimeOptions {
    date?: dayjs.ConfigType;
    format?: dayjs.OptionType;
    locale?: string;
    strict?: boolean;
    zonetime?: string;
}

export interface AppConfig {
    timezone: string;
    locale: string;
}

/**
 * 排序类型,{字段名称: 排序方法}
 * 如果多个值则传入数组即可
 * 排序方法不设置,默认DESC
 */
export type OrderQueryType =
    | string
    | { name: string; order: `${OrderType}` }
    | Array<{ name: string; order: `${OrderType}` } | string>;

/**
 * 数据列表查询类型
 */
export interface QueryParams<E extends ObjectLiteral> {
    addQuery?: (query: SelectQueryBuilder<E>) => SelectQueryBuilder<E>;
    orderBy?: OrderQueryType;
    withTrashed?: boolean;
}

/**
 * 树形数据表查询参数
 */
export type TreeQueryParams<E extends ObjectLiteral> = FindTreeOptions & QueryParams<E>;

/**
 * 服务类数据列表查询类型
 */
export type QueryListParams<E extends ObjectLiteral> = Omit<TreeQueryParams<E>, 'withTrashed'> & {
    trashed?: `${QueryTrashMode}`;
};

/**
 * subscriber设置属性
 */
export type SubscriberSetting = {
    // 监听的模型是否为树模型
    tree?: boolean;
    // 是否支持软删除
    trash?: boolean;
};

/**
 * CURD控制器方法列表
 */
export type CurdMethod =
    | 'detail'
    | 'delete'
    | 'restore'
    | 'list'
    | 'store'
    | 'update'
    | 'deleteMulti'
    | 'restoreMulti';

/**
 * CRUD装饰器的方法选项
 */
export interface CrudMethodOption {
    /**
     * 该方法是否允许匿名访问
     */
    allowGuest?: boolean;
    /**
     * 序列化选项,如果为`noGroup`则不传参数，否则根据`id`+方法匹配来传参
     */
    serialize?: ClassTransformOptions | 'noGroup';
}
/**
 * 每个启用方法的配置
 */
export interface CurdItem {
    name: CurdMethod;
    option?: CrudMethodOption;
}

/**
 * CRUD装饰器选项
 */
export interface CurdOptions {
    id: string;
    // 需要启用的方法
    enabled: Array<CurdMethod | CurdItem>;
    // 一些方法要使用到的自定义DTO
    dtos: {
        [key in 'query' | 'create' | 'update']?: Type<any>;
    };
}
