import express from "express"
import session from "express-session"
import flash from 'connect-flash'
import passport from 'passport'
import fileUpload from "express-fileupload"
import cookieParser from "cookie-parser"
import fs from 'fs'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();

import handlebars from  'express-handlebars'
import path from 'path'
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
const port = 8081
import connectDB from  "./src/database/db.js"
import syDefinicoes from "./config/definicoesSy.js"
const app = express()

//Conectar BD e crir definições do systema se não existir 
   connectDB()
//Importação das rotas
    //import homeRouter from './src/routes/home.router.js'
    import candidatoRouter from './src/routes/candidato.router.js'
    import cursoRouter from "./src/routes/curso.router.js"
    import alunoRouter from './src/routes/alunos.router.js'
    import anoLectivoRouter from "./src/routes/anolectivo.router.js"
    import classeRouter from './src/routes/classe.router.js'
    import turmaRouter from './src/routes/turma.router.js'
    import disciplinaRouter from './src/routes/disciplina.router.js'
    import funcionarioRouter from './src/routes/funcionario.router.js'
    import adminRouter from './src/routes/admin.router.js'
    import professorRouter from './src/routes/professor.router.js'
    import pedagogicoRouter from './src/routes/pedagogico.router.js'
    import homeRouter from './src/routes/home.router.js'
    import secretRouter from './src/routes/secretaria.router.js'
    import rhHome from './src/routes/rh.router.js'
    import definicaoRouter from './src/routes/definicao.router.js'
    import noticiasRouter from './src/routes/new.router.js'
    import relatoriosRouter from './src/routes/relatorios.router.js'
    import informaAquiRouter from './src/routes/informaAqui.router.js'
    import financasRouter from './src/routes/financas.router.js'
    import coordenadorRouter from './src/routes/coordenador.router.js'

    //Config do Backup
    import { spawn } from "child_process"
    const DB_NAME = '\B'
    const ARCHIVE_PATH = path.join(__dirname, 'public', `${DB_NAME}.gzip`)

   
    async function backupMongoDB(){
        const child = await spawn('mongodump', [
            `--out`,
            `C://Backup`
        ])

        await child.stdout.on('data', (data) => {
            console.log('stdout:\n', data)
        })
        await child.stderr.on('data', (data) => {
            console.log('stderr:\n', data)
        })
        child.on('error', (error) => {
            console.log('error:\n', error)
        })
        await child.on('exit', (code, signal) => {
            if(code) console.log('Process extit with code:', code)
            else if (signal) console.log('Process killed with signal:', signal)
            else console.log('backup realizado com sucesso!')
        })
        
    }
    function restoreMongoDB(){
        const child = spawn('mongorestore', [
            `C://Backup`
        ])

        child.stdout.on('data', (data) => {
            console.log('stdout:\n', data)
        })
        child.stderr.on('data', (data) => {
            console.log('stderr:\n', data)
        })
        child.on('error', (error) => {
            console.log('error:\n', error)
        })
        child.on('exit', (code, signal) => {
            if(code) console.log('Process extit with code:', code)
            else if (signal) console.log('Process killed with signal:', signal)
            else console.log('restauro realizado com sucesso!')
        })
        
    }
    


//Configurações
//sessão
app.use(session({
    secret: 'tfcispb2023',
    resave: false,
    saveUninitialized: false
    //cookie: { maxAge: 30 * 60 * 1000 }//30min
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//conf middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null;
    next()
})

//Configurar para armazenar cookie
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:8081',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}))



//Confi
//Tamplate

        app.use(express.static(__dirname + '/public'));

        app.engine("handlebars", handlebars.engine({
            defaultLayout: "main",
            layoutsDir: path.join(__dirname, "views", "layouts")
        }));
        app.set("view engine", "handlebars");
        app.set("views", path.join(__dirname, "views"))
    
   //syDefinicoes() //Esta função cria a definição do sistema, uma única vez

//Body Parser
import bodyParser from 'body-parser'
import router from "./src/routes/user.routes.js"
import { authMidleware } from "./src/middlewares/auth.middleware.js"
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Registra a estratégia uma única vez, antes das rotas de autenticação.
authMidleware(passport)




//ROTAS
        //PRINCIPAL
        app.use('/', homeRouter)

        //Usuário - rotas
        app.use('/user', router)
        
        //Candidatos
        app.use('/candidatos', candidatoRouter)

        //Cursos
        app.use('/cursos', cursoRouter)

        //Alunos
        app.use('/alunos', alunoRouter)

        app.use('/anosLectivo', anoLectivoRouter)
        app.use('/classes', classeRouter)
        app.use('/turmas', turmaRouter)
        app.use('/disciplinas', disciplinaRouter)
        app.use('/funcionarios', funcionarioRouter)
        app.use('/admin', adminRouter)
        app.use('/pedagogico', pedagogicoRouter)
        app.use('/professor', professorRouter)
        app.use('/secretaria', secretRouter)
        app.use('/rh', rhHome)
        app.use('/definicoes', definicaoRouter)
        app.use('/noticias', noticiasRouter)
        app.use('/relatorios', relatoriosRouter)
        app.use('/informaAqui', informaAquiRouter)
        app.use('/financas', financasRouter)
        app.use('/homeCoordenacao', coordenadorRouter)
 
        //Rota do backup
        app.get('/backup', (req, res)=>{
            try {
            backupMongoDB()
            req.flash('success_msg', 'Backup realizado do com sucesso!')
            res.redirect('/definicoes')
            
        } catch (error) {
            res.status(500).send({mesage: error.mesage})
        }
    })

        //Rota do restauro
        app.get('/restore', (req, res)=>{
            try {
            restoreMongoDB()
            req.flash('success_msg', 'Dados restaurados com sucesso!')
            res.redirect('/definicoes')
            
        } catch (error) {
            res.status(500).send({mesage: error.mesage})
        }
    })



app.listen(port, () => console.log("Servidor SIGEB-Teste rodando..."))