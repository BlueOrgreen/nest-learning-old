// 用户配置
export interface UserConfig {
    hash?: number;
    jwt: JwtConfig;
}
// Jwt配置
export interface JwtConfig {
    secret: string;
    token_expired: number;
    refresh_secret: string;
    refresh_token_expired: number;
}
// Jwt签名荷载
export interface JwtPayload {
    sub: string;
    iat: number;
}
