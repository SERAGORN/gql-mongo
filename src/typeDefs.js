export const typeDefs = [`
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