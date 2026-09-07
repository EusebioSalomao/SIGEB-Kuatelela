import { findFuncionarioByIdAndUpdateService, findFuncionariosUser } from "../services/funcionario.service.js"
import { createUserService, findUserByIdAndDelet } from "../services/user.service.js"



export const editarSenhaUserF = async (usuario, novaSenha, email, telefone) => {
    try {
        //console.log({usuario})

        let funcionario = await findFuncionariosUser(usuario._id)
        if (funcionario.especialidade == null || funcionario.especialidade == undefined) { funcionario.especialidade = "Disciplina" }
        
        //return res.send({ novaSenha })
        usuario.senha = novaSenha
        usuario.senhaAlterada = true
        if(email){usuario.email = email}
        if(telefone){usuario.telefone = telefone}
        await findUserByIdAndDelet(usuario._id)
        
        await createUserService(usuario)
        funcionario.user = usuario._id
        await findFuncionarioByIdAndUpdateService(funcionario._id, funcionario)

        return usuario
    } catch (error) {
        return error
    }
}