import { randomInt } from "crypto"
import { findFuncionarioByIdAndUpdateService, findFuncionariosUser } from "../services/funcionario.service.js"
import { createUserService, findUserByIdAndDelet } from "../services/user.service.js"
import { randomUUID } from "crypto"
import { findAlunoByIdAndUpdate, findAlunoByIdUser } from "../services/aluno.service.js"



export const redefineSenhaAluno = async (usuario) => {
    try {
        //console.log({usuario})

        let aluno = await findAlunoByIdUser(usuario._id)
        const nummeroAleatorio = randomInt(100)
        const letraAleatoria = randomUUID()
        const inicio = nummeroAleatorio - 3
        if(inicio < 0){inicio = 0}
        let nomeArray = aluno.nome.split(" ")
        let novaSenha = letraAleatoria.slice(inicio, nummeroAleatorio).toUpperCase() + nomeArray[1] + nummeroAleatorio
        
        //return res.send({ novaSenha })
        usuario.senha = novaSenha
        await findUserByIdAndDelet(usuario._id)
        
        await createUserService(usuario)
        aluno.user = usuario._id
        await findAlunoByIdAndUpdate(aluno._id, aluno)

        return usuario
    } catch (error) {
        return error
    }
}

export const redefineSenhaAluno2 = async (usuario) => {
    try {
        //console.log({usuario})
        let msg = "Sucesso 1"

        return msg
        let aluno = await findAlunoByIdUser(usuario._id)
        const nummeroAleatorio = randomInt(100)
        const letraAleatoria = randomUUID()
        const inicio = nummeroAleatorio
        if(inicio < 0){inicio = 0}
        let nomeArray = aluno.nome.split(" ")
        let novaSenha = letraAleatoria.slice(1, 2).toUpperCase() + nomeArray[1] + nummeroAleatorio
        //return res.send({ novaSenha })
        usuario.senha = novaSenha
        await findUserByIdAndDelet(usuario._id)
        
        await createUserService(usuario)
        aluno.user = usuario._id
        await findAlunoByIdAndUpdate(aluno._id, aluno)

        return usuario
    } catch (error) {
        return error
    }
}

export const redefineSenhaProf = async (usuario) => {
    try {
        //console.log({usuario})

        let funcionario = await findFuncionariosUser(usuario._id)
        if (funcionario.especialidade == null || funcionario.especialidade == undefined) { funcionario.especialidade = "Disciplina" }
        const nummeroAleatorio = randomInt(36)
        const letraAleatoria = randomUUID()
        const inicio = nummeroAleatorio - 3
        if(inicio < 0){inicio = 0}
        let nomeArray = funcionario.nome.split(" ")
        let novaSenha = letraAleatoria.slice(inicio, nummeroAleatorio).toUpperCase() + nomeArray[1] + nummeroAleatorio
        
        //return res.send({ novaSenha })
        usuario.senha = novaSenha
        await findUserByIdAndDelet(usuario._id)
        
        await createUserService(usuario)
        funcionario.user = usuario._id
        await findFuncionarioByIdAndUpdateService(funcionario._id, funcionario)

        return usuario
    } catch (error) {
        return error
    }
}