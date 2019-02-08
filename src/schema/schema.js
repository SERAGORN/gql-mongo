import typeDefs from './typeDefs'
import resolvers from './resolvers'

export default schema = async () => makeExecutableSchema({
    typeDefs,
    resolvers
})