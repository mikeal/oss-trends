import { GraphQLClient } from 'graphql-request'

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: { Authorization: `Bearer ${localStorage.githubToken}` }
})

export default {
  query: query => client.request(query)
}
