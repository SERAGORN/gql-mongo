import { MongoClient, ObjectId } from 'mongodb'
import express from 'express'
import socketio from 'socket.io'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import cors from 'cors'

const URL = 'http://192.168.1.37'
const PORT = 3001
const MONGO_URL = 'mongodb://localhost:27017/subj_control'

const prepare = (o) => {
    o._id = o._id.toString()
    return o
}

export const goOnSpl = async () => {
    try {
        const db = await MongoClient.connect(MONGO_URL)

        const Subjects = db.collection('subjects')
        const Tasks = db.collection('tasks')
        const Users = db.collection('users')
        const Groups = db.collection('groups')

        const typeDefs = [`
        type Query {
            task(_id: String): Task
            subject(_id: String): Subject
            subjectofteach(teacher: String): Subject
            tasks: [Task]
            subjects(teacher: String): [Subject]
            subjects(day: String): [Subject]
            users: [User]
            user(_id: String, login: String, password: String): User
            groups: [Group]
            group(_id: String): Group
        }

        type Subject {
            _id: String
            title: String
            teacher: String
            day: String
            date: String
            groupsId: String
            tasks: [Task]
            groups: [Group]
        }

        type Group {
            _id: String
            title: String
            content: String
            usersId: String
            subjects: [Subject]
            users: [User]
        }

        type User {
            _id: String
            first_name: String
            last_name: String
            groupId: String
            groups: [Group]
            login: String
            password: String
        }


        type Task {
            _id: String
            title: String
            content: String
            subjectId: String
            subjects: Subject
        }

        type Mutation {
            createGroup(title: String, content: String, userId: String) : Group
            createUser(first_name: String, last_name: String, login: String, password: String): User
            createTask(title: String, content: String, subjectId: String): Task
            createSubject(title: String, teacher: String, date: String, groupsId: String): Subject
            updateSubject(_id: String, days: String): Subject
            updateUser(_id: String, groupId: String) : User
            updateGroup(_id: String, userId: String) : Group
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
                        return (await Subjects.find({teacher: teacher}).toArray()).map(prepare)
                    } else if (day != undefined) {
                        return (await Subjects.find({day:   {'$regex': day}}).toArray()).map(prepare)
                    } else {
                        return (await Subjects.find({}).toArray()).map(prepare)
                    }
                },
                subjectofteach: async (root, {teacher}) => {
                    return prepare(await Subjects.findOne(ObjectId(teacher)).toArray()).map(prepare)
                },
                // subject: async (root, {teacher}) => {
                //     return prepare(await Subjects.findOne(ObjectId(teacher)).toArray()).map(prepare)
                // }
                user: async (root, {_id, login, password}) => {
                    if (_id != undefined) {
                        return prepare(await Users.findOne(ObjectId(_id)))
                    } else {
                        return prepare(await Users.findOne({login, password}))
                    }
                },
                users: async (root) => {
                    return (await Users.find({}).toArray()).map(prepare)
                },
                group: async (root, {_id}) => {
                    return prepare(await Groups.findOne(ObjectId(_id)))
                },
                groups: async (root) => {
                    return (await Groups.find({}).toArray()).map(prepare)
                }
            },
            Subject: {
                tasks: async ({ _id }) => {
                    return (await Tasks.find({ subjectId: _id }).toArray()).map(prepare)
                }
            },
            Task: {
                subjects: async ({ subjectId }) => {
                    return prepare(await Subjects.findOne(ObjectId(subjectId)))
                }
            },
            Group: {
                subjects: async({_id}) => {
                    return (await Subjects.find({groupsId: ObjectId(_id)}).toArray()).map(prepare)
                },
                users: async({usersId}) => {
                    return (await Users.find({_id: {$in: usersId}}).toArray()).map(prepare)
                }
            },
            User: {
                groups: async({_id}) => {
                    return (await Groups.find({usersId: ObjectId(_id)}).toArray()).map(prepare)
                    
                }
            },
            Mutation: {
                createUser: async (root, args, context, info) => {
                    const res = await Users.insert(args)
                    return prepare(await Users.findOne({ _id: ObjectId(res.insertedIds[0])}))
                },
                updateUser: async (root, args, context, info) => {
                    const res = await Users.findOneAndUpdate({ _id: ObjectId(args._id)}, {$push: {groupId: ObjectId(args.groupId)}})
                },
                createTask: async (root, args, context, info) => {
                    const res = await Tasks.insert(args)
                    return prepare(await Tasks.findOne({ _id: ObjectId(res.insertedIds[0])}))
                },
                createSubject: async (root, args, context, info) => {
                    const res = await Subjects.insert({title: args.title, teacher: args.teacher, date: args.date, groupsId: ObjectId(args.groupsId) })
                    return prepare(await Subjects.findOne({ _id: res.insertedIds[0] }))
                },
                updateSubject: async (root, args, context, info) => {
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
                },
                createGroup: async (root, args, context, info) => {
                    const res = await Groups.insert({title: args.title, content: args.content, usersId: [ObjectId(args.userId)]})
                    return prepare(await Groups.findOne({ _id: ObjectId(res.insertedIds[0])}))
                },
                updateGroup: async (root, args, context, info) => {
                    const res = await Groups.findOneAndUpdate({ _id: ObjectId(args._id)},{$push:{usersId: ObjectId(args.userId)}})
                    return prepare(await Groups.findOne({ _id: ObjectId(args._id)}))
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
            //viewkey=ph5b5985230a448
            //
            socket.emit('here-is-your-id', user._id);
        });


    } catch (e) {
        console.log(e)
    }

}
