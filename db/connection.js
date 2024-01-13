import mongoose from "mongoose";

export function connectToDb() {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("Conneted to DB");
    }).catch((error) => {
        console.log(error);
    })

}