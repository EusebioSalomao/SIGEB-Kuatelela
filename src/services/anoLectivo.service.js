import AnoLectivo from "../models/anoLectivo.model.js";

export const createAnoLectivoService = (anoLectivo) => AnoLectivo(anoLectivo).save()

export const findAnoLectivoByIdAndeDeleteService = (idAno) => AnoLectivo.findByIdAndDelete(idAno).lean()

export const findAllAnosLectivo = () => AnoLectivo.find().lean()

export const findAnoLectivoActivoService = () => AnoLectivo.findOne({estado: "Activo"}).lean()

export const findAnoLectivoById = (id) => AnoLectivo.findById(id).lean()

export const findAnoLectivoByCodigo = (codigo) => AnoLectivo.findOne({codigo: codigo}).lean()

export const findAnoLectivoByIdAndUpdate = (id, anoLectivo) => AnoLectivo.findByIdAndUpdate(id, anoLectivo)

export const addCursoAnoLectivoService = (idAno, idCurso) => {
    return AnoLectivo.findOneAndUpdate({_id: idAno}, {$push: {cursos: idCurso}})
}

export const adClasseCursoAnoService = (idAno, novoCurso) => {
    return AnoLectivo.findOneAndUpdate({_id: idAno}, {$push: {cursos: novoCurso}})
}

export const deleteCursoAnoService = (idAno, ano) => AnoLectivo.findByIdAndUpdate(idAno, ano);

export const findAnoLectivoByEstadoService = (estado) => AnoLectivo.findOne({estado: estado}).lean()