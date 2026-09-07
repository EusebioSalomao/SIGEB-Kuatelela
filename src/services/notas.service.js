import NotaTrimestral from "../models/notaTrimestral.modell.js";
import NotaClasse from '../models/notaClasse.modell.js'

/* NOTAS TRIMESTRAL */
export const createNotaTrimestral = (novaNotasDisciplina) => NotaTrimestral(novaNotasDisciplina).save()

export const deletAllNotasTrimestraisService = () => NotaTrimestral.deleteMany({})

export const findAllNotasTrimSercice = () => NotaTrimestral.find().lean()

export const findNotasExistentByIdService = (idNota) => NotaTrimestral.findById(idNota).lean()

export const findNotaByIdAndUpdateSerice = (idNotaAch, notasExist) => NotaTrimestral.findByIdAndUpdate(idNotaAch, notasExist).lean()

export const findNotaByIdAndActulizeMedias = (idNotaAch, notas) => NotaTrimestral.findByIdAndUpdate(idNotaAch, notas).lean()

/* NOTAS POR CLASSE */
export const createNotaClasse = (notaClasse) => NotaClasse(notaClasse)