import ejs from 'ejs'
import path from 'path'
import pdf from 'html-pdf'

import { createAlunoService, findAllAlunosService, findAlunoByBIService, findAlunoByIdAndUpdate, findAlunoByIdService, findAlunosByIdTurma, findAlunosByMatriculasService } from "../services/aluno.service.js";
import { findAnoLectivoById, findAnoLectivoByEstadoService, findAnoLectivoActivoService } from "../services/anoLectivo.service.js";
import { findAllCandidatosByCursoService, findCandByIdAndUpdateService, findCandByIdService, findCandByNumBIService } from "../services/candidato.service.js";
import { addTurmaClasseService, findAllClassesByIdCurso, findClasseByIdAndUpdate, findClasseByIdService } from "../services/classe.service.js";
import { findCursoByIdService } from "../services/curso.service.js";
import { findAllDiscplinasService, findDisciplinaByIdAndUpdateService, findDisciplinaByIdClasse, findDisciplinaByIdService } from "../services/disciplina.service.js";
import { deleteMinipautaProfService, deleteTurmaProfService, findAllFuncionariosService, findFuncionarioByIdAndUpdateService, findFuncionariosByIdService } from "../services/funcionario.service.js";
import { creatMinipautaService, findMiniPautaByIdAndDelete, findMinipautasByIdTurma, findOneMinipautaByIdTurma } from "../services/minipauta.service.js";
import { createNotaTrimestral } from "../services/notas.service.js";
import { createNotasDisciplinaService, findNotasDisciplinaByIdMinipautaService } from "../services/notasDisciplina.service.js";
import { createPautaService, findAllPautasFinalService } from "../services/pauta.service.js";
import { createTurmaService, findAllTurmasAndClasseService, findAllTurmasService, findTurmaByIdAndUpdService, findTurmaByIdCursoService, findTurmaByIdDetalhadoService, findTurmaByIdService, findTurmaByIdServiceDetalhado, findTurmasByIdAno, findTurmasByIdClassedService } from "../services/turma.service.js";
import { createUserService, findAllUsers } from "../services/user.service.js";
import { findAllFaltasService, findFaltaBayIdTurmaService } from '../services/faltas.service.js';
import aluno from '../models/aluno.modell.js';
import { findDefinicoesService } from '../services/definicao.service.js';
import { findAllCredenciasService } from '../services/credencial.service.js';

export const tdTurmas = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        if (!anoLectivo) {
            const msdDeErro = 'Não existe nenhum ano Lectivo Activo!'
            return res.render('msgError', { msdDeErro })
        }
        const idAno = anoLectivo._id
        const turmas = await findTurmasByIdAno(idAno)
        //return res.send({turmas})
        const turmas10 = []
        const turmas11 = []
        const turmas12 = []
        turmas.forEach(element => {
            if (element.idClasse.designacao == "10ª Classe") {
                turmas10.push(element)
            }
            if (element.idClasse.designacao == "11ª Classe") {
                turmas11.push(element)
            }
            if (element.idClasse.designacao == "12ª Classe") {
                turmas12.push(element)
            }
        });
        res.render('secretaria/turmas', { turmas10, turmas11, turmas12, anoLectivo })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const addTurma = async (req, res) => {
    try {
        const turma = req.body;
        const idAno = req.body.idAno
        const idCurso = turma.idCurso
        let idTurma = ''

        let exist = ''
        if (req.body.periodo == 'selecionar') {
            exist = 'Não foi possível criar a turma porque faltou selecionar o período!'
        }

        const verifyAllTurmas = await findTurmaByIdCursoService(idCurso)

        verifyAllTurmas.forEach(element => {
            if (element.codigo == req.body.codigo) {
                exist = 'Esta turma já está adicionada!'
            }
        });
        const classes = await findAllClassesByIdCurso(idCurso)
        if (exist == '') {
            let idClasse = ''
            if (!classes) {
                return res.send('Nenhuma classe encontrada"')
            } else {
                classes.forEach(element => {
                    if (element.designacao === turma.classe) {
                        console.log("Classe achada!")
                        idClasse = element._id
                        // element.turmas.push(idTurma)
                    } else {
                        console.log("Não achada!")
                    }
                });
                turma.idClasse = idClasse
                const novaTurma = await createTurmaService(turma);
                idTurma = novaTurma._id
                const novaPauta = {
                    anoLectivo: idAno,
                    turma: idTurma,
                    classe: idClasse,
                    curso: idCurso
                }
                const pautaCriada = await createPautaService(novaPauta)
                //return res.send({pautaCriada})

            }
            const classeUpdade = await addTurmaClasseService(idClasse, idTurma)

            const ano = await findAnoLectivoById(idAno)
            const curso = await findCursoByIdService(idCurso)
            const msg = "Turma adicionada com sucesso"
            //res.redirect('/turmas/turma/'+idTurma)
            res.render('admin/cursos/gerirCurso', { curso, ano, classes, msg })
        } else {
            const ano = await findAnoLectivoById(idAno)
            const curso = await findCursoByIdService(idCurso)
            res.render('admin/cursos/gerirCurso', { curso, ano, classes, exist })
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const gerirTurmas = async (req, res) => {
    try {
        const idAno = req.body.idAno
        const idCurso = req.body.idCurso
        const idClasse = req.body.idClasse

        const ano = await findAnoLectivoById(idAno)
        const curso = await findCursoByIdService(idCurso)
        const classe = await findClasseByIdService(idClasse)
        const turmas = await findTurmasByIdClassedService(idClasse)

        let classe10 = ''
        let classe11 = ''
        let classe12 = ''
        if (classe.designacao == "10ª Classe") {
            classe10 = classe.designacao
        }
        if (classe.designacao == "11ª Classe") {
            classe11 = classe.designacao
        }
        if (classe.designacao == "12ª Classe") {
            classe12 = classe.designacao
        }

        const disciplinas = await findDisciplinaByIdClasse(idClasse)
        //return res.send({disciplinas})
        res.render('admin/turmas/gerirTurmas', { disciplinas, turmas, ano, classe, curso, classe10, classe11, classe12 })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const turma = async (req, res) => {
    try {
        //return res.send('Não estas logado!')
        const user = req.user
        let nivelPrivilegio01 = false
        let nivelPrivilegio02 = false
        let nivelPrivilegio03 = false
        let nivelPrivilegio04 = false
        const todasTurmas = await findAllTurmasAndClasseService()
        const date = new Date();
        let anoEconoAct = date.getFullYear();
        if (!user) {
            req.flash('error_msg', 'Inicie sua sessão!')
            res.redirect('/user/login')
        } else {
            let eProf = ''

            const idTurma = req.params.id
            let turma = await findTurmaByIdService(idTurma)
            const turmaDetalhado = await findTurmaByIdDetalhadoService(idTurma)
            turma.periodo = turma.periodo.toLocaleUpperCase();
            const idClasse = turma.idClasse
            const classe = await findClasseByIdService(idClasse)
            const ano = await findAnoLectivoById(turma.idAno)
            const curso = await findCursoByIdService(turma.idCurso)
            const candidatos = await findAllCandidatosByCursoService(curso.descricao)
            let alunos = await findAlunosByIdTurma(idTurma)
            const matriculado = true
            let tdAlunosMatriculados = await findAlunosByMatriculasService(matriculado)
            let tdAlunosGeral = await findAllAlunosService()
            const definicoes = await findDefinicoesService()

            // res.send({definicoes})
            let naoVagas = ''
            if (classe.numVagas < 1) {
                naoVagas = 'Não existe mais vagas nesta classe!'
            }
            let candMatricular = []
            let numeroOrd = 1
            candidatos.forEach(aluno => {
                aluno.numeroOrd = numeroOrd
                if (aluno.estado == "Admitido" || aluno.estado == "Admitida") {
                    if (aluno.idade == null) { aluno.idade = anoEconoAct - aluno.anoNascimento }
                    aluno.idTurma = idTurma
                    candMatricular.push(aluno)
                    numeroOrd++
                }
            });

            let classe10 = ''
            let classe11 = ''
            let classe12 = ''
            if (classe.designacao == "10ª Classe") {
                classe10 = classe.designacao
            }
            if (classe.designacao == "11ª Classe") {
                classe11 = classe.designacao
            }
            if (classe.designacao == "12ª Classe") {
                classe12 = classe.designacao
            }

            //PROCURAR ALUNOS SEM ATRIBUTO DO GENERO E ATRIBUIR IDADE
            let achado = ''
            let alunosSemGenero = []
            let numOrdem = 1
            alunos.forEach(aluno => {
                if (aluno.genero === undefined || aluno.genero == 'Não definido' || aluno.genero == 'Não definido' || aluno.genero == null) {
                    const anoNascimento = req.body.anoNascimento
                    if (aluno.anoNascimento) { aluno.idade = anoEconoAct - aluno.anoNascimento }
                    alunosSemGenero.push(aluno)
                    achado = 'Achado'
                }
                if (user._anularMatricula == true) { aluno._anularMatricula = true }

                aluno.numOrdem = numOrdem
                numOrdem++
            });
            

            /* Verificar o nível de privilégio do sistema */
            if (user.privilegio) {
                if (user.privilegio = 1) { nivelPrivilegio01 = true }
                if (user.privilegio = 2) { nivelPrivilegio02 = true }
                if (user.privilegio = 3) { nivelPrivilegio03 = true }
            }

            /* Filtrar alunos matriculados */
            let alunosMatriculados = []
            let alunosNaoReconfirmados = []
            alunos.forEach(aluno => {
                //aluno.matriculado = false
                //aluno.matricula = "Não cofirmada"

                if (aluno.matriculado == true) { alunosMatriculados.push(aluno) } else { alunosNaoReconfirmados.push(aluno) }

            });
            //Função temporária para remover alunos não matriculados
            /*  alunosNaoReconfirmados.forEach( async aluno => {
                 const idAluno = aluno._id
                 aluno.idTurma = ""
                 aluno.matricula = "Não confirmada"
                 aluno.matriculado = false
                 await findAlunoByIdAndUpdate(idAluno, aluno)
             }); */
            /* alunos.forEach(async aluno => {
                await findAlunoByIdAndUpdate(aluno._id, aluno)
            }); */

            //return res.send({turmaDetalhado})
            /* Filtrar turmas para evitar matricular aluno na classe muito avançada */
            let turmas = []
            let classesPermitida = ""
            let finalistas = false
            if (turmaDetalhado.idClasse.designacao == "10ª Classe") { classesPermitida = "11ª Classe" }
            if (turmaDetalhado.idClasse.designacao == "11ª Classe") { classesPermitida = "12ª Classe" }
            if (turmaDetalhado.idClasse.designacao == "12ª Classe") { classesPermitida = "12ª Classe"; finalistas = true }
            todasTurmas.forEach(turma => {
                if ((turma.idClasse.designacao == classesPermitida || turma.idClasse.designacao == turmaDetalhado.idClasse.designacao) & turma.idCurso.descricao == turmaDetalhado.idCurso.descricao) { turmas.push(turma) }
            });

            /* Filtrar alunos suspeitos para esta classe */
            //return res.send({turmaDetalhado})

            let alunosSuspeitosTD = []
            let alunosSuspeitos = []
            if (turmaDetalhado.idClasse.designacao != "10ª Classe") {

                let classeAnterior = ""
                let classeActual = ""

                const pautas = await findAllPautasFinalService()
                const pauta = pautas[0]
                //return res.send({pauta})

                // Primeira checagem
                alunosMatriculados.forEach(alunoMatriculado => {
                    let suspeito = true
                    if (alunoMatriculado.classe == "11ª Classe") { classeAnterior = "10ª Classe"; classeActual = alunoMatriculado.classe }
                    if (alunoMatriculado.classe == "12ª Classe") { classeAnterior = "11ª Classe"; classeActual = alunoMatriculado.classe }
                    //console.log(classeAnterior)

                    pautas.forEach(pauta => {
                        if (pauta.classe.designacao == classeAnterior) {
                            //console.log(classeAnterior)
                            pauta.dadosPauta.forEach(aluno => {
                                if (alunoMatriculado._id == "" + aluno.idAluno & (aluno.estado == "APTO" || aluno.estado == "APTA")) { suspeito = false }
                            });
                        }
                    });
                    if (suspeito == true) { alunosSuspeitosTD.push(alunoMatriculado) }
                });

                //Segunda Checagem
                alunosSuspeitosTD.forEach(alunoSuspeito => {
                    let suspeito = true
                    if (alunoSuspeito.classe == "11ª Classe") { classeActual = alunoSuspeito.classe }
                    if (alunoSuspeito.classe == "12ª Classe") { classeActual = alunoSuspeito.classe }
                    //console.log(classeAnterior)

                    pautas.forEach(pauta => {
                        if (pauta.classe.designacao == classeActual) {
                            pauta.dadosPauta.forEach(aluno => {
                                if (alunoSuspeito._id == "" + aluno.idAluno) { suspeito = false }
                            });
                        }
                    });
                    if (suspeito == true) { alunosSuspeitos.push(alunoSuspeito) }
                });


            }

            alunos.forEach(aluno => {
                alunosSuspeitos.forEach(alunoSuspeito => {
                    if (alunoSuspeito._id == aluno._id) { aluno.suspeito = true }
                });
            });
            /*  alunos.forEach(async aluno => {
                 if(aluno.matricula == "Não Confirmada"){
                     aluno.matricula = "Confirmada"
                     await findAlunoByIdAndUpdate(aluno._id, aluno)
 
                 }
             }); */
            let cont = 1
            alunosMatriculados.forEach(async aluno => {
                aluno.idAno = ano._id

                await findAlunoByIdAndUpdate(aluno._id, aluno)
                cont++
            });


            /* Actualizar o id doAno actual nos alunos */
            alunosMatriculados.forEach(async aluno => {
                aluno.idAno = ano._id
                aluno.matricula = "Confirmada"
                aluno.matriculado = true

                await findAlunoByIdAndUpdate(aluno._id, aluno)

            });

            //return res.send({alunosMatriculados})
            //console.log("Tamanho: "+alunos.length)

            return res.render('admin/turmas/turma', { user, tdAlunosGeral, alunos, tdAlunosMatriculados, alunosMatriculados, alunosNaoReconfirmados, turma, turmas, todasTurmas, classe, ano, curso, classe10, classe11, classe12, candMatricular, idTurma, naoVagas, alunosSemGenero, achado, definicoes, nivelPrivilegio01, nivelPrivilegio02, nivelPrivilegio03, finalistas, alunosSuspeitos })
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const miniPauta = async (req, res) => {
    try {
        const user = req.user
        let lancarNota = ''
        const idTurma = req.params.id

        let alunosTurma = []
        const anoLectivo = await findAnoLectivoActivoService()
        const tdTurmas = await findAllTurmasService()
        let tdAlunosTurma = await findAlunosByIdTurma(idTurma)
        const turma = await findTurmaByIdService(idTurma)
        let curso = await findCursoByIdService(turma.idCurso)
        curso = curso.descricao



        let numeroOrd = 1
        tdAlunosTurma.forEach(aluno => {
            if (aluno.idAno == anoLectivo._id && aluno.matriculado == true) {
                aluno.numeroOrd = numeroOrd++
                alunosTurma.push(aluno)
            }

        });

        res.render('admin/turmas/minipautaTurma', { turma, curso, alunosTurma, lancarNota })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const miniPautaPDF = async (req, res) => {
    try {

        const user = req.user
        const idTurma = req.params.id

        let alunosTurma = []
        let anoLectivo = await findAnoLectivoActivoService()
        let tdAlunosTurma = await findAlunosByIdTurma(idTurma)
        const turma = await findTurmaByIdService(idTurma)
        let curso = await findCursoByIdService(turma.idCurso)
        curso = curso.descricao


        /* Numerar e filtrar alunos matriculados no ano lectivo actual */
        let numeroOrd = 1
        tdAlunosTurma.forEach(aluno => {
            if (aluno.idAno == anoLectivo._id && aluno.matriculado == true) {
                aluno.numeroOrd = numeroOrd++
                alunosTurma.push(aluno)
            }
        });


        let classe = await findClasseByIdService(turma.idClasse)
        const codTurma = turma.codigo
        const periodo = turma.periodo
        classe = classe.designacao
        anoLectivo = anoLectivo.codigo

        //GERANDO PDF
        const date = new Date();
        const diaR = date
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();
        ejs.renderFile("./views/admin/turmas/minipautaPDF.ejs", { dia: dia, mes: mes, ano: ano, anoLectivo, alunosTurma, curso, codTurma, classe, periodo }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {

                const options = {
                    format: "A4",
                    orientation: 'Landscape',
                    margin: {
                        top: '10px',
                        bottom: '20px',
                        left: '20px',
                        right: '20px'
                    },
                    header: {
                        height: "15mm"
                    },
                    footer: {
                        height: "25mm"
                    }

                }
                pdf.create(html, options).toFile("./relatorios/minipautas/" + classe + "-" + turma.codigo + "-minipauta.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu ao guradar lista')
                    } else {
                        req.flash('success_msg', 'Minipauta gerada com sucesso! veja na pasta de relatórios em C:/')
                        res.redirect('/turmas/turma/' + idTurma)
                    }
                })
            }
        })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const gerarLista = async (req, res) => {
    try {
        const idTurma = req.params.id
        const estado = 'Activo'
        const ano = await findAnoLectivoByEstadoService(estado)
        const alunos = await findAlunosByIdTurma(idTurma)
        const turma = await findTurmaByIdService(idTurma)
        const idCurso = turma.idCurso
        const curso = await findCursoByIdService(idCurso)
        const classe = await findClasseByIdService(turma.idClasse)
        let num = 1
        alunos.forEach(aluno => {
            aluno.numero = num++
        });
        //return res.send({classe})

        res.render('admin/turmas/gerarLista', { turma, curso, alunos, ano, classe })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const turmaP = async (req, res) => {
    try {
        const idTurma = req.params.id
        const turma = await findTurmaByIdService(idTurma)
        const idClasse = turma.idClasse
        const idAno = turma.idAno
        const classe = await findClasseByIdService(idClasse)
        const ano = await findAnoLectivoById(idAno)
        const idCurso = turma.idCurso
        const curso = await findCursoByIdService(idCurso)
        const candidatos = await findAllCandidatosByCursoService(curso.descricao)
        const alunos = await findAlunosByIdTurma(idTurma)
        const tdDisciplinas = await findAllDiscplinasService()
        const disciplinas = await findDisciplinaByIdClasse(idClasse)
        tdDisciplinas.forEach(element => {
            if (element.idClasse == idClasse) {
                disciplinas.push(element)
            }
        });
        let funcionarios = await findAllFuncionariosService()
        let professores = []
        let professoresDaT = []
        funcionarios.forEach(element => {
            if (element.funcao == 'professor' || element.funcao == 'professora') {
                element.idTurma = idTurma
                professores.push(element)
            }
        });

        //return res.send({funcionarios})
        const miniPautas = await findMinipautasByIdTurma(idTurma)

        funcionarios.forEach(prof => {
            prof.turmas.forEach(tur => {
                if (tur == idTurma) {
                    miniPautas.forEach(miniPauta => {
                        if (miniPauta.idProfessor == '' + prof._id) {
                            if (prof.disciplina) {

                                prof.disciplina2 = miniPauta.nomeDisciplina
                            } else {
                                prof.disciplina = miniPauta.nomeDisciplina

                            }
                        }
                    });
                    professoresDaT.push(prof)
                }
            });
        });
        let naoVagas = ''
        if (classe.numVagas < 1) {
            naoVagas = 'Não existe mais vagas nesta classe!'
        }
        const candMatricular = []
        candidatos.forEach(element => {
            if (element.estado == "Admitido") {
                element.idTurma = idTurma
                candMatricular.push(element)

            }
        });

        let classe10 = ''
        let classe11 = ''
        let classe12 = ''
        if (classe.designacao == "10ª Classe") {
            classe10 = classe.designacao
        }
        if (classe.designacao == "11ª Classe") {
            classe11 = classe.designacao
        }
        if (classe.designacao == "12ª Classe") {
            classe12 = classe.designacao
        }
        //return res.send({professoresDaT})

        return res.render('admin/turmas/turmaP', { professores, professoresDaT, turma, classe, ano, curso, classe10, classe11, classe12, candMatricular, idTurma, naoVagas, disciplinas })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const novaMatricula = async (req, res) => {
    try {

        const idTurma = req.body.idTurma
        const idCandidato = req.body.idCandidato
        const date = new Date();
        let anoEconoAct = date.getFullYear();

        let candidato = await findCandByIdService(idCandidato)
        const turma = await findTurmaByIdService(idTurma)
        const classe = await findClasseByIdService(turma.idClasse)
        if (classe.numVagas == 0) {
            req.flash('error_msg', 'Não ha mais vaga neste Curso')
            res.redirect('/turmas/turma/' + idTurma)
        } else {
            candidato.idade = anoEconoAct - candidato.anoNascimento
            candidato.idTurma = idTurma
            candidato.idClasse = classe._id
            candidato.idCurso = classe.idCurso
            candidato.mtriculado = true
            candidato.mtricula = "Confirmada"
            candidato.idAno = classe.idAno

            res.render("alunos/novaMatricula", { candidato, idTurma })
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const saveNovaMatricula = async (req, res) => {
    try {
        const idCandidato = req.body.idCandidato
        const idTurma = req.body.idTurma
        const idClasse = req.body.idClasse
        const idCurso = req.body.idCurso
        const idAno = req.body.idAno
        const user = req.user

        const bi = req.body.numBI
        const veryBICand = await findCandByNumBIService(bi)
        //return res.send({veryBICand})
        const veryBI = await findAlunoByBIService(bi)
        const candidato = req.body;
        //candidato._id = req.params.id
        const erros = []
        if (veryBICand.numBI != req.body.numBI) {
            return res.send('O Bi não coreesponde')
            erros.push({ texto: 'O número do BI não corresponde ao aluno admitido!' })

        }
        if (veryBI) {
            if (veryBI.numBI != "") {

                return res.send('Já existe um registro com este BI')
                erros.push({ texto: "Já existe um registro com este BI" })
            }
        }
        if (veryBICand.curso != req.body.curso) {
            //return res.send('Foste admitido para o curso de ' + veryBICand.curso)
            erros.push({ texto: 'Foste admitido para o curso de ' + veryBICand.curso })
        }
        if (erros.length > 0) {
            res.render('alunos/adAdmintido', { candidato, erros })
        } else {
            //return res.send('O Bi Corresponde, pode matricular')
            /* Criar usuario */
            const turma = await findTurmaByIdService(idTurma)
            const nome = req.body.nome
            const numBilhete = req.body.numBI
            const num = numBilhete.slice(5, 8)
            const nomeArray = nome.split(" ")
            //primeironome@ngungaxxx.turma
            const username0 = nomeArray[0] + '@ngunga' + num + '.' + turma.codigo
            const username = username0.toLocaleLowerCase()
            //return res.send({username})

            const novoUsuario = {
                username: username,
                senha: req.body.numBI,
                telefone: req.body.contacto,
                foto: veryBICand.foto
            }

            const userAluno = await createUserService(novoUsuario)
            let candidatoUp = await findCandByIdService(idCandidato)
            candidatoUp.estado = 'Matriculado'
            await findCandByIdAndUpdateService(idCandidato, candidatoUp)
            let aluno = req.body;
            aluno.usuario = userAluno._id;
            aluno.dataNascimento = candidatoUp.dataNascimento;
            aluno.anoNascimento = candidatoUp.anoNascimento;
            aluno.classe = '10ª Classe';
            aluno.foto = "logcand.JPG";
            aluno.matriculado = true;
            aluno.matricula = "Confirmada";

            const novoAluno = await createAlunoService(aluno)
            const classeUpdade = await findClasseByIdService(idClasse)
            classeUpdade.numVagas -= 1
            await findClasseByIdAndUpdate(idClasse, classeUpdade)
            req.flash('success_msg', 'Aluno matriculado com sucesso!')
            res.redirect('/turmas/turma/' + idTurma)

        }


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const addProfessor = async (req, res) => {
    try {
        const idProfessor = req.body.idProfessor
        const nomeDisciplina = req.body.nomeDisciplina
        const idTurma = req.body.idTurma
        let retornarAMinipautas = false

        let idClasse = req.body.idClasse
        let idCurso = req.body.idCurso
        let idAno = req.body.idAno

        if (idClasse == "" || idCurso == "") {
            const turma = await findTurmaByIdService(idTurma)
            idClasse = turma.idClasse
            idCurso = turma.idCurso

            retornarAMinipautas = true
        }
        //return res.send({idClasse, idCurso})
        const idF = idProfessor
        //return res.send({idProfessor})
        let professor = await findFuncionariosByIdService(idF)
        //const disciplina = await findDisciplinaByIdService(idDisciplina)
        let exist = ''
        professor.turmas.forEach(element => {
            if (element == idTurma) {
                exist = 'Este professor ja é desta turma!'

            }
        });
        if (exist == '') {
            professor.turmas.push(idTurma)
            professor.disciplinas.push(nomeDisciplina)
            const minipauta = {
                nomeDisciplina: nomeDisciplina,
                idClasse: idClasse,
                idProfessor: professor._id,
                idTurma: idTurma,
                idCurso: idCurso,
                idAno: idAno
            }

            const alunos = await findAlunosByIdTurma(idTurma)
            const alunosMinipauta = []
            alunos.forEach(element => {
                alunosMinipauta.push(element._id)
            });
            minipauta.alunos = alunosMinipauta
            const novaMinipauta = await creatMinipautaService(minipauta)
            const idMinipauta = novaMinipauta._id
            professor.minipautas.push(idMinipauta)
            const profUpdate = await findFuncionarioByIdAndUpdateService(idProfessor, professor)
            //disciplina.idProfessor = professor._id
            //const disciplinaUpdate = await findDisciplinaByIdAndUpdateService(idDisciplina, disciplina)
            // return res.send("Sucesso!")

            if (retornarAMinipautas) {

                req.flash('success_msg', 'Novacarga/Disciplina adicionada com sucesso!')
                res.redirect('/professor/minipautasCadPAdmin/' + idProfessor)
            } else {

                req.flash('success_msg', 'Novo professor adicionado!')
                res.redirect('/turmas/pturma/' + idTurma)
            }

        } else {
            req.flash('error_msg', '' + exist)
            res.redirect('/turmas/pturma/' + idTurma)
        }



    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

/* Adcionando mais disciplina ao professoar, na mesma turma */
export const addMaisDisc = async (req, res) => {
    try {
        const idProfessor = req.body.idProfessor
        const nomeDisciplina = req.body.nomeDisciplina
        const idTurma = req.body.idTurma
        const idClasse = req.body.idClasse
        const idCurso = req.body.idCurso
        const idAno = req.body.idAno

        const professor = await findFuncionariosByIdService(idProfessor)


        professor.turmas.push(idTurma)
        professor.disciplinas.push(nomeDisciplina)
        // return res.send('Sucesso!')
        const minipauta = {
            nomeDisciplina: nomeDisciplina,
            idClasse: idClasse,
            idProfessor: professor._id,
            idTurma: idTurma,
            idCurso: idCurso,
            idAno: idAno
        }

        const alunos = await findAlunosByIdTurma(idTurma)
        const alunosMinipauta = []
        alunos.forEach(element => {
            alunosMinipauta.push(element._id)
        });
        minipauta.alunos = alunosMinipauta

        const novaMinipauta = await creatMinipautaService(minipauta)
        const idMinipauta = novaMinipauta._id
        professor.minipautas.push(idMinipauta)
        const profUpdate = await findFuncionarioByIdAndUpdateService(idProfessor, professor)
        //disciplina.idProfessor = professor._id
        //const disciplinaUpdate = await findDisciplinaByIdAndUpdateService(idDisciplina, disciplina)
        // return res.send("Sucesso!")

        req.flash('success_msg', 'Sucesso! Adicionaste mais disciplina a um professor desta turma.')
        res.redirect('/turmas/pturma/' + idTurma)




    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const remProfessor = async (req, res) => {
    try {
        //return res.send('Teste Remoção!')
        const idProfessor = req.body.idProfessor
        const nomeDisciplina = req.body.nomeDisciplina
        const idTurma = req.body.idTurma
        const idClasse = req.body.idClasse
        const idCurso = req.body.idCurso
        const idAno = req.body.idAno

        const turma = await findTurmaByIdService(idTurma)
        const professor = await findFuncionariosByIdService(idProfessor)
        //const disciplina = await findDisciplinaByIdService(idDisciplina)

        res.render('admin/turmas/remProfessor', { professor, nomeDisciplina, turma })



    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const remProfessorSave = async (req, res) => {
    try {
        const idProfessor = req.body.idProfessor
        const nomeDisciplina = req.body.nomeDisciplina
        const idTurma = req.body.idTurma
        const idClasse = req.body.idClasse
        const idCurso = req.body.idCurso
        const idAno = req.body.idAno
        //return res.send({idProfessor, nomeDisciplina, idTurma, idClasse, idCurso, idAno})

        const professor = await findFuncionariosByIdService(idProfessor)
        const miniPautas = await findMinipautasByIdTurma(idTurma)
        const turma = await findTurmaByIdService(idTurma)
        await deleteTurmaProfService(idProfessor, idTurma)
        let idMinipAchada = ''
        miniPautas.forEach(minipauta => {
            if (minipauta.idTurma == idTurma) {
                idMinipAchada = minipauta._id
                //console.log('Minipauta achada..............'+idMinipAchada)
            }
        });
        if (idMinipAchada) {
            await findMiniPautaByIdAndDelete(idMinipAchada)
            await deleteMinipautaProfService(idProfessor, idMinipAchada)
            //await deleteDisciplinaProfService(idProfessor, nomeDisciplina)
        }
        req.flash('error_msg', 'Professor removido da turma com exito!')
        res.redirect('/turmas/pturma/' + idTurma)


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const controlFaltas = async (req, res) => {
    try {
        const user = req.user
        if (!user) {
            //return res.send('Não estas logado!')
            req.flash('error_msg', 'Inicie sua sessão!')
            res.redirect('/user/login')
        } else {
            let eProf = ''

            const idTurma = req.params.id
            const turma = await findTurmaByIdService(idTurma)
            turma.periodo = turma.periodo.toLocaleUpperCase();
            const idClasse = turma.idClasse
            const classe = await findClasseByIdService(idClasse)
            const ano = await findAnoLectivoById(turma.idAno)
            const curso = await findCursoByIdService(turma.idCurso)
            const candidatos = await findAllCandidatosByCursoService(curso.descricao)
            const alunos = await findAlunosByIdTurma(idTurma)
            let naoVagas = ''
            if (classe.numVagas < 1) {
                naoVagas = 'Não existe mais vagas nesta classe!'
            }
            const candMatricular = []
            candidatos.forEach(element => {
                if (element.estado == "Admitido") {
                    element.idTurma = idTurma
                    candMatricular.push(element)

                }
            });

            const faltasTurma = await findFaltaBayIdTurmaService(turma._id)
            let numeroOrd = 0
            /* Associar Faltas */
            alunos.forEach(aluno => {
                numeroOrd++
                let tdFaltasAluno = []
                let numFAltas = 0
                faltasTurma.forEach(falta => {
                    if (aluno._id == "" + falta.aluno) {
                        tdFaltasAluno.push(falta)
                    }
                });
                tdFaltasAluno.forEach(fAluno => {
                    numFAltas += fAluno.faltas.length
                });
                if (numFAltas > 5) {
                    aluno.obs = 'R/Faltas'
                }
                aluno.numeroOrd = numeroOrd
                aluno.fatasDoAluno = numFAltas
            });

            //return res.send({alunos})

            return res.render('admin/turmas/controlFaltas', { alunos, turma, classe, ano, curso, candMatricular, idTurma, naoVagas })
        }
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const usuariosTurma = async (req, res) => {
    try {
        let user = req.user
        let nivelPrivilegio01 = false
        let nivelPrivilegio02 = false
        let nivelPrivilegio03 = false
        let nivelPrivilegio04 = false
        let editSenha = false
        /* Verificar o nível de privilégio no sistema */
        if (user.privilegio) {
            if (user.privilegio = 1) { nivelPrivilegio01 = true }
            if (user.privilegio = 2) { nivelPrivilegio02 = true }
            if (user.privilegio = 3) { nivelPrivilegio03 = true }
            if (user.eAdmin == 1) { editSenha = true }
        }
        //return res.send({user, editSenha, nivelPrivilegio01, nivelPrivilegio02, nivelPrivilegio03})
        if (!user) {
            //return res.send('Não estas logado!')
            req.flash('error_msg', 'Inicie sua sessão!')
            res.redirect('/user/login')
        } else {

            const idTurma = req.params.id
            const turma = await findTurmaByIdService(idTurma)
            turma.periodo = turma.periodo.toLocaleUpperCase();
            const idClasse = turma.idClasse
            const classe = await findClasseByIdService(idClasse)
            const ano = await findAnoLectivoById(turma.idAno)
            const curso = await findCursoByIdService(turma.idCurso)
            let alunos = await findAlunosByIdTurma(idTurma)



            const tdUsers = await findAllUsers()
            let numeroOrd = 0
            /* Associar Faltas */
            alunos.forEach(aluno => {
                numeroOrd++
                tdUsers.forEach(user => {
                    if (aluno.usuario == "" + user._id) {
                        aluno.username = user.username
                        const nomeArray = aluno.nome.split(" ")
                        aluno.senha = turma.codigo + '-' + nomeArray[1]
                        aluno.editSenha = editSenha
                    }
                });
                aluno.numeroOrd = numeroOrd
                aluno.nivelPrivilegio01 = nivelPrivilegio01
                aluno.nivelPrivilegio02 = nivelPrivilegio02
                aluno.nivelPrivilegio03 = nivelPrivilegio03
            });

            /* Verificar senhas alterada */
            const credencias = await findAllCredenciasService()

            alunos.forEach(async aluno => {
                credencias.forEach(credencial => {
                    if (aluno.usuario == "" + credencial.id) { aluno.senha = credencial.senha }
                });
            });

            //return res.send({alunos})

            return res.render('admin/turmas/userTurma', { alunos, turma, classe, ano, curso, idTurma, nivelPrivilegio01, nivelPrivilegio02, nivelPrivilegio03 })
        }
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const userTurmaPDF = async (req, res) => {
    try {

        const user = req.user
        if (!user) {
            //return res.send('Não estas logado!')
            req.flash('error_msg', 'Inicie sua sessão!')
            res.redirect('/user/login')
        } else {
            const idTurma = req.params.id
            const turma = await findTurmaByIdService(idTurma)
            turma.periodo = turma.periodo.toLocaleUpperCase();
            const idClasse = turma.idClasse
            const classe = await findClasseByIdService(idClasse)
            const classeDescr = classe.designacao
            const curso = await findCursoByIdService(turma.idCurso)
            const alunos = await findAlunosByIdTurma(idTurma)



            const tdUsers = await findAllUsers()
            let numeroOrd = 0
            /* Associar Faltas */
            alunos.forEach(aluno => {
                numeroOrd++
                tdUsers.forEach(user => {
                    if (aluno.usuario == "" + user._id) {
                        aluno.username = user.username
                        const nomeArray = aluno.nome.split(" ")
                        aluno.senha = turma.codigo + '-' + nomeArray[1]
                    }
                });
                aluno.numeroOrd = numeroOrd
            });

            /* Verificar senhas alterada */
            const credencias = await findAllCredenciasService()

            alunos.forEach(async aluno => {
                credencias.forEach(credencial => {
                    if (aluno.usuario == "" + credencial.id) { aluno.senha = credencial.senha }
                });
            });
            const date = new Date();
            const diaR = date
            let dia = date.getDate();
            let mes = date.toLocaleString('default', { month: 'long' });
            let ano = date.getFullYear();

            ejs.renderFile("./views/admin/usersTurmaPDF.ejs", { dia: dia, ano, mes: mes, alunos, turma }, (err, html) => {
                if (err) {
                    return res.send('HOUVE UM ERRO!' + err)
                } else {

                    const options = {
                        format: "A4",
                        orientation: 'portrait',
                        header: {
                            height: "15mm"
                        },
                        footer: {
                            height: "20mm"
                        }

                    }
                    pdf.create(html, options).toFile("./relatorios/usuarios/" + classeDescr + "-" + turma.codigo + "-usersTurmaPDF.pdf", (err, re) => {
                        if (err) {
                            return res.send('Um erro aconteceu ao guradar lista')
                        } else {
                            req.flash('success_msg', 'Lista de usuarios gerado com sucesso! veja na pasta de relatórios em C:/')
                            res.redirect('/turmas/usuariosTurma/' + turma._id)
                        }
                    })
                }
            })

        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const transferirAluno = async (req, res) => {
    try {
        const { idAluno, idNovaClasse, tipoTransferencia, idTurma } = req.body
        let msdDeErro = ""
        if (tipoTransferencia == '') { msdDeErro += "Seleciona o tipo de transferencia, " }
        if (idAluno == '') { msdDeErro += "O aluno não foi selecionado, " }
        if (idNovaClasse == '') { msdDeErro += "A nova Classe não foi selecionada, " }


        if (msdDeErro == "") {
            if (tipoTransferencia == "externa") {
                msdDeErro = "No momento a opção para Transferência externa ainda não está disponível."
                return res.render("msgError", { msdDeErro })
            } else {
                let aluno = await findAlunoByIdService(idAluno)
                let novaTurma = await findTurmaByIdServiceDetalhado(idNovaClasse)
                aluno.idTurma = novaTurma._id
                aluno.curso = novaTurma.idCurso.descricao
                aluno.classe = novaTurma.idClasse.designacao
                aluno.idClasse = novaTurma.idClasse._id
                aluno.idCurso = novaTurma.idCurso._id
                aluno.matriculado = true
                await findAlunoByIdAndUpdate(aluno._id, aluno)

            }
        } else {

            return res.render("msgError", { msdDeErro })
        }

        req.flash("success_msg", "Transferência realizada com sucesso!")
        return res.redirect("/turmas/turma/" + idTurma)


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}