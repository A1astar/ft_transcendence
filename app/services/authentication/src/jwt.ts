import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import color from 'chalk';
import { User } from './user.js';

// JWT Payload 介面 / JWT Payload Interface
export interface JWTPayload {
    userId: string;
    name: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Token 回應介面 / Token Response Interface
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // 秒數 / seconds
}

// Refresh Token 存儲（生產環境應該使用 Redis 或資料庫）/ Refresh Token storage (production should use Redis or database)
const refreshTokens = new Map<string, { userId: string; expiresAt: number }>();

/**
 * 生成 Access Token 和 Refresh Token / Generate Access Token and Refresh Token
 */
export async function generateTokens(
    fastify: FastifyInstance,
    user: User
): Promise<TokenResponse> {
    const payload: JWTPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
    };

    // 生成 Access Token (15 分鐘) / Generate Access Token (15 minutes)
    const accessToken = fastify.jwt.sign(payload, { expiresIn: '15m' });

    // 生成 Refresh Token (7 天) / Generate Refresh Token (7 days)
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 天後 / 7 days later

    // 存儲 Refresh Token / Store Refresh Token
    refreshTokens.set(refreshToken, {
        userId: user.id,
        expiresAt,
    });

    console.log(color.green(`Generated tokens for user: ${user.name} (${user.id})`));

    return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 分鐘 = 900 秒 / 15 minutes = 900 seconds
    };
}

/**
 * 驗證 Refresh Token / Validate Refresh Token
 */
export function validateRefreshToken(refreshToken: string): { userId: string } | null {
    const tokenData = refreshTokens.get(refreshToken);

    if (!tokenData) {
        console.log(color.red('Refresh token not found'));
        return null;
    }

    // 檢查是否過期 / Check if expired
    if (Date.now() > tokenData.expiresAt) {
        console.log(color.red('Refresh token expired'));
        refreshTokens.delete(refreshToken);
        return null;
    }

    return { userId: tokenData.userId };
}

/**
 * 撤銷 Refresh Token / Revoke Refresh Token
 */
export function revokeRefreshToken(refreshToken: string): void {
    refreshTokens.delete(refreshToken);
    console.log(color.yellow('Refresh token revoked'));
}

/**
 * 清除過期的 Refresh Token（定期清理任務）/ Cleanup expired Refresh Tokens (periodic cleanup task)
 */
export function cleanupExpiredTokens(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, data] of refreshTokens.entries()) {
        if (now > data.expiresAt) {
            refreshTokens.delete(token);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(color.yellow(`Cleaned up ${cleaned} expired refresh tokens`));
    }
}

/**
 * JWT 驗證裝飾器/中間件 / JWT Authentication Decorator/Middleware
 * 用於保護需要認證的路由 / Used to protect routes that require authentication
 */
export async function authenticateUser(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        // 嘗試從 Authorization header 讀取 token / Try to read token from Authorization header
        await request.jwtVerify();
    } catch (err: any) {
        // 如果 header 中沒有 token，嘗試從 cookie 讀取 / If no token in header, try reading from cookie
        if (request.cookies['accessToken']) {
            try {
                // 手動驗證 cookie 中的 token / Manually verify token in cookie
                const decoded = request.server.jwt.verify<JWTPayload>(
                    request.cookies['accessToken']
                );
                // 將解碼的資訊附加到 request 上 / Attach decoded information to request
                (request as any).user = decoded;
                return;
            } catch (cookieErr) {
                reply.code(401).send({ error: 'Invalid or expired token' });
                return;
            }
        }

        reply.code(401).send({ error: 'Unauthorized: Token required' });
        return;
    }
}

/**
 * 可選的認證中間件（不強制要求認證）/ Optional authentication middleware (does not require authentication)
 * 如果 token 存在且有效，會將 user 資訊附加到 request / If token exists and is valid, attaches user info to request
 */
export async function optionalAuth(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        await request.jwtVerify();
    } catch (err) {
        // 如果沒有 token 或 token 無效，繼續但不附加 user 資訊 / If no token or token invalid, continue without attaching user info
        if (request.cookies['accessToken']) {
            try {
                const decoded = request.server.jwt.verify<JWTPayload>(
                    request.cookies['accessToken']
                );
                (request as any).user = decoded;
            } catch (cookieErr) {
                // 忽略錯誤，繼續處理 / Ignore error and continue processing
            }
        }
    }
}

// 每小時清理一次過期的 token / Cleanup expired tokens every hour
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
}

