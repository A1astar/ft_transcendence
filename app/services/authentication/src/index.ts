import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';

// import HashiCorpVault from 'node-vault';

import crypto from 'crypto';
import color from 'chalk';

import { initAuthenticationService } from './init.js';
import { RegistrationFormat, AuthenticationFormat } from './format.js';
import Database, { SQLiteDatabase } from "./database.js";
import { printRequest } from './print.js';
import { User } from "./user.js";
import { generateTokens, validateRefreshToken, revokeRefreshToken } from './jwt.js';
import { hashPassword, verifyPassword } from './password.js';


function printSession(request: FastifyRequest) {
    console.log(color.bold.white('Session ID:'));
    console.log(color.bold.white('Cookie ID:'));
}

async function logAccount(
    request: FastifyRequest,
    reply: FastifyReply,
    database: Database,
    sqlite: SQLiteDatabase,
    fastify: FastifyInstance
): Promise<void> {
    console.log(color.bold.italic.yellow("----- LOGIN -----"));
    
    try {
        const loginData = request.body as AuthenticationFormat & { password: string };
        
        if (!loginData.name && !loginData.email) {
            reply.code(400).send({ error: 'Username or email is required' });
            return;
        }

        if (!loginData.password) {
            reply.code(400).send({ error: 'Password is required' });
            return;
        }

        // Find user (by username or email)
        let user: User | undefined;
        if (loginData.name) {
            user = database.getUser(loginData.name);
        }
        
        if (!user && loginData.email) {
            // Find user by email
            user = (database as any).getUserByEmail(loginData.email);
        }

        if (!user) {
            console.log(color.red('User not found'));
            reply.code(401).send({ error: 'Invalid credentials' });
            return;
        }

        // Verify password
        const isValidPassword = await verifyPassword(loginData.password, user.passwordHash);
        
        if (!isValidPassword) {
            console.log(color.red('Invalid password'));
            reply.code(401).send({ error: 'Invalid credentials' });
            return;
        }

        // Generate JWT tokens
        const tokens = await generateTokens(fastify, user);

        // Set HTTP-only cookie for Access Token
        reply.setCookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production', // Use HTTPS in production
            sameSite: 'strict',
            maxAge: tokens.expiresIn, // 15 minutes
            path: '/',
        });

        // Set HTTP-only cookie for Refresh Token
        reply.setCookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        // Return tokens and user information
        reply.code(200).send({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
            },
        });

        console.log(color.green(`User logged in: ${user.name} (${user.id})`));
    } catch (error: any) {
        console.error(color.red('Login error:'), error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}

function registerOAuth(path: string, request: FastifyRequest,
        reply: FastifyReply, database: Database, sqlite: SQLiteDatabase) {
    let provider;
    const oauthMatch = path?.match(/^\/api\/auth\/oauth\/(\w+)/);

    if (oauthMatch) {
        provider = oauthMatch[1];
        console.log(color.bold.blue(provider));
    }

    switch (provider) {
        case 'intra42':
            console.log(color.bold.cyan('intra42'));
            break;
        default:
            reply.code(409).send({ error: "Wrong oauth provider." });
    }
}

async function registerAccount(
    request: FastifyRequest,
    reply: FastifyReply,
    database: Database,
    sqlite: SQLiteDatabase,
    fastify: FastifyInstance
): Promise<void> {
    console.log(color.bold.italic.yellow("----- REGISTER -----"));
    
    try {
        const registerData = request.body as RegistrationFormat;
        
        // Validate input
        if (!registerData.name || !registerData.email || !registerData.password) {
            reply.code(400).send({ error: 'Name, email, and password are required' });
            return;
        }

        // Validate email format (simple check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerData.email)) {
            reply.code(400).send({ error: 'Invalid email format' });
            return;
        }

        // Validate password length (at least 8 characters)
        if (registerData.password.length < 8) {
            reply.code(400).send({ error: 'Password must be at least 8 characters long' });
            return;
        }

        // Hash password
        const passwordHash = await hashPassword(registerData.password);

        // Register user
        const user = await database.registerUser(registerData, passwordHash);

        // Generate JWT tokens
        const tokens = await generateTokens(fastify, user);

        // Set HTTP-only cookies
        reply.setCookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict',
            maxAge: tokens.expiresIn,
            path: '/',
        });

        reply.setCookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        // Return tokens and user information
        reply.code(201).send({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
            },
        });

        console.log(color.green(`User registered: ${user.name} (${user.id})`));
    } catch (error: any) {
        console.error(color.red('Registration error:'), error);
        
        if (error.message.includes('already exists')) {
            reply.code(409).send({ error: error.message });
        } else {
            reply.code(500).send({ error: 'Internal server error' });
        }
    }
}

async function refreshAccessToken(
    request: FastifyRequest,
    reply: FastifyReply,
    database: Database,
    fastify: FastifyInstance
): Promise<void> {
    console.log(color.bold.italic.cyan("----- REFRESH TOKEN -----"));
    
    try {
        const refreshToken = request.cookies['refreshToken'] || (request.body as any)?.refreshToken;
        
        if (!refreshToken) {
            reply.code(401).send({ error: 'Refresh token is required' });
            return;
        }

        // Validate refresh token
        const tokenData = validateRefreshToken(refreshToken);
        
        if (!tokenData) {
            reply.code(401).send({ error: 'Invalid or expired refresh token' });
            return;
        }

        // Get user information
        const user = database.getUserById(tokenData.userId);
        
        if (!user) {
            reply.code(401).send({ error: 'User not found' });
            return;
        }

        // Generate new tokens
        const tokens = await generateTokens(fastify, user);

        // Revoke old refresh token
        revokeRefreshToken(refreshToken);

        // Set new cookies
        reply.setCookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict',
            maxAge: tokens.expiresIn,
            path: '/',
        });

        reply.setCookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        reply.code(200).send({
            success: true,
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
            },
        });

        console.log(color.green(`Token refreshed for user: ${user.name} (${user.id})`));
    } catch (error: any) {
        console.error(color.red('Refresh token error:'), error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}

async function logout(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    console.log(color.bold.italic.magenta("----- LOGOUT -----"));
    
    const refreshToken = request.cookies['refreshToken'];
    
    if (refreshToken) {
        revokeRefreshToken(refreshToken);
    }

        // Clear cookies
    reply.clearCookie('accessToken', { path: '/' });
    reply.clearCookie('refreshToken', { path: '/' });

    reply.code(200).send({ success: true, message: 'Logged out successfully' });
}

async function manageRequest(fastify: FastifyInstance,
                    database: Database, sqlite: SQLiteDatabase) {

    fastify.all('/*', async(request, reply) => {
        const path = request.raw.url;
        console.log()

        switch (path) {
            case "/api/auth/login":
                await logAccount(request, reply, database, sqlite, fastify);
                break;
            case "/api/auth/register":
                await registerAccount(request, reply, database, sqlite, fastify);
                break;
            case "/api/auth/refresh":
                await refreshAccessToken(request, reply, database, fastify);
                break;
            case "/api/auth/logout":
                await logout(request, reply);
                break;
            case path?.startsWith('/api/auth/oauth'):
                if (path)
                    registerOAuth(path, request, reply, database, sqlite);
                break;
            default:
                reply.code(404).send({ error: "Route not found "});
                break;
        }
    });
}

async function main() {
    try {
        const fastify = await initAuthenticationService();
        const database = new Database();
        const sqlite = new SQLiteDatabase();
        
        // Add all routes first, then start service
        await manageRequest(fastify, database, sqlite);

        // Add a protected route example (optional)
        fastify.get('/api/protected', async (request, reply) => {
            const { authenticate } = await import('./middleware.js');
            const user = await authenticate(request, reply);
            
            if (!user) {
                return; // authenticate has already sent the error response
            }

            reply.code(200).send({
                message: `Hello ${user.name}!`,
                userId: user.userId,
                email: user.email,
            });
        });

        // Start service after all routes are added
        await fastify.listen({ port: 3001, host: "0.0.0.0" });
        console.log(color.green.bold("Authentication service listening on http://0.0.0.0:3001"));
        console.log(color.green.bold("Authentication state: running"));

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();