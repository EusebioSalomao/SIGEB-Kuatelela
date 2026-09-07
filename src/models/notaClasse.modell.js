import mongoose from "mongoose"
const Schema = mongoose.Schema;

const NotaClasse = new Schema({
    
    classe10: {
        type: Schema.Types.ObjectId,
        ref: "notas",
        required: true
    },
    classe11: {
        type: Schema.Types.ObjectId,
        ref: "notas",
        required: true
    },
    classe12: {
        type: Schema.Types.ObjectId,
        ref: "notas",
        required: true
    }
    
})


const notaclasse  = mongoose.model("notasclasses", NotaClasse)
export default notaclasse