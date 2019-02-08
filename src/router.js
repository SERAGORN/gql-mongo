import express from 'express'
import { createServer } from 'http';
import cors from 'cors'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import schema from './schema/schema'

export default class Router {
    constructor() {
        this.URL = 'http://localhost'
        this.PORT = 3001
        this.homePath = '/graphiql'
        this.start()
    }

    start() {
        try {
        this.app = express()
        this.app.use(cors())
        this.app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))


        this.app.use(homePath, graphiqlExpress({
            endpointURL: '/graphql',
            subscriptionsEndpoint: `ws://localhost:${this.PORT}/subscriptions`
        }))
        this.app.listen(this.PORT, () => {
            console.log(`Visit ${this.URL}:${this.PORT}${this.homePath}`)
        })

        } catch (e) {
            console.log(e)
        }
    }    
}