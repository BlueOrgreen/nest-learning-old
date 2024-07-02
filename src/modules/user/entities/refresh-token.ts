import { Entity, JoinColumn, OneToOne } from 'typeorm';

import { AccessTokenEntity } from './access-token';
import { BaseToken } from './base.token';

/**
 * 刷新Token的Token模型
 */
@Entity('user_refresh_tokens')
export class RefreshTokenEntity extends BaseToken {
    /**
     * @description 关联的登录令牌
     * @type {AccessTokenEntity}
     */
    @OneToOne(() => AccessTokenEntity, (accessToken) => accessToken.refreshToken, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    accessToken!: AccessTokenEntity;
}
