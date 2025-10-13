import Fastify, { FastifyInstance } from 'fastify'
import chalk from 'chalk'
import oauthPlugin from '@fastify/oauth2'

export function manageSession(fastify: FastifyInstance) {
    console.log(chalk.blue.bold("/auth/session"));
    return;
}