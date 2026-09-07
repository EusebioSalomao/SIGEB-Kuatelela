import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Funcionario = new Schema({
    nome: {
        type: String,
        required: true
    },
    numBI: {
        type: String,
        require: true
    },
    numAgente: {
        type: String,
        require: true
    },
    contacto: {
        type: String,
        require: true
    },
    genero: {
        type: String,
        require: true
    },
    dataNascimento: {
        type: Date,
        require: true
    },
    idade: {
        type: Number,
        require: true
    },
    foto: {
        type: String,
        require: true
    },
    especialidade: {
        type: String,
        require: true
    },
    morada: {
        type: String,
        require: true
    },
    funcao: {
        type: String,
        default: 'professor',
        require: true
    },
      usuario: {
         type: String,
         require: true
     },
     disciplinas: {
         type: Array,
         require: true
     }, 
     minipautas: {
         type: Array,
         require: true
     }, 
     turmas: {
         type: Array,
         require: true
     },  
     idAno: {
         type: String,
         require: true
     }, 
     cargo: {
         type: String,
         require: true
     }, 
     lancamentoDeNotas: {
         type: Boolean,
         require: true
     }, 
   
})


const funcionario  = mongoose.model("funcionarios", Funcionario)
export default funcionario