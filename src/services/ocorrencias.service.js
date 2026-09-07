import Ocorrencia from "../models/ocorrencias.modell.js";

export const creaOcorrenciaService = (ocorrencia) => Ocorrencia(ocorrencia).save()

export const findAllOcorrenciasService = () => Ocorrencia.find().lean().sort({_id:-1})

export const findOcorrenciaByEstatoService = (estadoSolicitacao) => Ocorrencia.find({estado: estadoSolicitacao}).lean()

export const findOcorrenciaTipoService = (tipo) => Ocorrencia.find({tipoOcorrencia: tipo}).lean()

export const findSolicitacaoByIdService = (idSolicitacao) => Ocorrencia.findById(idSolicitacao).lean().populate('turma')

export const findOcorrenciaByIdAndUpdateServece = (idSolicitacao, solicitacao) => Ocorrencia.findByIdAndUpdate(idSolicitacao, solicitacao).lean()