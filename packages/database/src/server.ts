import { ApolloServer } from 'apollo-server'
import { schemaThanks_db } from './schemaThanks_db'
import { context } from './context'

const server = new ApolloServer({
  schema: schemaThanks_db,
  context: context,
});

server.listen({
  port: 6969,
}).then(async ({ url }) => {
  console.log(`\
🚀 Server ready at: ${url}
⭐️ See sample queries: http://pris.ly/e/ts/graphql#using-the-graphql-api
  `)
})
