import Curso from "../models/curso.model.js";

export const createCursoService = (curso) => Curso(curso).save()

export const findAllCursosService = () => Curso.find().lean()

export const findCursoByIdService = (id) => Curso.findById(id).lean()

export const findCursoByIdAndUpdateService = (id, curso) => Curso.findByIdAndUpdate(id, curso)

export const findCursoByDescricaoService = (descricao) => Curso.findOne({descricao: descricao})

export const findCursosByIdAnoService = (idAno) => Curso.find({idAno: idAno}).lean()

export const findCursoByIdCoordenadorServce = (idCoord) => Curso.findOne({coordenador: idCoord}).lean()