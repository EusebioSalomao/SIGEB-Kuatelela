import Turma from "../models/turma.modell.js";

export const createTurmaService = (turma) => Turma(turma).save();

export const findTurmaByIdService = (idTurma) => Turma.findOne({_id :idTurma}).sort({codigo: "asc"}).lean()

export const findTurmaByIdDetalhadoService = (idTurma) => Turma.findOne({_id :idTurma}).sort({codigo: "asc"}).lean().populate('idClasse').populate('idCurso')

export const findTurmaByIdServiceDetalhado = (idTurma) => Turma.findOne({_id :idTurma}).sort({codigo: "asc"}).lean().populate('idCurso').populate('idClasse')

export const findDadosTurmaByIdService = (idTurma) => Turma.findOne({_id :idTurma}).lean().populate('idClasse').populate('idCurso')

export const findAllTurmasService = () => Turma.find().sort({codigo: 1}).lean()
export const findAllTurmasService2 = () => Turma.find().sort({codigo: 1}).lean().populate("idClasse")

export const findAllTurmasDetService = () => Turma.find().sort({codigo: 1}).lean().populate("idClasse").populate("idCurso")

export const findAllTurmasAndClasseService = () => Turma.find().lean().sort({codigo: 'ascending'}).populate('idClasse').populate('idCurso')

export const findAllTurmasServiceAtCargo = () => Turma.find().lean().populate('idClasse')

export const findTurmaByIdCursoService = (idCurso) => Turma.find({idCurso: idCurso}).sort({codigo: 'asc'}).lean()

export const findTurmasByIdClassedService = (idClasse) => Turma.find({idClasse: idClasse}).sort({codigo: "asc"}).lean()

export const findTurmasByIdAno = (idAno) => Turma.find({idAno: idAno}).sort({codigo: 1}).lean().populate("idClasse").populate('idCurso')

export const findTurmaByIdAndDeleteSerice = (idTurma) => Turma.findByIdAndDelete(idTurma)

export const findTurmaByCodigoServece = (codigo) => Turma.findOne({codigo: codigo}).lean()

export const findTurmaByIdAndUpdService = (idTurma, turmaAActualizar) => Turma.findByIdAndUpdate(idTurma, turmaAActualizar).lean()

export const findTurmaByIdPresidente = (idPresidente) => Turma.findOne({juriPresidente: idPresidente}).lean().populate('idClasse')


