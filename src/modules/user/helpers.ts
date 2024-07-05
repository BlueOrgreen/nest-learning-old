import { userConfig } from '@/config';
import bcrypt from 'bcrypt';

export const encrypt = (password: string) => {
    return bcrypt.hashSync(password, userConfig().hash);
};

/**
 * 验证密码
 * @param password
 * @param hashed
 */
export const decrypt = (password: string, hashed: string) => {
    return bcrypt.compareSync(password, hashed);
};
