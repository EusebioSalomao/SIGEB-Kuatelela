import Notadisciplina from "../models/notasDisciplina.modell.js";

export const findAllNotasDisciplina = () => Notadisciplina.find().lean().populate('notas').populate('idClasse')

export const deleteAllNotasDisciplinasService = () => Notadisciplina.deleteMany({})

export const findNotasDisciplinaByIdCursoService = (idCurso) => Notadisciplina.find({idCurso: idCurso}).lean().populate('notas').populate('idClasse')

export const findNotasDisciplinaByIdMinipautaService = (idMinipauta) => Notadisciplina.find({idMinipauta: idMinipauta}).lean().populate('notas').populate('aluno')

export const findNotaDisciplinaByIdService = (id) => Notadisciplina.findById(id).lean().populate('notas')

export const findNotaDisciplinaByIdAndDeleteService = (id) => Notadisciplina.findByIdAndDelete(id).lean()

export const findNotasDisciplinaByIdAluno = (idAluno) => Notadisciplina.find({aluno: idAluno}).lean().populate('notas').populate('aluno')

export const findNotasDisciplinaByIdAlunoPerfil = (idAluno) => Notadisciplina.find({aluno: idAluno}).lean().populate('notas').populate('idMinipauta')

export const findNotasDisciplinaByIDServece = (idNotas) => Notadisciplina.findById(idNotas).populate('notas').lean()

export const createNotasDisciplinaService = (notasDisciplina) => Notadisciplina(notasDisciplina).save()

export const findNotasDisciplinaByIdClasse = (idClasse) => Notadisciplina.find({idClasse: idClasse}).lean().populate('notas').populate('idMinipauta')

export const findNotasDisciplinaByIdAlunoAndDelete = (idAluno) => Notadisciplina.findOneAndDelete({aluno: idAluno})