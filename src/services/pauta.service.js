import Pauta from "../models/pauta.modell.js"

export const findAllPautasService = () => Pauta.find().lean()

export const createPautaService = (pauta) => Pauta(pauta).save()

export const findPautasByIdAnoService = (idAno) => Pauta.find({idAno: idAno}).lean().populate("classe").populate("turma").populate("curso")

export const findPautasByIdAnoLectivoService = (idAno) => Pauta.find({anoLectivo: idAno}).lean().populate("classe").populate("turma").populate("curso")

export const findPautaByIdService = (idPauta) => Pauta.findById(idPauta).lean().populate("turma").populate("classe").populate("curso")

export const findPautaByIdTurma = (idTurma) => Pauta.find({turma: idTurma}).lean()

export const findPautaByTrimestre = (trimestre) => Pauta.findOne({trimestre: trimestre}).lean()

export const findPautaTDByTrimestre = (trimestre) => Pauta.find({trimestre: trimestre}).lean().populate("turma").populate("classe").populate("curso")

export const findPautasByIdCursoServece = (idCurso) => Pauta.find({curso: idCurso}).lean().populate("classe").populate("classe").populate("curso")

export const findOnePautaByIdTurma = (idTurma) => Pauta.findOne({idTurma: idTurma}).lean()

export const findPautaByIdAndDelectService = (idPauta) => Pauta.findByIdAndDelete(idPauta)

export const findPautaByIdAndUpdateServece = (idPautaFin, pautaParaAct) => Pauta.findByIdAndUpdate(idPautaFin, pautaParaAct).lean()

export const findAllPautasFinalService = () => Pauta.find({trimestre: 'Pauta Final Conselhada'}).lean().populate("classe")