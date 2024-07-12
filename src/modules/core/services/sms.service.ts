import { Injectable } from '@nestjs/common';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { SmsOptions, SmsSendParams } from '../types';
import { deepMerge } from '@/helpers';
import { SendSmsRequest } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_models';

const SmsClient = tencentcloud.sms.v20210111.Client;

/**
 * 腾讯云短信驱动
 */
@Injectable()
export class SmsService {
    /**
     * 初始化配置
     * @param options 短信发送选项
     */
    constructor(protected readonly options: SmsOptions) {}

    /**
     * 合并配置并发送短信
     * @param params 短信发送参数
     * @param options 自定义驱动选项(可用于临时覆盖默认选项)
     */
    async send<T>(params: SmsSendParams & T, options?: SmsOptions) {
        const newOptions = deepMerge(this.options, options ?? {}) as SmsOptions;
        const client = this.makeClient(newOptions);
        return client.SendSms(this.transSendParams(params, newOptions));
    }

    /**
     * 创建短信发送驱动实例
     * @param options 驱动选项
     */
    protected makeClient(options: SmsOptions) {
        const { secretId, secretKey, region, endpoint } = options;
        return new SmsClient({
            credential: { secretId, secretKey },
            region,
            profile: {
                httpProfile: {
                    endpoint: endpoint ?? 'sms.tencentcloudapi.com',
                },
            },
        });
    }

    /**
     * 转义通用发送参数为腾讯云短信服务发送参数
     * @param params 发送参数
     * @param options 驱动选项
     */
    protected transSendParams(params: SmsSendParams, options: SmsOptions): SendSmsRequest {
        const { numbers, template, vars, appid, sign, ...others } = params;
        let paramSets: Record<string, any> = {};
        if (vars) {
            paramSets = Object.fromEntries(
                Object.entries(vars).map(([key, value]) => [key, value.toString()]),
            );
        }
        return {
            PhoneNumberSet: numbers.map((n) => {
                const phoneArr: string[] = n.split('.');
                return `${phoneArr[0]}${phoneArr[1]}`;
            }),
            TemplateId: template,
            SmsSdkAppId: appid ?? options.appid,
            SignName: sign ?? options.sign,
            TemplateParamSet: Object.values(paramSets),
            ...(others ?? {}),
        };
    }
}
