import Fastify, { FastifyInstance } from 'fastify'
import chalk from 'chalk'

export function manageVault(fastify: FastifyInstance) {
    console.log(chalk.blue.bold("/auth/vault"));
    return;
}