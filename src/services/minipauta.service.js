import Minipauta from "../models/minipauta.modell.js";

export const creatMinipautaService = (minipauta) => Minipauta(minipauta).save()

export const findMinipautasByIdProfessorService = (idProfessor) => Minipauta.find({idProfessor: idProfessor}).lean().populate("idProfessor").populate("idClasse").populate("idTurma")

export const findMinipautaByIdService = (id) => Minipauta.findById(id).lean().populate("idProfessor").populate("idClasse").populate("idTurma")

export const findMinipautaByIdAndUpdateService = (idMinipauta, miniPauta) => Minipauta.findByIdAndUpdate(idMinipauta, miniPauta).lean()

export const findAllMinipautasService = () => Minipauta.find().lean().populate("idProfessor").populate("idClasse").populate("idTurma").populate("idCurso")

export const findMinipautasByIdAnoService = (idAno) => Minipauta.find({idAno: idAno}).lean().populate('idTurma').populate('idClasse').populate('idProfessor')

export const findMinipautasByIdTurma = (idTurma) => Minipauta.find({idTurma: idTurma}).lean().populate("alunos")

export const findOneMinipautaByIdTurma = (idTurma) => Minipauta.findOne({idTurma: idTurma}).lean().populate("alunos")

export const findMiniPautaByIdAndDelete = (idMinipauta) => Minipauta.findByIdAndDelete(idMinipauta)

export const findMiniputasByNomeService = (descPesquisa) => Minipauta.find({nomeDisciplina: descPesquisa}).lean().populate("idProfessor").populate("idClasse").populate("idTurma").populate("idCurso")