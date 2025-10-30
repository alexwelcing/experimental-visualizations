import 'dotenv/config'
import Fastify from 'fastify'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter } from './routers/_app'
import { createContext } from './trpc'

const server = Fastify({
  maxParamLength: 5000,
})

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
})

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001')
    await server.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 tRPC API server listening on port ${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
