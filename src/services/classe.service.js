import Classe from "../models/classe.modell.js";

export const createClasseService = (classe) => Classe(classe).save()

export const findAllClassesService = () => Classe.find().lean()

export const findClasseByIdService = (idClasse) => Classe.findOne({ _id: idClasse }).lean()

export const findAllClassesByIdCurso = (idCurso) => Classe.find({ idCurso: idCurso }).lean()

export const addTurmaClasseService = (idClasse, idTurma) => {
    return Classe.findOneAndUpdate({ _id: idClasse }, { $push: { turmas: idTurma } }).lean()
}

export const findClasseByIdAndUpdate = (idClasse, classe) => Classe.findByIdAndUpdate(idClasse, classe).lean()

export const findClassesByIdAno = (idAno) => Classe.find({idAno: idAno}).lean()