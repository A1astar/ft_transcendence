import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from './jwt.js';
import color from 'chalk';

/**
 * JWT 認證中間件 / JWT Authentication Middleware
 * 用於保護需要認證的路由 / Used to protect routes that require authentication
 * 使用方式：在路由處理函數前調用 await authenticate(request, reply) / Usage: call await authenticate(request, reply) before route handler function
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

        console.log(color.cyan(`Authenticated user: ${user.name} (${user.userId})`));
        return user;
    } catch (err: any) {
        // 如果 header 中沒有 token，嘗試從 cookie 讀取 / If no token in header, try reading from cookie
        if (request.cookies['accessToken']) {
            try {
                const token = request.cookies['accessToken'];
                const decoded = request.server.jwt.verify<JWTPayload>(token);
                
                // 將解碼的資訊附加到 request 上 / Attach decoded information to request
                (request as any).user = decoded;
                
                console.log(color.cyan(`Authenticated user via cookie: ${decoded.name} (${decoded.userId})`));
                return decoded;
            } catch (cookieErr: any) {
                console.log(color.yellow('Cookie token verification failed:', cookieErr.message));
                reply.code(401).send({ error: 'Invalid or expired token' });
                return null;
            }
        }

        console.log(color.red('No valid token found'));
        reply.code(401).send({ error: 'Unauthorized: Authentication required' });
        return null;
    }
}

/**
 * 可選的認證中間件（不強制要求認證）/ Optional authentication middleware (does not require authentication)
 * 如果 token 存在且有效，會將 user 資訊附加到 request / If token exists and is valid, attaches user info to request
 * 如果沒有 token 或 token 無效，繼續處理但不附加 user 資訊 / If no token or token invalid, continue processing without attaching user info
 */
export async function optionalAuth(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<JWTPayload | null> {
    try {
        await request.jwtVerify();
        return (request as any).user as JWTPayload;
    } catch (err) {
        // 嘗試從 cookie 讀取 / Try reading from cookie
        if (request.cookies['accessToken']) {
            try {
                const decoded = request.server.jwt.verify<JWTPayload>(
                    request.cookies['accessToken']
                );
                (request as any).user = decoded;
                return decoded;
            } catch (cookieErr) {
                // 忽略錯誤，繼續處理 / Ignore error and continue processing
                return null;
            }
        }
        return null;
    }
}

/**
 * 檢查用戶是否擁有特定角色（用於未來擴展）/ Check if user has specific role (for future expansion)
 */
export function requireRole(role: string) {
    return async (request: FastifyRequest, reply: FastifyReply): Promise<boolean> => {
        const user = await authenticate(request, reply);
        
        if (!user) {
            return false;
        }

        // 這裡可以根據實際需求檢查用戶角色 / Here we can check user role based on actual requirements
        // 目前 User 類別沒有 role 欄位，可以在未來添加 / Currently User class doesn't have role field, can be added in the future
        // const userRole = (user as any).role;
        // if (userRole !== role) {
        //     reply.code(403).send({ error: `Access denied: ${role} role required` });
        //     return false;
        // }

        return true;
    };
}

/**
 * 示例：保護的路由處理函數 / Example: Protected route handler function
 * 
 * 使用方式：/ Usage:
 * fastify.get('/api/protected', async (request, reply) => {
 *     const user = await authenticate(request, reply);
 *     if (!user) return; // 如果認證失敗，authenticate 已經發送了錯誤回應 / If authentication fails, authenticate has already sent error response
 *     
 *     // 繼續處理請求 / Continue processing request
 *     return { message: `Hello ${user.name}!`, userId: user.userId };
 * });
 */
export async function protectedRouteExample(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const user = await authenticate(request, reply);
    
    if (!user) {
        return; // authenticate 已經發送了錯誤回應 / authenticate has already sent error response
    }

    // 繼續處理請求 / Continue processing request
    reply.code(200).send({
        message: `Hello ${user.name}!`,
        userId: user.userId,
        email: user.email,
    });
}

