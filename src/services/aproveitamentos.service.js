import Aproveitamento from "../models/aproveitamento.modell.js";

export const createAproveitamento = (aproveitamento) => Aproveitamento(aproveitamento).save()

export const findAproveitamentoByTrimestreService = (trimestre) => Aproveitamento.findOne({trimestre: trimestre}).lean()

export const findAproveitamentoAndApdateService = (idAp, veryAproveitamento) => Aproveitamento.findByIdAndUpdate(idAp, veryAproveitamento).lean()