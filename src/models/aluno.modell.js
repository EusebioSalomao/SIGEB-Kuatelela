import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Aluno = new Schema({
    nome: {
        type: String,
        required: true
    },
    numBI: {
        type: String,
        required: true
    },
    contacto: {
        type: String,
        require: true
    },
    genero: {
        type: String,
        required: true
    },
    dataNascimento: {
        type: Date,
        required: true,
        default: Date.now()
    },
    anoNascimento: {
        type: Number,
        require: true
    },
    foto: {
        type: String,
        require: true
    },
    idade: {
        type: Number,
        require: true
    },
    curso: {
        type: String,
        required: true
    },
    pai: {
        type: String,
        require: true
    },
    mae: {
        type: String,
        require: true
    },
    escolaAnt: {
        type: String,
        require: true
    },
    morada: {
        type: String,
        require: true
    },
    nomeEncarregado: {
        type: String,
        require: true
    },
    proficao: {
        type: String,
        default: '',
        require: true
    },
    contactoEncarregado: {
        type: String,
        default: '',
        require: true
    },
      usuario: {
         type: Schema.Types.ObjectId,
         ref: "users",
         require: true
     },
     disciplinas: {
         type: Array,
         required: true
     },
     classe: {
         type: String,
         require: true
     },
     matricula: {
         type: String,
         default: 'Não confirmada'
     }, 
     matriculado: {
        type: Boolean,
        default: false
     },
     idTurma: {
         type: String,
         require: true
     }, 
     idClasse: {
         type: String,
         require: true
     }, 
     idCurso: {
         type: String,
         require: true
     }, 
     idAno: {
         type: String,
         require: true
     },
     faltas: {
        type: Number,
        require: true
    }, 
     idProfessor: {
        type: String,
        require: true
    }, 
     pintado: {
        type: Boolean,
        default: true
    }, 
     concluido: {
        type: String,
        require: true
    }, 
     dataCreate: {
        type: Date,
        default: Date.now()
    }, 
     
})


const aluno  = mongoose.model("alunos", Aluno)
export default aluno