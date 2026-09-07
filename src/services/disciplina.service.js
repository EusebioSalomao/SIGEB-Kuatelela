import Disciplina from "../models/disciplina.modell.js";

export const createDisciplinaService = (disciplina) => Disciplina(disciplina).save()

export const findAllDiscplinasService = () => Disciplina.find().sort({nomeDisciplina: 1}).lean()

export const findAllDiscplinasDetService = () => Disciplina.find().sort({nomeDisciplina: 1}).lean().populate("idClasse")

export const findDisciplinaByIdService = (idDisciplina) => Disciplina.findById(idDisciplina).lean().populate("idProfessor").populate("idClasse")

export const findDisciplinaByIdAndUpdateService = (idDisciplina, disciplina) => Disciplina.findByIdAndUpdate(idDisciplina, disciplina).lean()

export const findDisciplinaByIdClasse = (idClasse) => Disciplina.find({idClasse: idClasse}).lean()

        //const turmas = []
export const findDisciplinaByIdProfessorServece = (idProfessor) => Disciplina.find({idProfessor: idProfessor}).lean().populate("idClasse").populate("idTurma")

export const findDisciplinaByIdTurmaService = (idTurma) => Disciplina.find({idTurma: idTurma}).lean()