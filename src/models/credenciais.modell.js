import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Credencial = new Schema({
    username: {
        type: String,
        required: true
    },
    id: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        required: true
    }
    
})

const credencial  = mongoose.model("credenciais", Credencial)
export default credencial