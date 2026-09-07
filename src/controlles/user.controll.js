import { createUserService, findAllUsers, findByUsernameService, findUserBIdAndUpdate, findUserBuNameService, findUserByIdAndDelet, findUserByIdService, findUsuariosByCategoriaService, generateToken } from "../services/user.service.js"
import { authMidleware } from '../middlewares/auth.middleware.js'
import passport from 'passport'
import { findAlunoByIdAndUpdate, findAlunoByIdService, findAlunoByIdUser } from "../services/aluno.service.js";
import cookieParser from 'cookie-parser'
import { findFuncionariosUser } from "../services/funcionario.service.js";
import { createRelUserService } from "../services/relUsuarios.service.js";
import { findTurmaByIdService } from "../services/turma.service.js";
import { redefineSenhaProf } from "../outrasF/definicoes.OutF.js";
import { createCredencial } from "../services/credencial.service.js";
import { editarSenhaUserF } from "../outrasF/user.OutF.js";

export const allUsers = async (req, res) => {
    try {
        const user = req.user
        let usuarios = await findAllUsers();
        //return res.send({user})

        /* Verificar se o user logado tem permissão de deletar outros usuários */
        if(user._deleteUsers){
            usuarios.forEach(usuario => {
                usuario._deleteUsers = true
            });
        }

        if (!usuarios) {
            req.flash('error_messag', 'Não ha usuário registrado!')
            res.redirect('/')
        } else {
            res.render('admin/tdUsers', { usuarios })
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const telaLogin = (req, res) => {
    res.render('admin/login')
}

export const login = async (req, res, next) => {
    passport.authenticate('local', async (erro, user, info) => {
        try {
            if (erro) {
                return next(erro)
            }

            // Nenhum cookie, sessão ou redirecionamento é criado
            // enquanto usuário e senha não forem validados.
            if (!user) {
                req.flash('error_msg', info?.message || 'Usuário ou senha inválidos!')
                return res.redirect('/user/login')
            }

            req.logIn(user, async (erroLogin) => {
                if (erroLogin) {
                    return next(erroLogin)
                }

                const id = user._id
                const token = await generateToken(id)
                res.cookie("access_token", token, {
                    maxAge: 24 * 120 * 1000,
                    httpOnly: true
                })

                const date = new Date()
                const relUsuarios = {
                    username: user.username,
                    idUsuario: user._id,
                    diaDeAcesso: date.getDate(),
                    mesDeAcesso: date.toLocaleString('default', { month: 'long' }),
                    anoDeAcesso: date.getFullYear(),
                    horaDeAcesso: date.getHours() + ' horas',
                    categoria: user.categoria
                }

                let destino

                if (user.eAdmin == 1) {
                    relUsuarios.nomeDoUsuario = user.username + " - Administrador"
                    destino = '/admin/' + id
                } else if (user.categoria == 'secretario') {
                    relUsuarios.nomeDoUsuario = user.username
                    destino = '/secretaria/'
                } else if (user.categoria == 'professor') {
                    const funcionario = await findFuncionariosUser(id)
                    relUsuarios.nomeDoUsuario = funcionario.nome
                    relUsuarios.idProfessor = funcionario._id
                    destino = '/professor/' + id
                } else if (user.categoria == 'aluno') {
                    const aluno = await findAlunoByIdUser(id)
                    relUsuarios.nomeDoUsuario = aluno.nome
                    destino = '/alunos/ficha/' + aluno._id
                } else if (user.categoria == 'pedagogico') {
                    destino = '/pedagogico'
                } else if (user.categoria == 'financeiro') {
                    destino = '/financas/'
                }

                if (!destino) {
                    req.logout(() => {})
                    res.clearCookie('access_token')
                    req.flash('error_msg', 'Categoria de usuário sem acesso configurado!')
                    return res.redirect('/user/login')
                }

                if (!user.dev) {
                    await createRelUserService(relUsuarios)
                }
                let genero = ""
                if(user.categoria == 'aluno' || user.categoria == 'professor'){
                    const funcionario = await findFuncionariosUser(id)
                    const aluno = await findAlunoByIdUser(id)
                    if(funcionario){
                        genero = funcionario.genero
                    }
                    if(aluno){
                        genero = aluno.genero
                    }
                } 

                if(genero == 'Feminino' || genero == 'feminino' || genero == 'f' || genero == 'F'){
                    req.flash('success_msg', 'Bem-vinda de volta, ' + user.username + '!')
                } else {
                    req.flash('success_msg', 'Bem-vindo de volta, ' + user.username + '!')
                }
                if(genero == ""){
                    req.flash('success_msg', 'Bem-vindo(a) de volta, ' + user.username + '!')
                }

                return res.redirect(destino)
            })
        } catch (error) {
            return next(error)
        }
    })(req, res, next)
}

export const logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err) }
        res.clearCookie('access_token');
        req.flash('success_msg', 'Sua sessão foi encerrada!')
        res.redirect('/user/login')

    })
}

export const wAddUser = (req, res) => {
    res.render('admin/addUser')
}
export const addUser = async (req, res) => {
    try {
        if (req.file) {
            //return res.send('Sucesso')
            const usuario = req.body.username
            const senha = req.body.senha;
            const telefone = req.body.telefone;
            let categoria = req.body.categoria;
            if (req.body.categoria === 'Selecionar') {
                categoria = 'Aluno'
            }
            const verifyUser = await findByUsernameService(usuario)
            if (verifyUser) {
                req.flash('error_msg', 'Nome de usuário já existente!')
                res.redirect('/user/add')
            } else {
                const novoUsuario = {
                    username: usuario,
                    senha: senha,
                    telefone: telefone,
                    categoria: categoria,
                    foto: req.file.filename
                }

                //return res.send({novoUsuario})
                switch (categoria) {
                    case "admin":
                        novoUsuario.eAdmin = 1
                        break;

                    case "secretario":
                        novoUsuario.eAdmin = 2
                        break;

                    case "pedagogico":
                        novoUsuario.eAdmin = 3
                        break;

                    case "financeiro":
                        novoUsuario.eAdmin = 4
                        break;

                    default:
                        break;
                }

                console.log(novoUsuario)
                await createUserService(novoUsuario);
                req.flash('success_msg', 'Usuário cadastrado com sucesso!')
                res.redirect('/user/allUsers')
            }

        } else {

            return res.send('Falha ao carregar foto')
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const deletUser = async (req, res) => {
    try {
        const id = req.params.id
        const usuario = await findUserByIdAndDelet(id)
        if (!usuario) {
            req.flash('error_msg', 'Voce está tentar apagar usuário não existente')
            res.redirect('/user/allUsers')
        } else {
            req.flash('error_msg', 'Usuário xcluido com sucesso')
            res.redirect('/user/allUsers')
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const wEditUser = async (req, res) => {
    try {
        const id = req.params.id
        const usuario = await findUserByIdService(id)
        if (!usuario) {
            req.flash('error_msg', 'Voce está tentar actualizar usuário não existente')
            res.redirect('/user/allUsers')
        } else {
            res.render('admin/editUser', { usuario })
        }
    } catch (error) {
        res.status(500).send({ msg: error.mesage })
    }
}

export const editUser = async (req, res) => {
    try {
        const { id, novaSenha, novaSenha2 } = req.body
        const username = req.body.username
        const telefone = req.body.telefone
        if (username == '' || username.length < 2) {
            req.flash('error_msg', 'Nome de usuário invalido')
            res.redirect('/user/editUser/' + id)
        } else {
            if (novaSenha != novaSenha2 || novaSenha == "") { return res.send("As senhas não são iguais") }
            const usuario = await findUserByIdService(id)
            if (!usuario) {
                req.flash('error_msg', 'Este usuário não existe!')
                res.redirect('/user/allUsers')
            } else {
                usuario.username = username
                usuario.telefone = telefone
                usuario.senha = novaSenha
                await findUserBIdAndUpdate(id, usuario);
                //return res.send({usuario, novoUsuario})
                req.flash('success_msg', 'Dados do usuário alterado com sucesso!')
                res.redirect('/user/allUsers')

            }
        }
    } catch (error) {
        res.status(500).send({ mesag: error.mesage })
    }
}

export const perfil = async (req, res) => {
    try {
        const userLog = req.user
        const username = userLog.username;
        const user = await findUserBuNameService(username)
        const id = user._id
        //return res.send({user})

        if (user == '') {
            return res.send('Usuario não achado!')

        } else {
            //return res.send('Usuario existente')
            if (user.eAdmin == 1) {
                //return res.send('Usuario Admin')

                res.redirect('/admin/' + id)

            } else {
                if (user.categoria == 'professor') {
                    res.redirect('/professor/' + id)
                } else {

                    if (user.categoria == 'aluno') {
                        const aluno = await findAlunoByIdUser(id)
                        const idAluno = aluno._id
                        //return res.send({aluno})
                        res.redirect('/alunos/ficha/' + idAluno)
                    }
                    if (user.categoria == 'pedagogico') {
                        res.redirect('/pedagogico/')
                    }
                    if (user.categoria == 'secretario') {
                        res.redirect('/secretaria/')
                    }
                }
                /*  else {
                    await authMidleware(passport)
                    passport.authenticate('local', {
                        successRedirect: '/inicio',
                        failureRedirect: '/user/login',
                        failureFlash: true
                    })(req, res, next)
                } */

            }


        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const createNewUserAluno = async (req, res) => {
    try {
        //CRIAR USUÁRIO
        const idAluno = req.params.id
        const aluno = await findAlunoByIdService(idAluno)
        const turma = await findTurmaByIdService(aluno.idTurma)
        const nomeArray = aluno.nome.split(" ")
        const username0 = nomeArray[0] + '@ndunduma' + turma.codigo + '.' + nomeArray[1]
        const username = username0.toLocaleLowerCase()
        const senha = turma.codigo + '-' + nomeArray[1]

        const novoUsuario = {
            username: username,
            senha: senha,
            categoria: 'aluno',
            telefone: ''
        }



        const veryUser = await findByUsernameService(username)
        if (veryUser) {
            //return res.send('Não foi possível adicionar aluno. Já ha um usuário com este nome!')
            req.flash('error_msg', 'Não foi possível adicionar aluno. Nome de usuário já existente! (Ao criar conta do aluno)')
            res.redirect('/turmas/turma/' + idTurma)
        } else {

            const userAluno = await createUserService(novoUsuario)
            aluno.usuario = userAluno._id;
            await findAlunoByIdAndUpdate(aluno._id, aluno)
            //return res.send('Sucesso!')

            req.flash('success_msg', 'Novo usuario criado com sucesso!')
            res.redirect('/turmas/usuariosTurma/' + turma._id)
        }

    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const funcionariosUsers = async (req, res) => {
    try {
        const categoria = "professor"
        let usuarios = await findUsuariosByCategoriaService(categoria)
        return res.render("admin/tdUsers", { usuarios })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const restaurar = async (req, res) => {
    try {
        const { idUser } = req.body
        const usuario = await findUserByIdService(idUser)

        let novoUsuario = await redefineSenhaProf(usuario)
        const credencial = {
            username: novoUsuario.username,
            id: novoUsuario._id,
            senha: novoUsuario.senha,
            categoria: novoUsuario.categoria
        }
        await createCredencial(credencial)
        req.flash("success_msg", "Senha de " + novoUsuario.username + " alterado com Sucesso para: " + novoUsuario.senha)
        return res.redirect("/user/funcionarios")
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const alterarSenha = async (req, res) => {
    try {
        const user = req.user
        const { idUser, senhaAntiga, novaSenha, novaSenha2, email, telefone } = req.body
        let erros = []
        if(novaSenha.length < 5){erros.push({texto: "A senha deve ter no minimo 5 caracteres" })}
        if(novaSenha != novaSenha2){erros.push({texto: "As senhas não são iguais!" })}


        if(erros.length > 0){ return res.render("admin/alterarSenha", {user, erros, novaSenha, novaSenha2, email, telefone}) }
        const usuario = await findUserByIdService(idUser)

        let novoUsuario = await editarSenhaUserF(usuario, novaSenha, email, telefone)

        req.logout(function (err) {
        if (err) { return next(err) }
        res.clearCookie('access_token');
        req.flash("success_msg", "Senha alterada com Sucesso! Faça login com a nova senha: " + novoUsuario.senha)
        res.redirect('/')

        })
        
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}