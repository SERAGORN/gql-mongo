import { MongoClient, ObjectId } from 'mongodb'
const MONGO_URL = 'mongodb://localhost:27017/test'
    
    export const start = async () => {
        const db = await MongoClient.connect(MONGO_URL)
        const person = db.collection('person')

        console.log(person.find({ name: {$regex: "К"}}))

    }

