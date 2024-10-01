import mongoose, { ConnectOptions } from "mongoose";
import CONFIG from '../config'

const {DB_URL} = CONFIG;

export default async() => {
    try {
        await mongoose.connect(DB_URL as string, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions);
        console.log('db connected')
    } catch(err){
        console.log('Error ============ ON DB Connection')
        console.log(err);
    }
}