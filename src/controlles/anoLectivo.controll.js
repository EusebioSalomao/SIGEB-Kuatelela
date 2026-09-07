import { notasOrganizadas } from "../outrasF/pauta.OutF.js"
import { findAlunoByIdAndUpdate, findAlunosMatriculados } from "../services/aluno.service.js"
import { createAnoLectivoService, findAllAnosLectivo, findAnoLectivoByCodigo, findAnoLectivoByEstadoService, findAnoLectivoById, findAnoLectivoByIdAndUpdate, findAnoLectivoByIdAndeDeleteService } from "../services/anoLectivo.service.js"
import { deleteAllCandidatosService } from "../services/candidato.service.js"
import { findAllClassesByIdCurso } from "../services/classe.service.js"
import { findAllCursosService, findCursoByIdService, findCursosByIdAnoService } from "../services/curso.service.js"
import { findDefinicoesService } from "../services/definicao.service.js"
import { deleteAllFaltasServce } from "../services/faltas.service.js"
import { findAllFuncionariosService, findFuncionarioByIdAndUpdateService } from "../services/funcionario.service.js"
import { findAllMinipautasService, findMinipautaByIdAndUpdateService } from "../services/minipauta.service.js"
import { deletAllNotasTrimestraisService } from "../services/notas.service.js"
import { deleteAllNotasDisciplinasService, findAllNotasDisciplina } from "../services/notasDisciplina.service.js"
import { findAllPautasService, findPautasByIdAnoLectivoService, findPautasByIdAnoService } from "../services/pauta.service.js"
import { findAllTurmasService, findAllTurmasService2, findDadosTurmaByIdService, findTurmaByIdAndUpdService } from "../services/turma.service.js"
import { relUserSistema } from "./admin.controll.js"
import { turma } from "./turma.controll.js"


export const allAnosLectivos = async (req, res) => {
    try {
        const anosLectivo = await findAllAnosLectivo()
        anosLectivo.forEach(anoLectivo => {
            if (anoLectivo.estado == "Encerrado") {
                anoLectivo.encerrado = "Encerrado"
            }
        });
        res.render('admin/anoLectivo/tdAnosLectivo', { anosLectivo })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}
export const wAdAnoLectivo = async (req, res) => {
    try {
        const verifyAnoActivo = await findAnoLectivoByEstadoService("Activo")
        //return res.send({verifyAnoActivo})
        if (verifyAnoActivo) {
            req.flash("error_msg", "Antes de criar um novo Ano Lectivo, encerra o anterior!")
            res.redirect("/anosLectivo")
        } else {

            res.render('admin/anoLectivo/adAnoLectivo')
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}
export const adAnoLectivo = async (req, res) => {
    try {
        const anoLectivo = req.body
        const codigo = anoLectivo.codigo
        const verifyAno = await findAnoLectivoByCodigo(codigo)
        let turmas = await findAllTurmasService()
        if (verifyAno) {
            req.flash('error_msg', 'Já existe um ano lectivo com o código ' + codigo)
            res.redirect('/anosLectivo/add')
        } else {
            const novoAno = await createAnoLectivoService(anoLectivo)
            turmas.forEach( async turma => {
                turma.idAno = novoAno._id
                await findTurmaByIdAndUpdService(turma._id, turma)
            });
            req.flash('success_msg', 'Novo ano cadastrado!')
            res.redirect('/anosLectivo')
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

export const deletarAnoLectivo = async (req, res) => {
    try {
        const idAno = req.body.idAno
        const anoDeletado = await findAnoLectivoByIdAndeDeleteService(idAno)
        const nome = anoDeletado.codigo
        req.flash('error_msg', 'Ano lectivo ' + nome + ' apagado!')
        res.redirect('/anosLectivo')
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

export const wConfigAnoLectivo = async (req, res) => {

    try {
        const user = req.user
        let eAdmin = ''
        if (user.eAdmin) {
            eAdmin = 'Sim'
        }
        //return res.send({user})
        const idAno = req.params.id
        const anoLectivo = await findAnoLectivoById(idAno)
        //return res.send({anoLectivo})
        let candidaturaAberta = ''
        if (anoLectivo.candidatura == 'Aberta') {
            candidaturaAberta = 'sim'
        }
        //const cursos = await findCursosByIdAnoService(idAno)
        const cursos = await findAllCursosService()
        const activo = anoLectivo.estado == 'Activo' ? true : false
        //////////////////////////////////////////////////////////////
        res.render('admin/anoLectivo/configAno', { anoLectivo, cursos, candidaturaAberta, eAdmin, activo })
        /* if(anoLectivo.estado == 'Activo'){
        }else{
            req.flash('error_msg', 'Este ano não esta activo')
            res.redirect('/anosLectivo')
        } */
    } catch (error) {
        res.status(500).send({ message: 'novo:' + error.message })
    }
}

export const activarAnoLectivo = async (req, res) => {
    try {
        const idAno = req.params.id
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        if (anoLectivo) {
            req.flash('error_msg', 'Um ano já esta activo! Encerra o ano Lectivo anterior para activar o outro.')
            res.redirect('/anosLectivo')
        } else {
            const anoLectivoActivar = await findAnoLectivoById(idAno)
            //res.send({anoLectivoActivar})
            anoLectivoActivar.estado = estado
            const codigo = anoLectivoActivar.codigo
            await findAnoLectivoByIdAndUpdate(idAno, anoLectivoActivar)
            req.flash('success_msg', 'Ano Lectivo ' + codigo + ' activado')
            res.redirect('/anosLectivo')

        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
/* Encerrar o ano Lectivo */
export const desactivarAnoLectivo = async (req, res) => {
    try {
        const idAno = req.body.idAno
        const estado = 'Encerrado'
        const matriculado = true
        const anoLectivo = await findAnoLectivoById(idAno)
        await deleteAllCandidatosService()
        //return res.send("Sucesso!")

        let funcionarios = await findAllFuncionariosService()
        let miniPautas = await findAllMinipautasService()
        let turmas = await findAllTurmasService()
        let alunos = await findAlunosMatriculados(matriculado)
        let pautas = await findAllPautasService()

        await deletAllNotasTrimestraisService()
        await deleteAllNotasDisciplinasService()
        await deleteAllFaltasServce()
        //return res.send({pautas})
        let notasDisciplina = await findAllNotasDisciplina()
        
        funcionarios.forEach(async funcionario => {
            funcionario.disciplinas = []
            funcionario.minipautas = []
            funcionario.turmas = []
            //funcionario.cargo = ""
            await findFuncionarioByIdAndUpdateService(funcionario._id, funcionario)
        });
        
        miniPautas.forEach( async miniPauta => {
            if(miniPauta.nomeProfessor == "Professor"){
                miniPauta.nomeProfessor = miniPauta.idProfessor.nome
            }
            if(miniPauta.codigoTurma == "Turma"){
                miniPauta.codigoTurma = miniPauta.idTurma.codigo
            }
            miniPauta.idProfessor = null
            miniPauta.idTurma = null
            
            await findMinipautaByIdAndUpdateService(miniPauta._id, miniPauta)
        });
        
        turmas.forEach( async turma => {
            //turma.juriPresidente = null
            turma.reconfirmaAprovados = false
            
            await findTurmaByIdAndUpdService(turma._id, turma)
        });

        if(alunos){
            alunos.forEach( async aluno => {
                aluno.matriculado = false
                aluno.matricula = "Não confirmada"
                aluno.idAno = ""
                await findAlunoByIdAndUpdate(aluno._id, aluno)
            });
        }
        
        //let funcionariosUpdate = await findAllFuncionariosService()

        if (!anoLectivo) {
            req.flash('error_msg', 'Ano Lectivo não encontrado')
            res.redirect('/anosLectivo/config/' + idAno)
        } else {
            //res.send('Ainda não existe um ano activo')
            anoLectivo.estado = estado
            anoLectivo.encerrado = true
            const codigo = anoLectivo.codigo
            await findAnoLectivoByIdAndUpdate(idAno, anoLectivo)
            req.flash('success_msg', 'Ano Lectivo ' + codigo + ' Encerrado!')
            res.redirect('/anosLectivo')

        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const gerirCurso = async (req, res) => {
    try {
        const idCurso = req.body.idCurso

        const idAno = req.body.idAno


        const ano = await findAnoLectivoById(idAno)
        const curso = await findCursoByIdService(idCurso)
        const classes = await findAllClassesByIdCurso(idCurso)

        //const anoLectivo = await findAnoLectivoById(idAno)
        // console.log(anoLectivo)
        res.render('admin/cursos/gerirCurso', { curso, ano, classes })
    } catch (error) {
        res.status(500).send({ message: 'novo:' + error.message })
    }
}

export const editAnoLectivo = async (req, res) => {
    try {
        const id = req.params.id
        const anoLectivo = await findAnoLectivoById(id)
        if (anoLectivo) {
            res.render('admin/anoLEctivo/editAnoLectivo', { anoLectivo })
        } else {
            req.flash('error_msg', 'O ano que esta tentando editar não existe')
            res.redirect('/anosLectivo')
        }
    } catch (error) {
        res.status(500).send({ message: 'erro, editAnoLectivo:' + error.message })
    }
}

export const editSave = async (req, res) => {
    try {
        const anoLectivo = req.body
        const id = req.body.id
        const codigo = anoLectivo.codigo
        const verifyAno = await findAnoLectivoByCodigo(codigo)
        if (verifyAno && verifyAno._id != id) {
            req.flash('error_msg', 'Já existe um ano lectivo com o código ' + anoLectivo.codigo)
            res.redirect('/anosLectivo/edit/' + id)
        } else {

            const novoAnoEdit = await findAnoLectivoByIdAndUpdate(id, anoLectivo)
            req.flash('success_msg', 'Ano editado com sucesso!')
            res.redirect('/anosLectivo/')
        }

    } catch (error) {
        res.status(500).send({ message: 'erro, editSave:' + error.message })

    }
}

export const abrirCandidatura = async (req, res) => {
    try {
        const idAno = req.params.id
        
        const cursos = await findAllCursosService()
        const anoLectivo = await findAnoLectivoById(idAno)
        if (cursos == '') {
            req.flash('error_msg', 'Não é possível abrir a candidatura. Não ha curso cadastrado!')
            res.redirect('/anosLectivo/config/' + idAno)
        } else {
            //return res.send('cursos achados!')
            anoLectivo.candidatura = 'Aberta'
            await findAnoLectivoByIdAndUpdate(idAno, anoLectivo)
            req.flash('success_msg', 'Candidaturas para o ano lectivo ' + anoLectivo.codigo + ' aberta!')
            res.redirect('/anosLectivo/config/' + idAno)

        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const ecerrarCandidatura = async (req, res) => {
    try {
        const idAno = req.params.id
        const anoLectivo = await findAnoLectivoById(idAno)

        //return res.send('cursos achados!')
        anoLectivo.candidatura = 'Encerrada'
        await findAnoLectivoByIdAndUpdate(idAno, anoLectivo)
        req.flash('error_msg', 'Candidaturas encerrada!')
        res.redirect('/anosLectivo/config/' + idAno)


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

/* Método para visualizar as pautas de um determinado ano Lectivo */

export const pautas = async (req, res) => {
    try {
        let idAno = req.params.id
        const anoLectivo = await findAnoLectivoById(idAno)
        if (!anoLectivo) {
            const msdDeErro = 'Ano lectivo não encontrdo!'
            return res.render('msgError', { msdDeErro })
        }
        
        idAno = anoLectivo._id
        const pautas = await findPautasByIdAnoLectivoService(idAno)
        let turmas = await findAllTurmasService2()
        //return res.send({turmas})
        const pautas10 = []
        const pautas11 = []
        const pautas12 = []
        turmas.forEach(turma => {
            if (turma.idClasse.designacao == '10ª Classe') {
                turma.idAno = idAno
                pautas10.push(turma)
            }
            if (turma.idClasse.designacao == '11ª Classe') {
                turma.idAno = idAno
                pautas11.push(turma)
            }
            if (turma.idClasse.designacao == '12ª Classe') {
                turma.idAno = idAno
                pautas12.push(turma)
            }

        });
        //return res.send({pautas10})
        res.render('admin/anoLectivo/pautas', { turmas, pautas10, pautas11, pautas12, anoLectivo })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const pauta2 = async (req, res) => {
    try {
        const user = req.user
       // return res. send({user})
        const {idTurma, idAno} = req.body
        
        const anoLectivo = await findAnoLectivoById(idAno)
        
        /* Correção de 2024 */
        const pautasDoAno = await findPautasByIdAnoLectivoService(anoLectivo._id)
        //return res.send({pautasDoAno})
        //const TDpautas = await findPautaByIdTurma(idTurma)
        let pautas = []
        pautasDoAno.forEach(pauta => {
            //console.log({ pauta })
            if (pauta.turma != null) {
                if (pauta.turma._id == idTurma) { pautas.push(pauta) }
            }
        });//Fim da correção
        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []
        let pautaFConselhada = []


        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        //const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        //return res.send({curso})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        let idPautaFinConselhada = ''
        let pauataFinalEmConselho = false
        let pauataFinalConselhada = false
        let presidente = ''
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }


        //return res.send({pautas})
        pautas.forEach(pauta => {

            //Se for Primeiro trimestre
            if (pauta.trimestre == 'Primeiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    //console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id

            }
            //Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    //console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT2.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT2 = pauta._id

            }//Fim do II Trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    //console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT3.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT3 = pauta._id

            }
            //Fim do III Trimestre

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome
                    const genero = dado.genero
                    const estado = dado.estado
                    const aprovar = dado.aprovar
                    const reprovar = dado.reprovar
                    const desistente = dado.desistente
                    const recurso = dado.recurso

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "genero": genero, "notas": notas, "media": media, "estado": estado, aprovar, reprovar, desistente, recurso }

                    pautaF.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaFin = pauta._id

            }
            //Fim Pauta final

            //Se for pauta final Conselhada
            if (pauta.trimestre == 'Pauta Final Conselhada') {
                pautaFConselhada = pauta
                idPautaFinConselhada = pauta._id
                if (pauta.conselho == "Conselhando") { pauataFinalEmConselho = true }
                if (pauta.conselho == "Finalizado") { pauataFinalConselhada = true }

                presidente = pautaFConselhada.membrosConselho[0].nomePresidente
            }
            //Fim Pauta final Conselhada
        });

        //return res.send({pautaT2})
        res.render('admin/anoLectivo/pauta2', { disciplinasOrdenadas, pautaT1, pautaT2, pautaT3, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaT1, idPautaT2, idPautaT3, idPautaFin, pautaFConselhada, idPautaFinConselhada, presidente, pauataFinalEmConselho, classeExame, user })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
