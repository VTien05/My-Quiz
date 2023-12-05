import mongoose from "mongoose";

const connect = async () => {
    try{
        const conn = await mongoose.connect('mongodb://localhost:27017',{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'wpr-quiz'
        });

        console.log(`MongoDB Connected:${conn.connection.host}`);
    }catch(err) {
        console.log(`Error: ${err.message}`);
        process.exit(1);
    }
}

export default connect;