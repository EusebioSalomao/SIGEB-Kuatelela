import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Visita = new Schema({
    nome: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: true
    }
    
})

const visita  = mongoose.model("visitas", Visita)
export default visita