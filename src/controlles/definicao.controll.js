import { randomInt, randomUUID } from "crypto"

import { findAlunoByIdAndUpdate, findAlunoByIdUser, findAlunosByIdTurma } from "../services/aluno.service.js"
import { findAllCursosService, findCursoByIdAndUpdateService, findCursoByIdCoordenadorServce, findCursoByIdService } from "../services/curso.service.js"
import { findDefincoesAndUpdateService, findDefinicoesService } from "../services/definicao.service.js"
import { findAllFuncionariosService, findFuncionarioByIdAndUpdateService, findFuncionariosByIdService, findFuncionariosUser } from "../services/funcionario.service.js"
import { findAllTurmasServiceAtCargo, findTurmaByIdAndUpdService, findTurmaByIdPresidente, findTurmaByIdService } from "../services/turma.service.js"
import { changePassword, createUserService, findAllUsers, findUserBIdAndUpdate, findUserBuNameService, findUserByIdAndDelet, findUserByIdService, findUsuariosByCategoriaService, generateToken } from "../services/user.service.js"
import { redefineSenhaAluno, redefineSenhaAluno2, redefineSenhaProf } from "../outrasF/definicoes.OutF.js"
import { createCredencial } from "../services/credencial.service.js"
import aluno from "../models/aluno.modell.js"
import { authMidleware } from "../middlewares/auth.middleware.js"
import passport from 'passport'

export const definicoes = async (req, res) => {
    try {
        const userActual = req.user
        let dev = false
        //return res.send({userActual})
        const funcionarios = await findAllFuncionariosService()
        const users = await findAllUsers()
        let funcionariosComCargo = []

        if (userActual.dev == true) { dev = true }

        funcionarios.forEach(funcionario => {
            if (funcionario.cargo) { funcionariosComCargo.push(funcionario) }
        });
        res.render('admin/definicoes/definicoes', { funcionarios, funcionariosComCargo, users, dev })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const atribuirCargo = async (req, res) => {
    try {
        const { funcionario, cargo } = req.body

        if (!funcionario || cargo == "" || cargo == undefined || funcionario == "") {
            req.flash('error_msg', 'Algo deu errado! Seleciona o funcionário e o cargo devidamente')
            return res.redirect('/definicoes')
        }
        const idFuncionario = funcionario
        const funcionarioPro = await findFuncionariosByIdService(idFuncionario)
        //return res.send({funcionarioPro})
        const cursos = await findAllCursosService()
        const turmas = await findAllTurmasServiceAtCargo()
        let chefSecc = ''
        let coordCurso = ''
        let coordDisciplina = ''
        let coordTurma = ''
        let coordTurno = ''
        let juriPresidente = ''
        if (cargo == "Chefe de Secção") { chefSecc = "chefSecc" }
        if (cargo == "Coordenador de Curso") { coordCurso = "chefSecc" }
        if (cargo == "Coordenador de Disciplina") { coordDisciplina = "chefSecc" }
        if (cargo == "Coordenador de Turma") { coordTurma = "chefSecc" }
        if (cargo == "Coordenador de Turno") { coordTurno = "chefSecc" }
        if (cargo == "Júri Presidente") { juriPresidente = "chefSecc" }
        //return res.send({funcionarioPro, cargo})
        res.render('admin/definicoes/atribuirCargo', { funcionarioPro, cargo, chefSecc, coordCurso, coordDisciplina, coordTurma, coordTurno, juriPresidente, cursos, turmas })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const removerCargo = async (req, res) => {
    try {
        const { funcionario } = req.body

        if (!funcionario || funcionario == "") {
            req.flash('error_msg', 'Algo deu errado! Seleciona o funcionário e o cargo devidamente')
            return res.redirect('/definicoes')
        }
        const idFuncionario = funcionario
        const funcionarioPro = await findFuncionariosByIdService(idFuncionario)
        if (funcionarioPro.cargo == '' || funcionarioPro.cargo == undefined) {
            req.flash('error_msg', 'Erro! O funcionário que selecionou não possui cargo de Direção')
            return res.redirect('/definicoes')
        }
        const cargoProf = funcionarioPro.cargo
        const cursos = await findAllCursosService()
        const turma = await findTurmaByIdPresidente(idFuncionario)
        const curso = await findCursoByIdCoordenadorServce(idFuncionario)
        //return res.send({curso})
        let chefSecc = ''
        let coordCurso = ''
        let coordDisciplina = ''
        let coordTurma = ''
        let coordTurno = ''
        let juriPresidente = ''

        if (funcionarioPro.cargo == "Chefe de Secção") { chefSecc = "chefSecc" }
        if (funcionarioPro.cargo == "Coordenador de Curso") { coordCurso = "chefSecc" }
        if (funcionarioPro.cargo == "Coordenador de Disciplina") { coordDisciplina = "chefSecc" }
        if (funcionarioPro.cargo == "Coordenador de Turma") { coordTurma = "chefSecc" }
        if (funcionarioPro.cargo == "Coordenador de Turno") { coordTurno = "chefSecc" }
        if (funcionarioPro.cargo == "Júri Presidente") { juriPresidente = "chefSecc" }
        //return res.send({funcionarioPro, cargo})
        res.render('admin/definicoes/removerCargo', { funcionarioPro, chefSecc, coordCurso, coordDisciplina, coordTurma, coordTurno, juriPresidente, cursos, turma, curso })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const salvarCargo = async (req, res) => {
    try {
        const { especifico, cargo, idFuncionario } = req.body
        if (cargo == 'Júri Presidente') {
            const idTurma = especifico
            let turma = await findTurmaByIdService(idTurma)
            let funcionario = await findFuncionariosByIdService(idFuncionario)
            let msdDeErro = ""
            if (!(funcionario.cargo == null || funcionario.cargo == "")) {
                msdDeErro = "Está atribuir cargo a um funcionário que já possui um! Remove o anterior antes de atribuir outro."
            }
            if (!(turma.juriPresidente == null)) {
                msdDeErro += "Esta turma já possui um Júri presidente"
            }
            if (!(msdDeErro == "")) {
                return res.render("msgerror", { msdDeErro })

            } else {
                funcionario.cargo = cargo
                turma.juriPresidente = idFuncionario
                await findFuncionarioByIdAndUpdateService(idFuncionario, funcionario)
                await findTurmaByIdAndUpdService(idTurma, turma)
                //return res.send("Sucesso!!!!!")

                req.flash("success_msg", "Cargo de " + cargo + " atribuido ao funcionário " + funcionario.nome + " com sucesso!")
                return res.redirect("/definicoes")
            }
        }
        if (cargo == 'Coordenador de Curso') {
            const idCurso = especifico
            let curso = await findCursoByIdService(idCurso)
            let funcionario = await findFuncionariosByIdService(idFuncionario)
            let msdDeErro = ""
            if (!(funcionario.cargo == null || funcionario.cargo == "")) {
                msdDeErro = "Está atribuir cargo a um funcionário que já possui um! Remove o anterior antes de atribuir outro."
            }
            if (!(curso.coordenador == null)) {
                msdDeErro += "Este curso já possui um Coordenador"
            }
            if (!(msdDeErro == "")) {
                return res.render("msgerror", { msdDeErro })

            } else {
                funcionario.cargo = cargo
                curso.coordenador = idFuncionario
                await findFuncionarioByIdAndUpdateService(idFuncionario, funcionario)
                await findCursoByIdAndUpdateService(idCurso, curso)

                req.flash("success_msg", "Cargo de " + cargo + " atribuido ao funcionário " + funcionario.nome + " com sucesso!")
                res.redirect("/definicoes")
            }
        } else {
            req.flash("error_msg", "Lamentamos! No momento, ainda não é possível atribuir o cargo selecionado. Tente mais tarde!")
            res.redirect("/definicoes")
        }
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })

    }
}

export const salvarRemCargo = async (req, res) => {
    try {
        const { idFuncionario } = req.body

        let funcionario = await findFuncionariosByIdService(idFuncionario)
        const cargo = funcionario.cargo
        if (cargo == 'Júri Presidente') {
            let turma = await findTurmaByIdPresidente(idFuncionario)
            funcionario.cargo = ''
            turma.juriPresidente = null
            //return res.send({turma, funcionario})

            await findTurmaByIdAndUpdService(turma._id, turma)
            await findFuncionarioByIdAndUpdateService(idFuncionario, funcionario)

            req.flash("error_msg", "Cargo de " + cargo + " removido ao funcionário " + funcionario.nome + " com exito!")
            res.redirect("/definicoes")

        }
        if (cargo == 'Coordenador de Curso') {
            let curso = await findCursoByIdCoordenadorServce(funcionario._id)
            //return res.send({funcionario})
            funcionario.cargo = ''
            curso.coordenador = null

            await findCursoByIdAndUpdateService(curso._id, curso)
            await findFuncionarioByIdAndUpdateService(idFuncionario, funcionario)

            req.flash("error_msg", "Cargo de " + cargo + " removido ao funcionário " + funcionario.nome + " com exito!")
            res.redirect("/definicoes")

        }



    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })

    }
}

export const autorizacoes = async (req, res) => {
    try {
        const cursos = await findAllCursosService()
        const funcionarios = await findAllFuncionariosService()
        const usersAdmin = []
        const users = await findAllUsers()

        users.forEach(user => {
            if(user.categoria != "professor" && user.categoria != "aluno"){usersAdmin.push(user)}
        });

        //return res.send({usersAdmin})
        const definicoes = await findDefinicoesService()
        return res.render("admin/definicoes/autorizacoes", { definicoes, cursos, funcionarios, usersAdmin })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const autorizar = async (req, res) => {
    try {
        const { autorizacao } = req.body
        const msActivar = "Autorização concebida com sucesso!"
        const msDesactivar = "Autorização Desactivada com sucesso!"
        let msActivo = false
        let definicoes = await findDefinicoesService()
        if (autorizacao == "Matrículas") {
            if (definicoes.abrirReconfirmacao) { definicoes.abrirReconfirmacao = false } else { definicoes.abrirReconfirmacao = true; msActivo = true }
            await findDefincoesAndUpdateService(definicoes._id, definicoes)
            if (msActivo) { req.flash("success_msg", "" + msActivar) } else { req.flash("error_msg", "" + msDesactivar) }

            return res.redirect("/definicoes/autorizacoes")
        }

        if (autorizacao == "Admissão de Candidato") {
            const { vagaRegular, vagaAdulto } = req.body
            definicoes.vagasCEJRegular = parseInt(vagaRegular[0])
            definicoes.vagasCHRegular = parseInt(vagaRegular[1])
            definicoes.vagasCFBRegular = parseInt(vagaRegular[2])

            definicoes.vagasCEJAdultos = parseInt(vagaAdulto[0])
            definicoes.vagasCHAdultos = parseInt(vagaAdulto[1])
            definicoes.vagasCFBAdultos = parseInt(vagaAdulto[2])

            if (definicoes.autorizarAdmissaoCandidato) { definicoes.autorizarAdmissaoCandidato = false } else { definicoes.autorizarAdmissaoCandidato = true; msActivo = true }
            await findDefincoesAndUpdateService(definicoes._id, definicoes)
            if (msActivo) { req.flash("success_msg", "" + msActivar) } else { req.flash("error_msg", "" + msDesactivar) }

            return res.redirect("/definicoes/autorizacoes")
        }

        return res.render("admin/definicoes/autorizacoes")
    } catch (error) {
        return res.status(500).send({ mesage: mesage.error })
    }
}

export const nivelPrivilegio = async (req, res) => {
    try {
        const { nivel, idUsuario } = req.body

        if (nivel == "") { return res.send("Seleciona o Nível de Privilégio!") }
        let usuario = await findUserByIdService(idUsuario)
        usuario.privilegio = parseInt(nivel)
        await findUserBIdAndUpdate(idUsuario, usuario)

        req.flash("success_msg", "Nível de Privilégio do sistema atribuido ao usuário " + usuario.username + " com Sucesso!")
        res.redirect("/definicoes")

    } catch (error) {
        return res.status(500).send({ mesage: mesage.error })
    }
}

export const restringirAccess = async (req, res) => {
    try {
        const { access, idUsuario } = req.body

        if (access == "") { return res.send("Seleciona correctamente, por favor!") }

        if (idUsuario == "alunos") {
            let usersAlunos = await findUsuariosByCategoriaService("aluno")
            usersAlunos.forEach(async user => {
                if (access == "Liberar") { user.access = true } else { user.access = false }
                await findUserBIdAndUpdate(user._id, user)
            });
            req.flash("success_msg", "Acesso ao sistema alterado para todos Alunos com sucesso!")
            return res.redirect("/definicoes")
        }
        if (idUsuario == "funcionarios") {

            return res.send("Funcionarios")
        } else {

            let usuario = await findUserByIdService(idUsuario)
            if (access == "Liberar") {
                usuario.access = true
            } else {
                usuario.access = false
            }
            await findUserBIdAndUpdate(idUsuario, usuario)

            req.flash("success_msg", "Acesso ao sistema alterado para o " + usuario.username + " com Sucesso!")
            res.redirect("/definicoes")
        }

    } catch (error) {
        return res.status(500).send({ mesage: mesage.error })
    }
}


export const pagamento = async (req, res) => {
    try {
        const { mes, anoLimite } = req.body
        const mesInt = parseInt(mes)

        let definicao = await findDefinicoesService()
        definicao.mesLimite = mesInt
        definicao.anoLimite = anoLimite
        definicao.fimDoPrazo = false
        await findDefincoesAndUpdateService(definicao._id, definicao)

        req.flash("success_msg", "Pagamento realizado com sucesso! ")
        res.redirect("/definicoes")

    } catch (error) {
        return res.status(500).send({ mesage: mesage.error })
    }
}

export const bloquearSystem = async (req, res) => {
    try {
        
        let definicao = await findDefinicoesService()
        definicao.fimDoPrazo = true
        await findDefincoesAndUpdateService(definicao._id, definicao)

        req.flash("success_msg", "Sistema Bloqueado com sucesso! ")
        res.redirect("/")

    } catch (error) {
        return res.status(500).send({ mesage: mesage.error })
    }
}

export const lancamentoDeNotas = async (req, res) => {
    try {

        const { indicador, funcionario } = req.body

        if (indicador == "autorizar" && funcionario != "todos") {
            let professor = await findFuncionariosByIdService(funcionario)
            professor.lancamentoDeNotas = true
            await findFuncionarioByIdAndUpdateService(funcionario, professor)
            req.flash("success_msg", "Autorização de Lançamento concedida a " + professor.nome)
            return res.redirect("/definicoes/autorizacoes")
        }


        if (indicador == "bloquear" && funcionario != "todos") {
            let professor = await findFuncionariosByIdService(funcionario)
            professor.lancamentoDeNotas = false
            await findFuncionarioByIdAndUpdateService(funcionario, professor)
            req.flash("error_msg", "Bloqueio de Lançamento para " + professor.nome)
            return res.redirect("/definicoes/autorizacoes")
        }
        if (indicador == "autorizar" && funcionario == "todos") {
            let professores = await findAllFuncionariosService()
            professores.forEach(async professor => {
                professor.lancamentoDeNotas = true
                await findFuncionarioByIdAndUpdateService(professor._id, professor)
            });
            req.flash("success_msg", "Autorização de Lançamento concedida a Todos professores")
            return res.redirect("/definicoes/autorizacoes")
        } else {
            let professores = await findAllFuncionariosService()
            professores.forEach(async professor => {
                professor.lancamentoDeNotas = false
                await findFuncionarioByIdAndUpdateService(professor._id, professor)
            });
            req.flash("error_msg", "Lançamento  de notas Bloqueado para Todos professores")
            return res.redirect("/definicoes/autorizacoes")
        }




    } catch (error) {
        return res.status(500).send({ mesage: mesage.error })
    }
}


export const redefinicaoDeSenha = async (req, res) => {
    try {
        const { idUsuario } = req.body

        if (idUsuario == "") { return res.send("Seleciona usuário por favor!") }
        if (idUsuario == "funcionarios") {

            return res.send("Redefinição de senhas não disponível. Lamentamos!")
        }
        if (idUsuario == "alunos") {
            return res.send("Redefinir senha de todos alunos")
        }
        if (idUsuario == "turma") {
            //return res.send("Redefinir senha dos alunos de uma turma")
            const { idTurma } = req.body
            let alunos = await findAlunosByIdTurma(idTurma)
            let msg = ""
            alunos.forEach(async aluno => {
                let usuario = await findUserByIdService(aluno.usuario)
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
                
                const credencial = {
                    username: usuario.username,
                    id: usuario._id,
                    senha: novaSenha,
                    categoria: usuario.categoria
                }
                await createCredencial(credencial)
            });
            //return res.send({msg})
            req.flash("success_msg", "Senhas dos alunos redefinidas com Sucesso!")
            return res.redirect("/turmas/usuariosTurma/" + idTurma)
        } else {

            /* usuario.setSenha("nova") */
            let usuario = await findUserByIdService(idUsuario)
            //return res.send({usuario})

            if (usuario.categoria == "aluno") {
                const { idTurma } = req.body
                const novoUsuario = await redefineSenhaAluno(usuario)

                const credencial = {
                    username: novoUsuario.username,
                    id: novoUsuario._id,
                    senha: novoUsuario.senha,
                    categoria: novoUsuario.categoria
                }
                await createCredencial(credencial)
                //return res.send("Ok")

                req.flash("success_msg", "Senha de " + novoUsuario.username + " alterado com Sucesso para: " + novoUsuario.senha)
                return res.redirect("/turmas/usuariosTurma/" + idTurma)

            }
            if (usuario.categoria == "professor") {

                const usuarioAlterado = await redefineSenhaProf(usuario)
                req.flash("success_msg", "Senha de " + usuarioAlterado.username + " alterado com Sucesso para: " + usuarioAlterado.senha)
                return res.redirect("/definicoes")
            }
            return res.send("Error!")

        }



    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const autorizarAdmin = async (req, res) => {
    try {
        const { autorizacao, idUser, eventoAutorizar } = req.body
        
        if(autorizacao == ""){
            req.flash("error_msg", "Erro! Não foi selecionado a Acção.")
            return res.redirect("/definicoes/autorizacoes")
        }

        let user = await findUserByIdService(idUser)
        //return res.send({user})

        /* Acesso a Definições */
        if(eventoAutorizar == "Acesso Definições"){
            if(autorizacao == "autorizar"){
                user._openDefinitionSystem = true
                await findUserBIdAndUpdate(idUser, user)
                req.flash("success_msg", "Acesso a Definições concedido ao usuário " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }else{
                user._openDefinitionSystem = false
                await findUserBIdAndUpdate(idUser, user)
                req.flash("error_msg", "Acesso a Definições retirado ao usuário " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }
        }

        /* Acesso a outros anos */
        if(eventoAutorizar == "Acesso a outros anos"){
            if(autorizacao == "autorizar"){
                user._openAnosLectivo = true
                await findUserBIdAndUpdate(idUser, user)
                req.flash("success_msg", "Acesso a outros anos Lectivos concedido ao usuário " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }else{
                user._openAnosLectivo = false
                await findUserBIdAndUpdate(idUser, user)
                req.flash("error_msg", "Acesso a outros anos Lectivos retirado ao usuário " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }
        }

        /* Deletar Usuario */
        if(eventoAutorizar == "Deletar Usuario"){
            if(autorizacao == "autorizar"){
                user._deleteUsers = true
                await findUserBIdAndUpdate(idUser, user)
                req.flash("success_msg", "Acesso a edição de Usuários para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }else{
                user._deleteUsers = false
                await findUserBIdAndUpdate(idUser, user)
                req.flash("error_msg", "Acesso a edição de Usuários para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }
        }

        /* Editar Pautas */
        if(eventoAutorizar == "Editar Pautas"){
            if(autorizacao == "autorizar"){
                user._editarPauta = true
                await findUserBIdAndUpdate(idUser, user)
                req.flash("success_msg", "Acesso a edição de Usuários para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }else{
                user._editarPauta = false
                await findUserBIdAndUpdate(idUser, user)
                req.flash("error_msg", "Acesso a edição de Pautas bloqueado para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }
        }

        /* Adicionar Aluno */
        if(eventoAutorizar == "Adicionar Aluno"){
            if(autorizacao == "autorizar"){
                user._addAluno = true
                await findUserBIdAndUpdate(idUser, user)
                req.flash("success_msg", "Acesso a adicionar Aluno para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }else{
                user._addAluno = false
                await findUserBIdAndUpdate(idUser, user)
                req.flash("error_msg", "Acesso a adicionar Aluno bloqueado para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }
        }

        /* Matricular Aluno */
        if(eventoAutorizar == "Matricular Aluno"){
            if(autorizacao == "autorizar"){
                user._matricuarAluno = true
                await findUserBIdAndUpdate(idUser, user)
                req.flash("success_msg", "Acesso a adicionar Aluno para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }else{
                user._matricuarAluno = false
                await findUserBIdAndUpdate(idUser, user)
                req.flash("error_msg", "Acesso a adicionar Aluno bloqueado para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }
        }

        /* Acessar Prof. Turma */
        if(eventoAutorizar == "Acessar Prof. Turma"){
            if(autorizacao == "autorizar"){
                user._professoresTurma = true
                await findUserBIdAndUpdate(idUser, user)
                req.flash("success_msg", "Acesso a Lista de Professores, para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }else{
                user._professoresTurma = false
                await findUserBIdAndUpdate(idUser, user)
                req.flash("error_msg", "Acesso a Lista de Professores bloqueado para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }
        }
        /* Anulação de Matrícula */
        if(eventoAutorizar == "Anulação de Matrícula"){
            if(autorizacao == "autorizar"){
                user._anularMatricula = true
                await findUserBIdAndUpdate(idUser, user)
                req.flash("success_msg", "Acesso a Anulação de Matrícula, para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }else{
                user._anularMatricula = false
                await findUserBIdAndUpdate(idUser, user)
                req.flash("error_msg", "Acesso a Anulação de Matrícula bloqueado para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }
        }

        /* Atribuição de Carga */
        if(eventoAutorizar == "Atribuição de Carga"){
            if(autorizacao == "autorizar"){
                user._atribuirCarga = true
                await findUserBIdAndUpdate(idUser, user)
                req.flash("success_msg", "Acesso a Atribuição de Carga, para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }else{
                user._atribuirCarga = false
                await findUserBIdAndUpdate(idUser, user)
                req.flash("error_msg", "Acesso a Atribuição de Carga bloqueado para " + user.username + " com Sucesso!")
                return res.redirect("/definicoes/autorizacoes")
            }
        }

        
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

/*   A   V   A   N   C   E   D       F   U   N   T   I   O   N    */

export const vercSystemLog = async (req, res) => {
    try {
        
        res.render("admin/definicoes/loginVercSystem")

        
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const vercSystemHome = async (req, res) => {
    try {
        
        return res.render("admin/definicoes/vercSystemHome")

        
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const vercSystemVerifyLog = async (req, res) => {
    try {

        const username = req.body.username;
                const user = await findUserBuNameService(username)
                // return res.send({user})
        
                if (user == null) {
                    //return res.send('Usuario não achado!')
                    res.redirect('/')
        
                } else {
                    const id = user._id
                    const token = await generateToken(user._id)
                    res.cookie("access_token", token, { maxAge: 24 * 120 * 1000, httpOnly: true })
                    
                    
                    if (user.eAdmin == 1 && user.dev == true) {
                        
                        await authMidleware(passport)
                        passport.authenticate('local', {
                            successRedirect: '/definicoes/vercSystemHome',
                            failureRedirect: '/',
                            failureFlash: true
                        })(req, res, next)
                        //return res.send("Testando...")
                    } else {

                        return res.redirect("/")
        
                    }
                            
                }
        

        
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}