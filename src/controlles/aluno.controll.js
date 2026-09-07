import { notasOrganizadas } from "../outrasF/pauta.OutF.js"
import { createAlunoService, findAllAlunosService, findAlunoByIdAndUpdate, findAlunoByIdService } from "../services/aluno.service.js"
import { findAnoLectivoActivoService, findAnoLectivoByEstadoService, findAnoLectivoById } from "../services/anoLectivo.service.js"
import { findCandByIdService, findCandByNumBIService } from "../services/candidato.service.js"
import { findClasseByIdService } from "../services/classe.service.js"
import { findCursoByIdService } from "../services/curso.service.js"
import { findFaltaBayIdAlunoService } from "../services/faltas.service.js"
//import { findClasseByIdService } from "../services/classe.service.js"
import { createNotaClasse, createNotaTrimestral } from "../services/notas.service.js"
import { findNotasDisciplinaByIdAluno, findNotasDisciplinaByIdAlunoPerfil } from "../services/notasDisciplina.service.js"
import { findAllPautasFinalService, findPautaByIdTurma } from "../services/pauta.service.js"
import { findTurmaByIdService } from "../services/turma.service.js"
import { createUserService, findUserByIdService } from "../services/user.service.js"


export const tdAlunos = async (req, res) => {
    try {
        const alunos = await findAllAlunosService()
        res.render('alunos/tdAlunos', { alunos })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const wAdmitir = async (req, res) => {
    try {
        const id = req.params.id
        const candidato = await findCandByIdService(id)
        const estado = candidato.estado
        if (estado != 'Admitido') {
            req.flash('error_msg', 'Este candidato não pode efectuar matricula! Apenas os admitidos')
            res.redirect('/candidatos')
        } else {

            res.render('alunos/adAdmintido', { candidato })
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const matricular = async (req, res) => {
    try {
        const bi = req.body.numBI
        const veryBICand = await findCandByNumBIService(bi)
        const veryBI = await findAlunoByBIService(bi)
        const candidato = req.body;
        candidato._id = req.params.id
        const erros = []
        if (veryBICand._id != req.params.id) {
            //return res.send('O Bi não coreesponde')
             erros.push({ texto: 'O número do BI não corresponde ao aluno admitido!' })
            
        } 
        if (veryBI) {
            //return res.send('Já existe um registro com este BI')
            erros.push({ texto: "Já existe um registro com este BI"})
        }
        if (veryBICand.curso != req.body.curso) {
            //return res.send('Foste admitido para o curso de ' + veryBICand.curso)
            erros.push({ texto: 'Foste admitido para o curso de ' + veryBICand.curso })
        }
        if (erros.length > 0) {
            res.render('alunos/adAdmintido', { candidato, erros })
        }else{
            //return res.send('O Bi Corresponde, pode matricular')
            /* Criar usuario */
            
            const novoUsuario = {
                username: req.body.numBI,
                senha: req.body.numBI,
                telefone: req.body.contacto
            }
            //return res.send({novoUsuario})
            /* Criar notas trimestral */
            const criarNotatrimestra = {
                primeiroTrimestre: [],
                segundoTrimestre: [],
                terceiroTrimestre: [],
                examePF: []
            }
            const notasTrimestrias = await createNotaTrimestral(criarNotatrimestra)

            /* Criar notas de classe */
            const criarNotaClass = {
                classe10: notasTrimestrias._id,
                classe11: notasTrimestrias._id,
                classe12: notasTrimestrias._id
            }
            const notasclasses = await createNotaClasse(criarNotaClass)
           const userAluno = await createUserService(novoUsuario)
           const aluno = req.body;
           aluno.usuario = userAluno._id;
           aluno.notas = notasclasses._id;
           aluno.classe = '10ª Classe';
            const al = await createAlunoService(aluno)
            req.flash('success_msg', 'Aluno matriculado com sucesso!')
            res.redirect('/alunos')

        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const fichaAluno = async (req, res) => {
    try {
        const idAluno = req.params.id
        const aluno = await findAlunoByIdService(idAluno)
        const anoLetActivo = await findAnoLectivoActivoService()

        let user = req.user
        let nivelPrivilegio01 = false
        let nivelPrivilegio02 = false
        let nivelPrivilegio03 = false
        let nivelPrivilegio04 = false
         /* Verificar o nível de privilégio no sistema */
         if (user.privilegio) {
            if (user.privilegio = 1) { nivelPrivilegio01 = true }
            if (user.privilegio = 2) { nivelPrivilegio02 = true }
            if (user.privilegio = 3) { nivelPrivilegio03 = true }
        }
        //return res.send({user})
        
        /* Veerificar se fez a reconfirmação */
        if(aluno.concluido != "Concluido" || aluno.concluido == undefined){

            if(!aluno.matriculado && user.categoria == 'aluno'){
                let msdDeErro = "Dirija-se a instituição para efectuar a reconfirmação de Matrícula."
                let msdDeErro2 = "Para ter acesso a sua conta!"
                return res.render("msgError", {msdDeErro, msdDeErro2})
            }
        }
       // return res.send("Sucess!")

        /* VERIFICAR DADOS DO ALUNO PARA ACTUALIZAR */
        if(aluno.numBI == '000Provisorio' && user.categoria == 'aluno' ){
            return res.render('alunos/actualizaDadosAluno', {aluno})
        }
        
        const turma = await findTurmaByIdService(aluno.idTurma)
        const curso = await findCursoByIdService(turma.idCurso)
        let ano = await findAnoLectivoById(turma.idAno)
        ano = ano.codigo
        let classe = await findClasseByIdService(turma.idClasse)
        classe = classe.designacao
        const usuario = await findUserByIdService(aluno.usuario)
        let notasDisciplina = await findNotasDisciplinaByIdAlunoPerfil(idAluno)
        const tdFaltas = await findFaltaBayIdAlunoService(idAluno)
        const pautas = await findPautaByIdTurma(turma._id)
        let pautaFinal = []
        let dadosFinal = []
        let disciplinas = []
        let mediasDT1Array = []
        let mediasDT2Array = []
        let mediasDT3Array = []
        let somaMediaT1 = 0
        let somaMediaT2 = 0
        let somaMediaT3 = 0
        
        let pautaFDoConselho = []
        let disciplinasOrdenadas = []
        let idPautaFinConselhada = ""
        let idPautaFin = ""
        let pauataFinalEmConselho = false
        let pauataFinalConselhada = false

 
        
        notasDisciplina.forEach(notasD => {
            if(notasD.notas.mt1 >= 0){mediasDT1Array.push(notasD.notas.mt1)}//Coletando as medias de cadadisciplina - T1
            if(notasD.notas.mt2 >= 0){mediasDT2Array.push(notasD.notas.mt2)}//Coletando as medias de cadadisciplina - T2
            if(notasD.notas.mt3 >= 0){mediasDT3Array.push(notasD.notas.mt3)}//Coletando as medias de cadadisciplina - T3

            //Marcando as negativas para destacar com a cor vermelha
            
            //Iº Trimestre
           if(notasD.notas.av1T1 < 10){notasD.notas.negativaAv1T1 = 'Negativa'}
           if(notasD.notas.av2T1 < 10){notasD.notas.negativaAv2T1 = 'Negativa'}
           if(notasD.notas.av3T1 < 10){notasD.notas.negativaAv3T1 = 'Negativa'}
           if(notasD.notas.mac1 < 10){notasD.notas.negativaMac1 = 'Negativa'}
           if(notasD.notas.pp1 < 10){notasD.notas.negativaPP1 = 'Negativa'}
           if(notasD.notas.pt1 < 10){notasD.notas.negativaPT1 = 'Negativa'}
           if(notasD.notas.mt1 < 10){notasD.notas.negativaMT1 = 'Negativa'}
            
           //IIº Trimestre
           if(notasD.notas.av1T2 < 10){notasD.notas.negativaAv1T2 = 'Negativa'}
           if(notasD.notas.av2T2 < 10){notasD.notas.negativaAv2T2 = 'Negativa'}
           if(notasD.notas.av3T2 < 10){notasD.notas.negativaAv3T2 = 'Negativa'}
           if(notasD.notas.mac2 < 10){notasD.notas.negativaMac2 = 'Negativa'}
           if(notasD.notas.pp2 < 10){notasD.notas.negativaPP2 = 'Negativa'}
           if(notasD.notas.pt2 < 10){notasD.notas.negativaPT2 = 'Negativa'}
           if(notasD.notas.mt2 < 10){notasD.notas.negativaMT2 = 'Negativa'}
            
           //IIIº Trimestre
           if(notasD.notas.av1T3 < 10){notasD.notas.negativaAv1T3 = 'Negativa'}
           if(notasD.notas.av2T3 < 10){notasD.notas.negativaAv2T3 = 'Negativa'}
           if(notasD.notas.av3T3 < 10){notasD.notas.negativaAv3T3 = 'Negativa'}
           if(notasD.notas.mac3 < 10){notasD.notas.negativaMac3 = 'Negativa'}
           if(notasD.notas.pp3 < 10){notasD.notas.negativaPP3 = 'Negativa'}
           if(notasD.notas.pt3 < 10){notasD.notas.negativaPT3 = 'Negativa'}
           if(notasD.notas.mt3 < 10){notasD.notas.negativaMT3 = 'Negativa'}

           notasD.nivelPrivilegio01 = nivelPrivilegio01
           notasD.nivelPrivilegio02 = nivelPrivilegio02
           notasD.nivelPrivilegio03 = nivelPrivilegio03
        
        });
        
        
        //Somando as médias
        mediasDT1Array.forEach(media => { somaMediaT1 = somaMediaT1 + media});
        mediasDT2Array.forEach(media => { somaMediaT2 = somaMediaT2 + media});
        mediasDT3Array.forEach(media => { somaMediaT3 = somaMediaT3 + media});
       // mediasDT2Array.forEach(media => { somaMediaT2 = somaMediaT2 + media});
        //Calculando medias de cada trimestre
        const MediaDT1 = Number((somaMediaT1 /mediasDT1Array.length).toFixed(2)); 
        const MediaDT2 = Number((somaMediaT2 /mediasDT2Array.length).toFixed(2)); 
        const MediaDT3 = Number((somaMediaT3 /mediasDT3Array.length).toFixed(2)); 

        
        //return res.send({notasDisciplina})
        
        if(pautas){
            pautas.forEach(pauta => {
                if (pauta.trimestre == 'Pauta Final' & pauta.anoLectivo == anoLetActivo._id) {
                    let numOrdem = 0
                    let alunos = []
                    pauta.dadosPauta.forEach(dado => {
                        numOrdem += 1
                        const idAluno = dado.idAluno
                        const nome = dado.nome
                        const estado = dado.estado
                        let naoApto = false
                        if (estado == "N/APTO" || estado == "N/APTA") { naoApto = true }
                        const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                        const notas = dadosOrganizado[0]
                       disciplinasOrdenadas = dadosOrganizado[1]
                        //console.log({ disciplinasOrdenadas })
                        const media = dado.media
                       /*  
                        const aluno = { "numOrdem": numOrdem, "idAluno": idAluno, 'nome': nome, "notas": notas, "media": media, "idTurma": idTurma, "estado": estado, "naoApto": naoApto }
    
                        pautaFinal.push(aluno) */
                        //return res.send("Sucesso!")
                    });
                    disciplinas = pauta.discsTurma
                    idPautaFin = pauta._id
    
                }
                if (pauta.trimestre == 'Pauta Final Conselhada' & pauta.anoLectivo == anoLetActivo._id ) {
                    pautaFDoConselho = pauta
                    idPautaFinConselhada = pauta._id
                    if (pauta.conselho == "Conselhando") { pauataFinalEmConselho = true }
                    if (pauta.conselho == "Finalizado") { pauataFinalConselhada = true }
    
                }
            });
        }
        if(!(pautaFDoConselho.length == 0)){
           // return res.send({pautaFDoConselho})
            pautaFDoConselho.dadosPauta.forEach(dado => {
                if(dado.idAluno == idAluno){
                    //console.log('Sucesso!')
                    dadosFinal = dado
                }
            });
        }
        //return res.send({notasDisciplina})
        res.render("alunos/fichaAluno", {aluno, turma, ano, usuario, notasDisciplina, tdFaltas, dadosFinal, disciplinas, MediaDT1, MediaDT2, MediaDT3, disciplinasOrdenadas, pauataFinalEmConselho, curso, nivelPrivilegio01, nivelPrivilegio03})
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const actualizaDadosAluno = async (req, res) => {
    try {
        /* let nomeFoto = ''
        if(req.file){
            nomeFoto = req.file.filename
        } */
        const {numBI, contacto, dataNascimento, idAluno, pai, mae, escolaAnt, morada, nomeEncarregado, proficao, contactoEncarregado} = req.body
        let erroMsg = ''

        const sizeBI = numBI.length
        if (sizeBI != 14) {
            erroMsg += 'Número do Bilhete invalido;\n'
        }
        //return res.send('Exito!')
        const data = req.body.dataNascimento
        const anoString = data.slice(0, 4)
        const anoInt = parseInt(anoString)
        const dataActual = new Date().getFullYear()
        
        const idade =  dataActual - anoInt
        if (idade < 14 || idade > 40) {
            erroMsg += 'A data de nascimento não corresponde com a sua idade;\n'
        }

        if(erroMsg){
            const msdDeErro = 'Volta e verifica os dados, insere corretamente:\n'+erroMsg
            return res.render('msgError', {msdDeErro} )
        }else{

            
            
            let aluno = await findAlunoByIdService(idAluno)
            aluno.numBI = numBI
            aluno.contacto = contacto
            //aluno.foto = nomeFoto
            aluno.dataNascimento = dataNascimento
            aluno.pai = pai
            aluno.mae = mae
            aluno.escolaAnt = escolaAnt
            aluno.morada = morada
            aluno.nomeEncarregado = nomeEncarregado
            aluno.proficao = proficao
            aluno.contactoEncarregado = contactoEncarregado
            aluno.idade = idade
            
            await findAlunoByIdAndUpdate(idAluno, aluno)
            //return res.send({aluno})
            req.flash('succsess_msg', 'Dados actualizado com sucesso!')
            res.redirect('/alunos/ficha/'+idAluno)
            
        }
    } catch (error) {
        return res.status(500).send({mesage: error.mesage})
    }
}

export const menu = async (req, res) => {
    try {
        const idA = req.params.id
        const aluno = await findAlunoByIdService(idA)
        const pautas = await findAllPautasFinalService()
        let matrizGeralAluno = []
        let matrizAluno10 = []
        let matrizAluno11 = []
        let matrizAluno12 = []

        pautas.forEach(pauta => {
            if(pauta.classe.designacao == "10ª Classe"){
                pauta.dadosPauta.forEach(aluno => {
                    if(aluno.idAluno == idA){
                        matrizAluno10.push(aluno)
                    }
                });
            }
            
            if(pauta.classe.designacao == "11ª Classe"){
                pauta.dadosPauta.forEach(aluno => {
                    if(aluno.idAluno == idA){
                        matrizAluno11.push(aluno)
                        
                    }
                });
            }

            if(pauta.classe.designacao == "12ª Classe"){
                pauta.dadosPauta.forEach(aluno => {
                    if(aluno.idAluno == idA){
                        matrizAluno12.push(aluno)
                        
                    }
                });
            }
        });
        //return res.send({matrizAluno10, matrizAluno11, matrizAluno12})
        return res.render("alunos/menuAluno", {aluno, matrizAluno10, matrizAluno11, matrizAluno12})
        
    } catch (error) {
        return res.status(500).send({mesage: error.mesage})
    }
}

export const actualizarNomes = async (req, res) => {
    try {
        //return res.send("Sucesso!")
        const alunos = await findAllAlunosService()
        alunos.forEach( async aluno => {
            aluno.nome = aluno.nome.toLowerCase()//replace(/(?:^|\s)\S/g, function(a) {return a.toUpperCase();});
            await findAlunoByIdAndUpdate(aluno._id, aluno)
        });
        req.flash("success_msg", "Todos nomes foram actualizados com sucesso!")
        res.redirect("/pedagogico/alunos")
    } catch (error) {
        return res.status.send({mesage: error.masage})
    }
}

export const alterarNome = async (req, res) => {
    try {
        const {idAluno, nome} = req.body
        let aluno = await findAlunoByIdService(idAluno)
        aluno.nome = nome
        await findAlunoByIdAndUpdate(idAluno, aluno)
        //return res.send({idAluno, nome})
        
        req.flash("success_msg", "Nome alterado com sucesso!")
        res.redirect("/alunos/ficha/"+idAluno)
    } catch (error) {
        return res.status(500).send({mesage: error.masage})
    }
}

export const actualizarIdAnoActivo = async (req, res) => {
    try {
        //return res.send("Sucesso!")
        const anoActivo = await findAnoLectivoByEstadoService("Activo")
        const alunos = await findAllAlunosService()
        alunos.forEach( async aluno => {
            if(aluno.matriculado == true && aluno.matricula == "Confirmada"){
                aluno.idAno = anoActivo._id
                await findAlunoByIdAndUpdate(aluno._id, aluno)
            }
        });
        req.flash("success_msg", "Todos Alunos foram actualizados com sucesso!")
        res.redirect("/pedagogico/alunos")
    } catch (error) {
        return res.status.send({mesage: error.masage})
    }
}

