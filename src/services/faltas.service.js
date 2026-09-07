import Falta from "../models/faltas.modell.js";

export const findAllFaltasService = () => Falta.find().lean()

export const createFaltaService = (falta) => Falta(falta).save()

export const deleteAllFaltasServce = () => Falta.deleteMany({})

export const findFaltaBayIdAlunoService = (idAluno) => Falta.find({aluno: idAluno}).lean()

export const findFaltaBayIdTurmaService = (turma) => Falta.find({turma: turma}).lean()

export const findFaltaBayIdDisciplina = (disciplina) => Falta.find({disciplina: disciplina}).lean()

export const findFaltaByIdService = (idFalta) => Falta.findById(idFalta).lean()

export const findFaltaByIdAndUpdateService = (idFalta, faltaAchada) => Falta.findByIdAndUpdate(idFalta, faltaAchada).lean()