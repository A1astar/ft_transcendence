import { FastifyRequest, FastifyReply } from 'fastify';
import chalk from 'chalk';

/**
 * JWT Payload 介面 / JWT Payload Interface
 */
export interface JWTPayload {
    userId: string;
    name: string;
    email: string;
    iat?: number;
    exp?: number;
}

/**
 * JWT 認證中間件 / JWT Authentication Middleware
 * 用於保護需要認證的路由 / Used to protect routes that require authentication
 */
export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<JWTPayload | null> {
    try {
        // 嘗試從 Authorization header 讀取 token / Try to read token from Authorization header
        await request.jwtVerify();
        
        // 如果成功，user 資訊已經附加到 request.user / If successful, user info is already attached to request.user
        const user = (request as any).user as JWTPayload;
        
        if (!user) {
            reply.code(401).send({ error: 'Invalid token: user information not found' });
            return null;
        }

        console.log(chalk.cyan(`Authenticated user: ${user.name} (${user.userId})`));
        return user;
    } catch (err: any) {
        console.log(chalk.red('JWT verification failed:'), err.message);
        reply.code(401).send({ error: 'Unauthorized: Valid JWT token required' });
        return null;
    }
}

/**
 * 可選的認證中間件（不強制要求認證）/ Optional authentication middleware (does not require authentication)
 * 如果 token 存在且有效，會將 user 資訊附加到 request / If token exists and is valid, attaches user info to request
 * 如果沒有 token 或 token 無效，繼續處理但不附加 user 資訊 / If no token or token invalid, continue processing without attaching user info
 */
export async function optionalAuthenticate(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<JWTPayload | null> {
    try {
        await request.jwtVerify();
        const user = (request as any).user as JWTPayload;
        if (user) {
            console.log(chalk.cyan(`Optional auth: Authenticated user: ${user.name} (${user.userId})`));
        }
        return user || null;
    } catch (err) {
        // 如果沒有 token 或 token 無效，繼續但不附加 user 資訊 / If no token or token invalid, continue without attaching user info
        return null;
    }
}

