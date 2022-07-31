/**
 * this context is used for schema.ts 
 * (for quick and efficient data access (using where, which, ...))
 * And for the ApolloServer's arguments
 */

import { PrismaClient } from '@prisma/client'

export interface Context {
  prisma: PrismaClient
}

const prisma = new PrismaClient()

export const context: Context = {
  prisma: prisma,
}
