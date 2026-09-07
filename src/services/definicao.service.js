import Definicao from "../models/definicoes.modell.js";

export const findDefinicoesService = () => Definicao.findOne().lean()

export const findDefincoesAndUpdateService = (idDefinicao, definicao) => Definicao.findByIdAndUpdate(idDefinicao, definicao)