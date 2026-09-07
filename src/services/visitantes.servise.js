import Visita from "../models/visitantes.modell.js"

export const createVisitanteService = (visita) => Visita(visita).save()

export const findAllVisitantesServece = () => Visita.find().lean()