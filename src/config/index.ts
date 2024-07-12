import { loadEnvs, setRunEnv } from '@/helpers';

setRunEnv();
loadEnvs();
export * from './app.config';
export * from './database.config';
export * from './user.config';
export * from './sms.config';
