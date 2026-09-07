//Para restringir acesso
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { findUserByIdService } from '../src/services/user.service.js';
import cookieParser from 'cookie-parser';
import { findFuncionariosUser } from '../src/services/funcionario.service.js';
import { findDefincoesAndUpdateService, findDefinicoesService } from '../src/services/definicao.service.js';
dotenv.config()

export const eAdmin = (req, res, next) => {
    if (req.user.eAdmin === 1) {
        //return res.send(req.user)
        return next();
    }
    req.flash('error_msg', 'Acesso não autorizado!')
    res.redirect('/')

}
export const eSecret = (req, res, next) => {
    if (req.isAuthenticated() && req.user.eAdmin == 1 || req.user.eAdmin == 2) {
        return next();
    }
    req.flash('error_msg', 'Acesso não autorizado!')
    res.redirect('/')
}
export const eSecretP = (req, res, next) => {
    if (req.isAuthenticated() && req.user.eAdmin == 1 || req.user.eAdmin == 3) {
        return next();
    }
    req.flash('error_msg', 'Acesso não autorizado!')
    res.redirect('/')
}
export const eFinanc = (req, res, next) => {
    if (req.isAuthenticated() && req.user.eAdmin == 1 || req.user.eAdmin == 4) {
        return next();
    }
    req.flash('error_msg', 'Acesso não autorizado!')
    res.redirect('/')
}

export const eJuriPresidente = async (req, res, next) => {
    const funcionario = await findFuncionariosUser(req.user._id)
    if (funcionario.cargo == "Júri Presidente" || req.user.eAdmin === 1) {
        //return res.send(req.user)
        return next();
    }
    req.flash('error_msg', 'Acesso não autorizado!')
    res.redirect('/')

}

export const eCoordCurso = async (req, res, next) => {
    const funcionario = await findFuncionariosUser(req.user._id)
    if (funcionario.cargo == "Coordenador de Curso" || req.user.eAdmin === 1) {
        //return res.send(req.user)
        return next();
    }
    req.flash('error_msg', 'Acesso não autorizado!')
    res.redirect('/')

}

export const pago = async (req, res, next) => {
    const date = new Date();
    let dia = date.getDate();
    let mes = date.toLocaleString('default', { month: 'long' });
    let ano = date.getFullYear();
    let mesActualInt = 0
    
   /*  const user = await findUserByIdService(decoded.id);
    req.userId = user._id;
    req.user = user
    return res.send({user})  */

    const definicao = await findDefinicoesService()
    


    switch (mes) {
        case "janeiro":
            mesActualInt = 1
            break;
            
        case "fevereiro":
            mesActualInt = 2
            break;

        case "março":
            mesActualInt = 3
            break;

        case "abril":
            mesActualInt = 4
            break;

        case "maio":
            mesActualInt = 5
            break;

        case "junho":
            mesActualInt = 6
            break;

        case "julho":
            mesActualInt = 7
            break;

        case "agosto":
            mesActualInt = 8
            break;

        case "setembro":
            mesActualInt = 9
            break;

        case "outubro":
            mesActualInt = 10
            break;

        case "novembro":
            mesActualInt = 11
            break;

        case "dezembro":
            mesActualInt = 12
            break;
    
        default:
            break;
    }
    
    if (definicao.fimDoPrazo == true ) {
        return res.render('admin/pago')
    }
    if((definicao.diaLimite == dia || definicao.diaLimite < dia) && (definicao.mesLimite == mesActualInt || definicao.mesLimite < mesActualInt) ){
        console.log(mesActualInt)
        definicao.fimDoPrazo = true
        await findDefincoesAndUpdateService(definicao._id, definicao)
    }
    
    return next()

}

export const veryLogin = async (req, res, next) => {
    try {
        //return res.render('admin/pago')
        const myCookes = req.headers.cookie
        //console.log(req.cookies['access_token']);
        const myToken = req.cookies['access_token']
        //return res.send({myToken})

        const authorization = 'Bear ' + myToken
        //console.log({authorization}) 
        if (!authorization) {
            //return res.status(401).send('Acesso negado!')
            req.flash('error_msg', 'Tempo esgotado! Inicie novamente a sessão!')
            res.redirect('/user/login')
        }
        const parts = authorization.split(" ")
        if (parts.length !== 2) {
            //O tokem so pode ter duas palabras!: Bear Token
            //return res.status(401).send('Acesso negado!')
            req.flash('error_msg', 'Tempo esgotado! Inicie novamente a sessão!')
            res.redirect('/user/login')
        }
        const [schema, token] = parts;
        if (schema !== 'Bear') {
            //A primeira palavra deve ser Bear!: Bear Token
            return res.status(401).send('Acesso negado!')
        }
        //Validando o token com jesonwebtoken
        jwt.verify(token, process.env.SECRET_JWT, async (erro, decoded) => {
            if (erro) {
                //Token invalido
                // return res.status(401).send('Acesso negado!')
                req.flash('error_msg', 'Tempo esgotado! Inicie novamente a sessão!')
                return res.redirect('/user/login')
            }
            const user = await findUserByIdService(decoded.id);
            if (!user) {
                return res.status(401).send('Usuario não existente!')
            }
            req.userId = user._id;
            req.user = user

            if (user.access == true) {
                return next()
            } else {
                return res.render("admin/accessNegado")
            }
            //return next()
        })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}
