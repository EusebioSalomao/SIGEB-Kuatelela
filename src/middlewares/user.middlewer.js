
export const validFildUser = (req, res, next) => {
    try {
        const erros = []
       
        if (!req.body.username || req.body.username.length < 4 || typeof req.username == undefined || req.body.username == null) {
            erros.push({ texto: 'O Nome de usuario invalido' })
        }

        if (!req.body.senha || typeof req.senha == undefined || req.body.senha == null) {
            erros.push({ texto: 'senha invalida' })
        }
        if (req.body.senha !== req.body.senha2) {
            erros.push({ texto: 'As senhas não correspondem!' })
        }

        if(req.body.senha.length < 2){
            erros.push({texto: 'Senha muito curta! A senha deve ter no mínimo 4 caracter.'})
        }

        if(erros.length > 0){
            return res.render('admin/addUser', {erros})
        }
        next()
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}