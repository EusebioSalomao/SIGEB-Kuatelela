import { createFuncionarioService, findAllFuncionariosService, findFuncionarioByIdAndUpdateService, findFuncionarioByNumBIService, findFuncionariosByIdService } from "../services/funcionario.service.js"
import { createUserService } from "../services/user.service.js"

export const tdFuncionarios = async (eq, res) => {
    try {
        const funcionarios = await findAllFuncionariosService()
       // return res.send({funcionarios})
        res.render('admin/funcionarios/funcionarios', {funcionarios})
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}

export const addFuncionario = async (req, res) => {
    try {

        res.render("admin/funcionarios/cadFuncionario")
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}

export const saveFuncionario = async (req, res) => {
    try {
        if(req.file){
            //return res.send('Sucesso')
            const funcionario = req.body
            const verifF = await findFuncionarioByNumBIService(funcionario.numBI)
        if(verifF){
            req.flash('error_msg', 'Este número do BI já está cadastrado no sistema')
            res.redirect('/funcionarios/add')
        }else{
            const nome = req.body.nome
            const numBilhete = req.body.numBI
            const num = numBilhete.slice(5, 8)
            console.log(num)
            const nomeArray = nome.split(" ")
            const username0 = nomeArray[0]+'@ngunga'+num+'.'+nomeArray[1]
            const username = username0.toLocaleLowerCase()
            
            //return res.send({username})
            const novoUsuario = {
                username: username,
                senha: req.body.numBI,
                telefone: req.body.contacto,
                categoria: req.body.funcao,
                foto: req.file.filename
            }
            const userFuncionario = await createUserService(novoUsuario)
            funcionario.usuario = userFuncionario._id
            funcionario.foto = req.file.filename

            const novoF = await createFuncionarioService(funcionario)
            req.flash('success_msg', 'Funcionario cadastrado com sucesso!')
            res.redirect('/funcionarios')
        }
    }else{
        return res.send('Erro ao carregar arquivo')
    }
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}
export const addFuncionarioPriori = async (req, res) => {
    try {
       
        const funcionario = req.body
          
        const nome = req.body.nome
        const numAgente = req.body.numAgente
        const num = numAgente.slice(2, 5)
        //console.log(num)
        const nomeArray = nome.split(" ")
        const username0 = nomeArray[0]+'@ndunduma'+num+'.'+nomeArray[1]
        const username = username0.toLocaleLowerCase()
        
        const novoUsuario = {
            username: username,
            senha: req.body.numAgente,
            telefone: '',
            categoria: 'professor'
        }
        const userFuncionario = await createUserService(novoUsuario)
        funcionario.usuario = userFuncionario._id
        
        const novoF = await createFuncionarioService(funcionario)
        //return res.send({novoF})
            req.flash('success_msg', 'Funcionario cadastrado com sucesso!')
            res.redirect('/funcionarios')
        
    
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}

export const detalheF = async (req, res) => {
    try {
        const idF = req.params.id
        const funcionario = await findFuncionariosByIdService(idF)
        //return res.send({funcionario})
        res.render('admin/funcionarios/detalhFuncionario', {funcionario})
    } catch (error) {
        res.status(500).send({mesag: error.mesage})
    }
}
export const editarF = async (req, res) => {
    try {
        const idF = req.params.id
        const funcionario = await findFuncionariosByIdService(idF)
        //return res.send({funcionario})
        res.render('admin/funcionarios/editarFuncionario', {funcionario})
    } catch (error) {
        res.status(500).send({mesag: error.mesage})
    }
}
export const saveEditar = async (req, res) => {
    try {
        const idF = req.body.idF
        const funcionarioEdit = req.body
        const funcionario = await findFuncionariosByIdService(idF)
        const veryBI = await findFuncionarioByNumBIService(funcionarioEdit.numBI)
        
        if(!veryBI){
            
           // return res.send('pode actualizar...')
            const fUp = await findFuncionarioByIdAndUpdateService(idF, funcionarioEdit)
            req.flash('success_msg','Dados actualizado com sucesso!')
            res.redirect('/funcionarios/detalhes/'+idF)
        }else{
            if(veryBI._id == idF){
                //return res.send('pode actualizar...')
                const fUp = await findFuncionarioByIdAndUpdateService(idF, funcionarioEdit)
                req.flash('success_msg','Dados actualizado com sucesso!')
                res.redirect('/funcionarios/detalhes/'+idF)

            }else{

                //return res.send('Este BI ja pertence em alguem')
                req.flash('error_msg','O BI que esta tentando inserir já existe!')
                res.redirect('/funcionarios/editar/'+idF)
            }
            
        }
    } catch (error) {
        res.status(500).send({mesag: error.mesage})
    }
}