import { findNotaDisciplinaByIdAndDeleteService } from "../services/notasDisciplina.service.js";

export const veryNotaFalhas = (notasDisciplina, minipauta) => {
    try {
        let falhaNota = {message: '', avF: '', trimestre: '', descTrimestre: '', notaDe: '', alunosSemAV1: [], alunosSemAV2: [], alunosSemAV3: [], alunosSemPP: [], alunosSemPT: [],}
        let msgFalhaLancada = ''
        let ms1 = "Exitem notas que não foram salvas em ";
        let ms2 = ". Clique aqui para repetir!";


        let notasDisciplinaExistentes = []

        notasDisciplina.forEach(dado2 => {
            if(dado2.aluno != undefined){
                notasDisciplinaExistentes.push(dado2)
            }
            
        });
        //console.log(notasDisciplina.length)
        //console.log(notasDisciplinaExistentes.length)
        
        //falhaNota.alunosTurmaFalha = notasDisciplinaExistentes

        let cont = 1
        notasDisciplinaExistentes.forEach(aluno => {
           // console.log(cont+": "+aluno.notas.pt1)
            cont++

            /* PRIMEIRO TRIMESTRE */
            if (aluno.notas.av1T1 == undefined && minipauta.lancadoAV1T1 == 1) {msgFalhaLancada = ms1+'av1T1'+ms2; falhaNota.message = msgFalhaLancada, falhaNota.avF = 'av1T1', falhaNota.notaDe = 'avaliacao1', falhaNota.trimestre = 'primeiro', falhaNota.descTrimestre = 'Primeiro Trimestre', falhaNota.alunosSemAV1.push(aluno) }
            if (aluno.notas.av2T1 == undefined && minipauta.lancadoAV2T1 == 1) {msgFalhaLancada = ms1+'av2T1'+ms2; falhaNota.message = msgFalhaLancada, falhaNota.avF = 'av2T1', falhaNota.notaDe = 'avaliacao2', falhaNota.trimestre = 'primeiro', falhaNota.descTrimestre = 'Primeiro Trimestre', falhaNota.alunosSemAV2.push(aluno)  }
            if (aluno.notas.av3T1 == undefined && minipauta.lancadoAV3T1 == 1) {msgFalhaLancada = ms1+'av3T1'+ms2; falhaNota.message = msgFalhaLancada, falhaNota.avF = 'av3T1', falhaNota.notaDe = 'avaliacao3', falhaNota.trimestre = 'primeiro', falhaNota.descTrimestre = 'Primeiro Trimestre', falhaNota.alunosSemAV3.push(aluno)  }
            if (aluno.notas.pp1 == undefined && minipauta.lancadoPPT1 == 1) {msgFalhaLancada = ms1+'PPT1'+ms2; falhaNota.message = msgFalhaLancada, falhaNota.avF = 'PPT1', falhaNota.notaDe = 'provaDoProfessor', falhaNota.trimestre = 'primeiro',  falhaNota.descTrimestre = 'Primeiro Trimestre', falhaNota.alunosSemPP.push(aluno)  }
            if (aluno.notas.pt1 == undefined && minipauta.lancadoPTT1 == 1) {msgFalhaLancada = ms1+'PTT1'+ms2; falhaNota.message = msgFalhaLancada, falhaNota.avF = 'PTT1', falhaNota.notaDe = 'provaDoTrimestre', falhaNota.trimestre = 'primeiro',  falhaNota.descTrimestre = 'Primeiro Trimestre', falhaNota.alunosSemPT.push(aluno)  }
        });//falta outros trimestres

        return falhaNota;
    } catch (error) {
        return error.mesage
    }
}

/* Esta função verufuica os alunos não matriculados e retira os dados na minipauta */
export const alunosIntrusosNaMiniPauta = async (notasDisciplina) => {
    try {
        let alunosIntrusos = []
        notasDisciplina.forEach(async dado2 => {
            if(dado2.aluno.matriculado == false) {
                //alunosIntrusos.push(dado2)
                await findNotaDisciplinaByIdAndDeleteService(dado2._id)
            }
            
        });
        //console.log(alunosIntrusos.length)
        return alunosIntrusos
    } catch (error) {
        return error.mesage
    }
}