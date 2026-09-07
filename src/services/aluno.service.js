import Aluno from "../models/aluno.modell.js";

export const findAllAlunosService = () => Aluno.find().sort({nome: 1}).lean()

export const findAlunosMatriculados = (matriculado) => Aluno.find({matriculado: matriculado}).sort({nome: 1}).lean()

export const findAlunosMatriculadosService = () => Aluno.find({matriculado: true}).sort({nome: 1}).lean()

export const createAlunoService = (aluno) => Aluno(aluno).save()

export const findAlunoByBIService = (bi) => Aluno.findOne({numBI: bi}).lean()

export const findAlunoByNomeServce = (nome) => Aluno.findOne({nome: nome}).lean()

export const findAlunosByIdTurma = (idTurma) =>
    Aluno.find({ idTurma })
        .select("+pintado")
        .sort({ nome: 1 })
        .lean()

export const findAlunosByIdTurmaParaPDF = (idTurma) =>
    Aluno.find({ idTurma })
        .select({ _id: 1, nome: 1, pintado: 1 })
        .sort({ nome: 1 })
        .lean()

export const findAlunoByIdService = (idAluno) => Aluno.findOne({_id: idAluno}).populate('usuario').lean()

export const findAlunoByIdUser = (id) => Aluno.findOne({usuario: id}).lean()

export const findAlunosByIdAnoService = (idAno) => Aluno.find({idAno: idAno}).sort({nome: 1}).lean()

export const findAlunosByIdCursoService = (idCurso) => Aluno.find({idCurso: idCurso}).sort({nome: 1}).lean()

export const findAlunoByNumBIService = (numBI) => Aluno.findOne({numBI: numBI}).lean()

export const findAlunoAnDeleteSercice = (idAluno) => Aluno.findByIdAndDelete(idAluno)

export const findAlunoByIdAndUpdate = (idAluno, aluno) => Aluno.findByIdAndUpdate(idAluno, aluno)

export const actualizarPintadoAlunoService = (idAluno, pintado) =>
    Aluno.findByIdAndUpdate(
        idAluno,
        { $set: { pintado: pintado === true } },
        { new: true, runValidators: true },
    ).lean()

export const findAlunosByMatriculasService = (matriculado) => Aluno.find({matriculado: matriculado}).sort({nome: 1}).lean()

export const findAlunosByMatriculas2Service = (matricula) => Aluno.find({matricula: matricula}).lean()

export const findAlunosByClasseService = (classe) => Aluno.find({classe: classe}).lean().sort({nome: 1})

export const findAlunosByConcluidoService = (concluido) => Aluno.find({concluido: concluido}).lean().sort({nome: 1})


