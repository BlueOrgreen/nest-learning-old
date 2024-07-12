import { QueueOptions } from '@/helpers/types';

// # bullmq消息队列配置
export const queue: () => QueueOptions = () => ({
    redis: 'default',
});
