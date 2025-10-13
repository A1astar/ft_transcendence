import Fastify, { FastifyInstance } from 'fastify'
import chalk from 'chalk'
import jwt from '@fastify/jwt'

export function manageJWT(fastify: FastifyInstance) {
    console.log(chalk.blue.bold("/auth/jwt"));
    return;
}