import mongoose from "mongoose"
const Schema = mongoose.Schema;

const AnoLectivo = new Schema({
    codigo: {
        type: String,
        required: true
    },
    cursos: {
        type: Array,
        require: true
    },
    dataInicio: {
        type: Date,
        required: true
    },
    dataFim: {
        type: Date,
        required: true
    },
    calendario: {
        type: Schema.Types.ObjectId,
        ref: "calendarios",
        require: true
    },
    estado: {
        type: String,
        default: "Activo"
    },
    candidatura: {
        type: String,
        require: true
    },
    encerrado: {
        type: Boolean,
        default: false
    }
    
})  


const anoLectivo  = mongoose.model("anosLevtivos", AnoLectivo)
export default anoLectivo