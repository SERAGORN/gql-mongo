export const resolvers = {
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
            return prepare(await Tasks.findOne({ _id: ObjectId(res.insertedIds[0])}))
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