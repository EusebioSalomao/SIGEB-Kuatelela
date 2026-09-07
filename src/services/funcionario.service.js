import Funcionario from '../models/funcionario.modell.js'

export const createFuncionarioService = (funcionario) => Funcionario(funcionario).save()

export const findAllFuncionariosService = () => Funcionario.find().lean().sort({nome: 'asc'})

export const findFuncionariosByIdService = (idF) => Funcionario.findById(idF).lean()

export const findFuncionarioByNumBIService = (numBI) => Funcionario.findOne({numBI: numBI}).lean()

export const findFuncionariosUser = (idUser) => Funcionario.findOne({usuario: idUser}).lean()

export const findFuucionarioByIdUser = async (idUser) => {
    try {
        //console.log('Chegou aqui')
        const funcionarios = await findAllFuncionariosService()
        funcionarios.forEach(funcionario => {
            if(funcionario.usuario == ""+idUser){
                console.log({funcionario})
            }
        });
    } catch (error) {
        return error
    }
}

export const findFuncionarioByIdAndUpdateService = (idProfessor, professor) => Funcionario.findByIdAndUpdate(idProfessor, professor).lean()

export const findFuncionarioByFuncaoService = (funcao) => Funcionario.find({funcao: funcao}).lean()

export const deleteTurmaProfService = async (idProfessor, idTurma, idMinipauta, nomeDisciplina) => {
    let professor = await Funcionario.findById(idProfessor)
    let indexT = professor.turmas.findIndex((i) => i == idTurma)
    let indexM = professor.minipautas.findIndex((i) => i == idMinipauta)
    let indexD = professor.disciplinas.findIndex((i) => i == nomeDisciplina)
    professor.turmas.splice(indexT, 1);
    professor.minipautas.splice(indexM, 1);
    professor.disciplinas.splice(indexD, 1);
    await Funcionario.findByIdAndUpdate(idProfessor, professor)
    return professor;

} 

export const deleteMinipautaProfService = (idProfessor, idMinipauta) => Funcionario.findOneAndUpdate({_id: idProfessor}, {$pull: {minipautas: idMinipauta}})

//export const deleteDisciplinaProfService = (idProfessor, nomeDisciplina) => Funcionario.findOneAndUpdate({_id: idProfessor}, {$pull: {disciplinas}})
