import {MongoClient, ObjectId} from 'mongodb'
import express from 'express'
import bodyParser from 'body-parser'
import {graphqlExpress, graphiqlExpress} from 'graphql-server-express'
import {makeExecutableSchema} from 'graphql-tools'
import cors from 'cors'

const URL = 'http://192.168.1.37'
const PORT = 3001
const MONGO_URL = 'mongodb://localhost:27017/blog'

const prepare = (o) => {
  o._id = o._id.toString()
  return o
}

export const start = async () => {
  try {
    const db = await MongoClient.connect(MONGO_URL)

    const Posts = db.collection('posts')
    const Comments = db.collection('comments')
    const Users = db.collection('users')

    const typeDefs = [`
      type Query {
        post(_id: String): Post
        user(_id: String): User
        userone(login: String, password: String): User
        posts: [Post]
        users: [User]
        comment(_id: String): Comment
      }

      type User {
        _id: String
        name: String
        login: String
        password: String
        posts: [Post]
      }

      type Post {
        _id: String
        title: String
        content: String
        user: User
        comments: [Comment]
      }

      type Comment {
        _id: String
        postId: String
        content: String
        post: Post
      }

      type Mutation {
        createPost(title: String, content: String, userId: String): Post
        createComment(postId: String, content: String): Comment
        createUser(login: String, password: String, name: String): User
      }

      schema {
        query: Query
        mutation: Mutation
      }
    `];

    const resolvers = {
      Query: {
        post: async (root, {_id}) => {
          return prepare(await Posts.findOne(ObjectId(_id)))
        },
        posts: async () => {
          return (await Posts.find({}).toArray()).map(prepare)
        },
        user: async (root, {_id}) => {
          return prepare(await Users.findOne(ObjectId(_id)))
        },
        userone: async (root, {login, password}) => {
          return prepare(await Users.findOne({login, password}))
        },
        users: async () => {
          return (await Users.find({}).toArray()).map(prepare)
        },
        comment: async (root, {_id}) => {
          return prepare(await Comments.findOne(ObjectId(_id)))
        },
      },
      User: {
        posts: async ({_id}) => {
          return (await Posts.find({userId: _id}).toArray()).map(prepare)
        }
      },
      Post: {
        comments: async ({_id}) => {
          return (await Comments.find({postId: _id}).toArray()).map(prepare)
        },
        user: async ({_id}) => {
          return (await Comments.find({userId: _id}).toArray()).map(prepare)
        }
      },
      Comment: {
        post: async ({postId}) => {
          return prepare(await Posts.findOne(ObjectId(postId)))
        }
      },
      Mutation: {
        createPost: async (root, args, context, info) => {
          const res = await Posts.insert(args)
          return prepare(await Posts.findOne({_id: res.insertedIds[1]}))
        },
        createComment: async (root, args) => {
          const res = await Comments.insert(args)
          return prepare(await Comments.findOne({_id: res.insertedIds[1]}))
        },
        createUser: async (root, args, context, info) => {
          const res = await Users.insert(args)
          return prepare(await Users.findOne({_id:res.insertedIds[1]}))
        }
      },
    }

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers
    })

    const app = express()

    app.use(cors())

    app.use('/graphql', bodyParser.json(), graphqlExpress({schema}))

    const homePath = '/graphiql'

    app.use(homePath, graphiqlExpress({
      endpointURL: '/graphql'
    }))

    app.listen(PORT, () => {
      console.log(`Visit ${URL}:${PORT}${homePath}`)
    })

  } catch (e) {
    console.log(e)
  }

}
