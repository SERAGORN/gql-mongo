export default typeDefs = [`
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
            subjects(day: String = "123456"): [Subject]
            users: [User]
            tasks: [Task]
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
            groupId: String
        }

        type Mutation {
            createGroup(title: String, content: String, userId: String) : Group
            createUser(first_name: String, last_name: String, login: String, password: String): User
            createTask(title: String, content: String, groupId: String): Task
            createSubject(title: String, teacher: String, date: String, groupId: String, time: String): Subject
            updateSubject(_id: String, days: String): Subject
            updateUser(_id: String, groupId: String) : User
            updateGroup(_id: String, userId: String) : Group
            deleteGroup(_id: String): Group
        }

        schema {
            query: Query
            mutation: Mutation
            subscription: Subscription
        }
    `];