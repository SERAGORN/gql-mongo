import { MongoClient, ObjectId } from 'mongodb'
import express from 'express'
import socketio from 'socket.io'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import cors from 'cors'

const URL = 'http://localhost'
const PORT = 3001
const MONGO_URL = 'mongodb://localhost:27017/subj_control'

const prepare = (o) => {
    o._id = o._id.toString()
    return o
}

export const goOnSpl = async () => {
    try {
        const as = "asd"
        const db = await MongoClient.connect(MONGO_URL)

        const Subjects = db.collection('subjects')
        const Tasks = db.collection('tasks')

        const typeDefs = [`
        type Query {
            task(_id: String): Task
            subject(_id: String): Subject
            subjectofteach(teacher: String): Subject
            tasks: [Task]
            subjects(teacher: String): [Subject]
            subjects(day: String): [Subject]
        }

        type Subject {
            _id: String
            title: String
            teacher: String
            day: String
            date: String
            tasks: [Task]
        }


        type Task {
            _id: String
            title: String
            content: String
            subjectId: Subject
        }

        type Mutation {
            createTask(title: String, content: String, subjectId: String): Task
            createSubject(title: String, teacher: String, date: String): Subject
            updateSubject(_id: String, days: String): Subject
        }

        schema {
            query: Query
            mutation: Mutation
        }
    `];

        const resolvers = {
            Query: {
                task: async (root, { _id }) => {
                    return prepare(await Tasks.findOne(ObjectId(_id)))
                },
                tasks: async () => {
                    return (await Tasks.find({}).toArray()).map(prepare)
                },
                subject: async (root, { _id }) => {
                    return prepare(await Subjects.findOne(ObjectId(_id)))
                },
                // userone: async (root, { login, password }) => {
                //     return prepare(await Users.findOne({ login, password }))
                // },
                subjects: async (root, {teacher, day}) => {

                    if (teacher != undefined) {
                        console.log(teacher)
                        return (await Subjects.find({teacher: teacher}).toArray()).map(prepare)
                    } else if (day != undefined) {
                        console.log(day)
                        return (await Subjects.find({day:   {'$regex': day}}).toArray()).map(prepare)
                    } else {
                        return (await Subjects.find({}).toArray()).map(prepare)
                    }
                },
                subjectofteach: async (root, {teacher}) => {
                    return prepare(await Subjects.findOne(ObjectId(teacher)).toArray()).map(prepare)
                }
                // subject: async (root, {teacher}) => {
                //     return prepare(await Subjects.findOne(ObjectId(teacher)).toArray()).map(prepare)
                // }
            },
            Subject: {
                tasks: async ({ _id }) => {
                    return (await Tasks.find({ subjectId: _id }).toArray()).map(prepare)
                }
            },
            // Task: {
            //     subjects: async ({ _id }) => {
            //         return (await Subject.find({ taskId: _id }).toArray()).map(prepare)
            //     }
            // },
            Mutation: {
                createTask: async (root, args, context, info) => {
                    const res = await Tasks.insert(args)
                    return prepare(await Tasks.findOne({ _id: res.insertedIds[1] }))
                },
                createSubject: async (root, args, context, info) => {
                    const res = await Subjects.insert(args)
                    console.log()
                    return prepare(await Subjects.findOne({ _id: res.insertedIds[1] }))
                },
                updateSubject: async (root, args, context, info) => {
                    console.log(args._id)
                    console.log(args.days)
                    try {
                        const res = await Subjects.findOneAndUpdate({ _id: ObjectId(args._id)}, {$set: {day: args.days}})
                    } catch (e) {
                        console.log("to Insert")
                    }
                    try {
                        return prepare(await Subjects.findOne({ _id: ObjectId(args._id)}))
                    } catch (e) {
                        console.log("to Select")
                    }
                }
            },
        }

        const schema = makeExecutableSchema({
            typeDefs,
            resolvers
        })

        const app = express()

        app.use(cors())

        app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))

        const homePath = '/graphiql'

        app.use(homePath, graphiqlExpress({
            endpointURL: '/graphql'
        }))

        app.listen(PORT, () => {
            console.log(`Visit ${URL}:${PORT}${homePath}`)
        })
        //SecondPort
        var web = express();
        //var socketio = socketio();
        var http = require('http')
        var serverio = http.Server(web)
        var websocket = socketio(serverio)
        web.get('/', function (req, res) {
            res.send('Hello World!');
        });

        serverio.listen(3010, function () {
            console.log('Example app listening on port 3010!');
        });
        websocket.on('connection', (socket) => {
            socket.emit('message', 'data_test')
            socket.on('sended', (data) =>
                console.log(data))
            console.log('A client just joined on', socket.id);
        })

        websocket.on('i-need-id', () => {
            // Create a document in the db and grab that id.
            //var user = db.collection('users').insert({});
            socket.emit('here-is-your-id', user._id);
        });


    } catch (e) {
        console.log("OSHIBKA")
    }

}
