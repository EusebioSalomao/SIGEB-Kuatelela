
/* Esta função organiza as disciplinas e as notas 
de acordo a ordem na pauta desejado pelo cliente */
export const notasOrganizadas = (dado, curso, classe) => {
    try {
        const dados = []
        const notas = []
        const ordDisciplinas = []

        //A ordem das disciplinas aqui deve obedecer a ordem da pauta na view pauta
        // CFB - 10ª
        if (curso == 'Curso de Ciências Físicas e Biológicas' & classe == '10ª Classe') {

            const notasLp = dado.notas.notas.find(function (notas) { return notas.disciplina === "L. Portuguesa" || notas.disciplina == "Língua portuguesa"; });
            const notasLE = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ingles"; });
            const notasMat = dado.notas.notas.find(function (notas) { return notas.disciplina === "Matemática"; });
            const notasBio = dado.notas.notas.find(function (notas) { return notas.disciplina === "Biologia"; });
            const notasFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Física"; });
            const notasQui = dado.notas.notas.find(function (notas) { return notas.disciplina === "Química"; });
            const notasInf = dado.notas.notas.find(function (notas) { return notas.disciplina === "Informática" || notas.disciplina === "Informatica"; });
            const notasEmprend = dado.notas.notas.find(function (notas) { return notas.disciplina === "Empreendedorismo"; });
            const notasEdFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ed. Física"; });

            notas.push(notasLp)
            notas.push(notasLE)
            notas.push(notasMat)
            notas.push(notasBio)
            notas.push(notasFis)
            notas.push(notasQui)
            notas.push(notasInf)
            notas.push(notasEmprend)
            notas.push(notasEdFis)

            //Ordenando as disciplinas
            ordDisciplinas.push({ "disciplina": 'L. Portuguesa' })
            ordDisciplinas.push({ "disciplina": 'Ingês' })
            ordDisciplinas.push({ "disciplina": 'Matemática' })
            ordDisciplinas.push({ "disciplina": 'Biologia' })
            ordDisciplinas.push({ "disciplina": 'Física' })
            ordDisciplinas.push({ "disciplina": 'Química' })
            ordDisciplinas.push({ "disciplina": 'Informática' })
            ordDisciplinas.push({ "disciplina": 'Empreendedorismo' })
            ordDisciplinas.push({ "disciplina": 'Ed. Física' })
        }

        //CFB 11ª Classe
        if (curso == 'Curso de Ciências Físicas e Biológicas' & classe == '11ª Classe') {

            const notasLp = dado.notas.notas.find(function (notas) { return notas.disciplina === "L. Portuguesa" || notas.disciplina == "Língua portuguesa"; });
            const notasLE = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ingles"; });
            const notasMat = dado.notas.notas.find(function (notas) { return notas.disciplina === "Matemática"; });
            const notasBio = dado.notas.notas.find(function (notas) { return notas.disciplina === "Biologia"; });
            const notasFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Física"; });
            const notasQui = dado.notas.notas.find(function (notas) { return notas.disciplina === "Química"; });
            const notasGeoD = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geo.Descrit."; });
            const notasGeolo = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geologia" || notas.disciplina === "geologia"; });
            const notasFilo = dado.notas.notas.find(function (notas) { return notas.disciplina === "Filosofia" || notas.disciplina === "filosofia"; });
            const notasEmprend = dado.notas.notas.find(function (notas) { return notas.disciplina === "Empreendedorismo"; });
            const notasEdFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ed. Física" || notas.disciplina == "Educação física"; });

            notas.push(notasLp)
            notas.push(notasLE)
            notas.push(notasMat)
            notas.push(notasBio)
            notas.push(notasFis)
            notas.push(notasQui)
            notas.push(notasGeoD)
            notas.push(notasGeolo)
            notas.push(notasFilo)
            notas.push(notasEmprend)
            notas.push(notasEdFis)

            //Ordenando as disciplinas
            ordDisciplinas.push({ "disciplina": 'L. Portuguesa' })
            ordDisciplinas.push({ "disciplina": 'Ingês' })
            ordDisciplinas.push({ "disciplina": 'Matemática' })
            ordDisciplinas.push({ "disciplina": 'Biologia' })
            ordDisciplinas.push({ "disciplina": 'Física' })
            ordDisciplinas.push({ "disciplina": 'Química' })
            ordDisciplinas.push({ "disciplina": 'Geo.Descrit.' })
            ordDisciplinas.push({ "disciplina": 'Geologia' })
            ordDisciplinas.push({ "disciplina": 'Filosofia' })
            ordDisciplinas.push({ "disciplina": 'Empreendedorismo' })
            ordDisciplinas.push({ "disciplina": 'Ed. Física' })
        }

        //CFB 12ª Classe
        if (curso == 'Curso de Ciências Físicas e Biológicas' & classe == '12ª Classe') {

            const notasLp = dado.notas.notas.find(function (notas) { return notas.disciplina === "L. Portuguesa" || notas.disciplina == "Língua portuguesa"; });
            const notasLE = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ingles"; });
            const notasMat = dado.notas.notas.find(function (notas) { return notas.disciplina === "Matemática"; });
            const notasBio = dado.notas.notas.find(function (notas) { return notas.disciplina === "Biologia"; });
            const notasFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Física"; });
            const notasQui = dado.notas.notas.find(function (notas) { return notas.disciplina === "Química"; });
            const notasGeoD = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geo.Descrit."; });
            const notasGeolo = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geologia" || notas.disciplina === "geologia"; });
            const notasFilo = dado.notas.notas.find(function (notas) { return notas.disciplina === "Filosofia" || notas.disciplina === "filosofia"; });
            const notasEmprend = dado.notas.notas.find(function (notas) { return notas.disciplina === "Empreendedorismo"; });
            const notasEdFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ed. Física" || notas.disciplina == "Educação física"; });

            notas.push(notasLp)
            notas.push(notasLE)
            notas.push(notasMat)
            notas.push(notasBio)
            notas.push(notasFis)
            notas.push(notasQui)
            notas.push(notasGeoD)
            notas.push(notasGeolo)
            notas.push(notasFilo)
            notas.push(notasEmprend)
            notas.push(notasEdFis)

            //Ordenando as disciplinas
            ordDisciplinas.push({ "disciplina": 'L. Portuguesa' })
            ordDisciplinas.push({ "disciplina": 'Ingês' })
            ordDisciplinas.push({ "disciplina": 'Matemática' })
            ordDisciplinas.push({ "disciplina": 'Biologia' })
            ordDisciplinas.push({ "disciplina": 'Física' })
            ordDisciplinas.push({ "disciplina": 'Química' })
            ordDisciplinas.push({ "disciplina": 'Geo.Descrit.' })
            ordDisciplinas.push({ "disciplina": 'Geologia' })
            ordDisciplinas.push({ "disciplina": 'Filosofia' })
            ordDisciplinas.push({ "disciplina": 'Empreendedorismo' })
            ordDisciplinas.push({ "disciplina": 'Ed. Física' })
        }

        /* CURSO DE CIÊNCIAS HUMANAS */
        // CH - 10ª
        if (curso == 'Curso de Ciências Humanas' & classe == '10ª Classe') {

            const notasLp = dado.notas.notas.find(function (notas) { return notas.disciplina === "L. Portuguesa" || notas.disciplina == "Língua portuguesa"; });
            const notasLE = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ingles"; });
            const notasMat = dado.notas.notas.find(function (notas) { return notas.disciplina === "Matemática"; });
            const notasGeog = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geografia"; });
            const notasHist = dado.notas.notas.find(function (notas) { return notas.disciplina === "História"; });
            //const notasQui = dado.notas.notas.find(function (notas) { return notas.disciplina === "Química"; });
            const notasInf = dado.notas.notas.find(function (notas) { return notas.disciplina === "Informática" || notas.disciplina === "Informatica"; });
            const notasEmprend = dado.notas.notas.find(function (notas) { return notas.disciplina === "Empreendedorismo"; });
            const notasEdFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ed. Física" || notas.disciplina == "Ed. física"; });

            notas.push(notasLp)
            notas.push(notasLE)
            notas.push(notasMat)
            notas.push(notasGeog)
            notas.push(notasHist)
            //notas.push(notasQui)
            notas.push(notasInf)
            notas.push(notasEmprend)
            notas.push(notasEdFis)

            //Ordenando as disciplinas
            ordDisciplinas.push({ "disciplina": 'L. Portuguesa' })
            ordDisciplinas.push({ "disciplina": 'Ingês' })
            ordDisciplinas.push({ "disciplina": 'Matemática' })
            ordDisciplinas.push({ "disciplina": 'Geografia' })
            ordDisciplinas.push({ "disciplina": 'História' })
            //ordDisciplinas.push({"disciplina":'Química'})
            ordDisciplinas.push({ "disciplina": 'Informática' })
            ordDisciplinas.push({ "disciplina": 'Empreendedorismo' })
            ordDisciplinas.push({ "disciplina": 'Ed. Física' })
        }
        // CH - 11ª
        if (curso == 'Curso de Ciências Humanas' & classe == '11ª Classe') {

            const notasLp = dado.notas.notas.find(function (notas) { return notas.disciplina === "L. Portuguesa" || notas.disciplina == "Língua portuguesa"; });
            const notasLE = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ingles"; });
            const notasMat = dado.notas.notas.find(function (notas) { return notas.disciplina === "Matemática"; });
            const notasGeog = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geografia"; });
            const notasHist = dado.notas.notas.find(function (notas) { return notas.disciplina === "História"; });
            const notasLiter = dado.notas.notas.find(function (notas) { return notas.disciplina === "Literatura"; });
//            const notasAntrop = dado.notas.notas.find(function (notas) { return notas.disciplina === "Antropologia" || notas.disciplina === "antropologia"; notas.disciplina === "Psicologia" || notas.disciplina === "psicologia" });
            const notasAntrop = dado.notas.notas.find(function (notas) { return notas.disciplina === "Psicologia" || notas.disciplina === "psicologia" || notas.disciplina === "Antropologia" || notas.disciplina === "antropologia"; });
            const notasFilos = dado.notas.notas.find(function (notas) { return notas.disciplina === "Filosofia" || notas.disciplina === "filosofia"; });
            const notasEmprend = dado.notas.notas.find(function (notas) { return notas.disciplina === "Empreendedorismo"; });
            const notasEdFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ed. Física" || notas.disciplina == "Ed. física"; });

            notas.push(notasLp)
            notas.push(notasLE)
            notas.push(notasMat)
            notas.push(notasGeog)
            notas.push(notasHist)
            notas.push(notasLiter)
            notas.push(notasAntrop)
            notas.push(notasFilos)
            notas.push(notasEmprend)
            notas.push(notasEdFis)

            //Ordenando as disciplinas
            ordDisciplinas.push({ "disciplina": 'L. Portuguesa' })
            ordDisciplinas.push({ "disciplina": 'Ingês' })
            ordDisciplinas.push({ "disciplina": 'Matemática' })
            ordDisciplinas.push({ "disciplina": 'Geografia' })
            ordDisciplinas.push({ "disciplina": 'História' })
            ordDisciplinas.push({ "disciplina": 'Literatura' })
            //ordDisciplinas.push({ "disciplina": 'Antropologia' })
            ordDisciplinas.push({ "disciplina": 'Psicologia' })
            ordDisciplinas.push({ "disciplina": 'Filosofia' })
            ordDisciplinas.push({ "disciplina": 'Empreendedorismo' })
            ordDisciplinas.push({ "disciplina": 'Ed. Física' })
        }
        // CH - 12ª
        if (curso == 'Curso de Ciências Humanas' & classe == '12ª Classe') {

            const notasLp = dado.notas.notas.find(function (notas) { return notas.disciplina === "L. Portuguesa" || notas.disciplina == "Língua portuguesa"; });
            const notasLE = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ingles"; });
            //const notasMat = dado.notas.notas.find(function (notas) { return notas.disciplina === "Matemática"; });
            const notasGeog = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geografia"; });
            const notasHist = dado.notas.notas.find(function (notas) { return notas.disciplina === "História"; });
            const notasLiter = dado.notas.notas.find(function (notas) { return notas.disciplina === "Literatura"; });
            const notasAntrop = dado.notas.notas.find(function (notas) { return notas.disciplina === "Psicologia" || notas.disciplina === "antropologia" || notas.disciplina === "Antropologia"; });
            const notasFilos = dado.notas.notas.find(function (notas) { return notas.disciplina === "Filosofia" || notas.disciplina === "filosofia"; });
            const notasEmprend = dado.notas.notas.find(function (notas) { return notas.disciplina === "Empreendedorismo"; });
            const notasEdFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ed. Física" || notas.disciplina == "Ed. física"; });

            notas.push(notasLp)
            notas.push(notasLE)
            //notas.push(notasMat)
            notas.push(notasGeog)
            notas.push(notasHist)
            notas.push(notasLiter)
            notas.push(notasAntrop)
            notas.push(notasFilos)
            notas.push(notasEmprend)
            notas.push(notasEdFis)

            //Ordenando as disciplinas
            ordDisciplinas.push({ "disciplina": 'L. Portuguesa' })
            ordDisciplinas.push({ "disciplina": 'Ingês' })
            //ordDisciplinas.push({"disciplina":'Matemática'})
            ordDisciplinas.push({ "disciplina": 'Geografia' })
            ordDisciplinas.push({ "disciplina": 'História' })
            ordDisciplinas.push({ "disciplina": 'Literatura' })
            //ordDisciplinas.push({ "disciplina": 'Psicologia' })
            ordDisciplinas.push({ "disciplina": 'Antropologia' })
            ordDisciplinas.push({ "disciplina": 'Filosofia' })
            ordDisciplinas.push({ "disciplina": 'Empreendedorismo' })
            ordDisciplinas.push({ "disciplina": 'Ed. Física' })
        }

        /* Curso de Ciências Económico-Jurídicas */
        // CEJ - 10ª
        if (curso == 'Curso de Ciências Económico-Jurídicas' & classe == '10ª Classe') {

            const notasLp = dado.notas.notas.find(function (notas) { return notas.disciplina === "L. Portuguesa" || notas.disciplina == "Língua portuguesa"; });
            const notasLE = dado.notas.notas.find(function (notas) { return notas.disciplina === "Inglês " || notas.disciplina == "Ingles"; });
            const notasMat = dado.notas.notas.find(function (notas) { return notas.disciplina === "Matemática"; });
            const notasEcon = dado.notas.notas.find(function (notas) { return notas.disciplina === "Int. Economia"; });
            const notasIntDirec = dado.notas.notas.find(function (notas) { return notas.disciplina === "Int. Direito"; });
            const notasGeog = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geografia"; });
            const notasHist = dado.notas.notas.find(function (notas) { return notas.disciplina === "História"; });
            const notasInf = dado.notas.notas.find(function (notas) { return notas.disciplina === "Informática" || notas.disciplina === "Informatica"; });
            const notasEmprend = dado.notas.notas.find(function (notas) { return notas.disciplina === "Empreendedorismo"; });
            const notasEdFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ed. Física" || notas.disciplina == "Ed. física"; });

            notas.push(notasLp)
            notas.push(notasLE)
            notas.push(notasMat)
            notas.push(notasEcon)
            notas.push(notasIntDirec)
            notas.push(notasGeog)
            notas.push(notasHist)
            notas.push(notasInf)
            notas.push(notasEmprend)
            notas.push(notasEdFis)

            //Ordenando as disciplinas
            ordDisciplinas.push({ "disciplina": 'L. Portuguesa' })
            ordDisciplinas.push({ "disciplina": 'Ingês' })
            ordDisciplinas.push({ "disciplina": 'Matemática' })
            ordDisciplinas.push({ "disciplina": 'Int. Economia' })
            ordDisciplinas.push({ "disciplina": 'Int. Direito' })
            ordDisciplinas.push({ "disciplina": 'Geografia' })
            ordDisciplinas.push({ "disciplina": 'História' })
            ordDisciplinas.push({ "disciplina": 'Informática' })
            ordDisciplinas.push({ "disciplina": 'Empreendedorismo' })
            ordDisciplinas.push({ "disciplina": 'Ed. Física' })
        }

        // CEJ - 11ª
        if (curso == 'Curso de Ciências Económico-Jurídicas' & classe == '11ª Classe') {

            const notasLp = dado.notas.notas.find(function (notas) { return notas.disciplina === "L. Portuguesa" || notas.disciplina == "Língua portuguesa"; });
            const notasLE = dado.notas.notas.find(function (notas) { return notas.disciplina === "Inglês " || notas.disciplina == "Ingles"; });
            const notasMat = dado.notas.notas.find(function (notas) { return notas.disciplina === "Matemática"; });
            const notasDirec = dado.notas.notas.find(function (notas) { return notas.disciplina === "Direito"; });
            const notasEcon = dado.notas.notas.find(function (notas) { return notas.disciplina === "Economia" || notas.disciplina === "Int. Economia"; });
            const notasGeog = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geografia"; });
            const notasHist = dado.notas.notas.find(function (notas) { return notas.disciplina === "História"; });
            const notasFilo = dado.notas.notas.find(function (notas) { return notas.disciplina === "Filosofia" || notas.disciplina == "selecionar"; });
            const notasSocio = dado.notas.notas.find(function (notas) { return notas.disciplina === "Sociologia" || notas.disciplina === "Informatica"; });
            const notasEmprend = dado.notas.notas.find(function (notas) { return notas.disciplina === "Empreendedorismo"; });
            const notasEdFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ed. Física" || notas.disciplina == "Ed. física"; });

            notas.push(notasLp)
            notas.push(notasLE)
            notas.push(notasMat)
            notas.push(notasDirec)
            notas.push(notasEcon)
            notas.push(notasGeog)
            notas.push(notasHist)
            notas.push(notasFilo)
            notas.push(notasSocio)
            notas.push(notasEmprend)
            notas.push(notasEdFis)

            //Ordenando as disciplinas
            ordDisciplinas.push({ "disciplina": 'L. Portuguesa' })
            ordDisciplinas.push({ "disciplina": 'Ingês' })
            ordDisciplinas.push({ "disciplina": 'Matemática' })
            ordDisciplinas.push({ "disciplina": 'Direito' })
            ordDisciplinas.push({ "disciplina": 'Economia' })
            ordDisciplinas.push({ "disciplina": 'Geografia' })
            ordDisciplinas.push({ "disciplina": 'História' })
            ordDisciplinas.push({ "disciplina": 'Filosofia' })
            ordDisciplinas.push({ "disciplina": 'Sociologia' })
            ordDisciplinas.push({ "disciplina": 'Empreendedorismo' })
            ordDisciplinas.push({ "disciplina": 'Ed. Física' })
        }

        // CEJ - 12ª Classe
        if (curso == 'Curso de Ciências Económico-Jurídicas' & classe == '12ª Classe') {

            const notasLp = dado.notas.notas.find(function (notas) { return notas.disciplina === "L. Portuguesa" || notas.disciplina == "Língua portuguesa"; });
            const notasLE = dado.notas.notas.find(function (notas) { return notas.disciplina === "Inglês " || notas.disciplina == "Ingles"; });
            const notasIntEcon = dado.notas.notas.find(function (notas) { return notas.disciplina === "Int. Economia"; });
            const notasIntDirec = dado.notas.notas.find(function (notas) { return notas.disciplina === "Int. Diereito"; });
            const notasDES = dado.notas.notas.find(function (notas) { return notas.disciplina === "D.E.S"; });
            const notasGeog = dado.notas.notas.find(function (notas) { return notas.disciplina === "Geografia"; });
            const notasHist = dado.notas.notas.find(function (notas) { return notas.disciplina === "História"; });
            const notasFilo = dado.notas.notas.find(function (notas) { return notas.disciplina === "Filosofia" || notas.disciplina == "selecionar"; });
            const notasSocio = dado.notas.notas.find(function (notas) { return notas.disciplina === "Sociologia" || notas.disciplina === "Informatica"; });
            const notasEmprend = dado.notas.notas.find(function (notas) { return notas.disciplina === "Empreendedorismo"; });
            const notasEdFis = dado.notas.notas.find(function (notas) { return notas.disciplina === "Ed. Física" || notas.disciplina == "Ed. física"; });

            notas.push(notasLp)
            notas.push(notasLE)
            notas.push(notasIntEcon)
            notas.push(notasIntDirec)
            notas.push(notasDES)
            notas.push(notasGeog)
            notas.push(notasHist)
            notas.push(notasFilo)
            notas.push(notasSocio)
            notas.push(notasEmprend)
            notas.push(notasEdFis)

            //Ordenando as disciplinas
            ordDisciplinas.push({ "disciplina": 'L. Portuguesa' })
            ordDisciplinas.push({ "disciplina": 'Ingês' })
            ordDisciplinas.push({ "disciplina": 'Int. Economia' })
            ordDisciplinas.push({ "disciplina": 'Int. Diereito' })
            ordDisciplinas.push({ "disciplina": 'D.E.S' })
            ordDisciplinas.push({ "disciplina": 'Geografia' })
            ordDisciplinas.push({ "disciplina": 'História' })
            ordDisciplinas.push({ "disciplina": 'Filosofia' })
            ordDisciplinas.push({ "disciplina": 'Sociologia' })
            ordDisciplinas.push({ "disciplina": 'Empreendedorismo' })
            ordDisciplinas.push({ "disciplina": 'Ed. Física' })
        }


        dados.push(notas)
        dados.push(ordDisciplinas)
        return dados;

    } catch (error) {
        return error
    }
}

export const estadoAprovadoReprovado = (disciplinasChaves, descCurso, genero, classeExame) => {
    try {
        let temNegativa = false
        let estado = ""
        let qtNegativa = 0
        let mediasZerodesistido = 0
        let reprovar = ""; let aprovar = ""; let desistir = ""; let recurso = "";
        if (!genero || genero == "Não definido" || genero == null || genero == undefined) { genero = "M" }


        if(genero == "F"){reprovar = "N/APTA"; aprovar = "APTA"; desistir = "DESISTENTE"}
        if(genero == "M"){reprovar = "N/APTO"; aprovar = "APTO"; desistir = "DESISTENTE"}
        recurso = "RECURSO"

        if (descCurso == "Curso de Ciências Económico-Jurídicas") {
            disciplinasChaves.forEach(dado => {
                if (dado.disciplina == "L. Portuguesa" || dado.disciplina == "Matemática" || dado.disciplina == "Inglês" || dado.disciplina == "Int. Direito" || dado.disciplina == "Int. Economia" || dado.disciplina == "Economia" || dado.disciplina == "Direito" || dado.disciplina == "Geografia" || dado.disciplina == "História") {
                    console.log(dado)
                    if(dado.mf < 10){

                        estado = reprovar
                    }
                }else{
                    if(estado == ""){
                        if(dado.mf < 10){qtNegativa++; temNegativa = true}
                        if(dado.mf < 7){estado = reprovar}
                    } 
                }
            });
            if(!classeExame){
                if(qtNegativa > 0){estado = reprovar}
            }
        }

        if (descCurso == "Curso de Ciências Humanas") {
            disciplinasChaves.forEach(dado => {
                console.log(dado.disciplina)
                if (dado.disciplina == "L. Portuguesa" || dado.disciplina == "Matemática" || dado.disciplina == "Inglês" || dado.disciplina == "Ingles" || dado.disciplina == "Geografia" || dado.disciplina == "História" || dado.disciplina == "Economia" || dado.disciplina == "Direito") {
                    console.log(dado.disciplina)
                    if(dado.mf < 10){

                        estado = reprovar
                    }
                }else{
                    if(estado == ""){
                        if(dado.mf < 10){qtNegativa++; temNegativa = true}
                        if(dado.mf < 7){estado = reprovar}
                    } 
                }
            });
            if(!classeExame){
                if(qtNegativa > 0){estado = reprovar}
            }
        }

        if (descCurso == "Curso de Ciências Físicas e Biológicas") {
            disciplinasChaves.forEach(dado => {
                console.log(dado.disciplina)
                if (dado.disciplina == "L. Portuguesa" || dado.disciplina == "Geo.Descrit." || dado.disciplina == "Geologia" || dado.disciplina == "Química" || dado.disciplina == "Biologia" || dado.disciplina == "Física") {
                    console.log(dado.disciplina)
                    if(dado.mf < 10){

                        estado = reprovar
                    }
                }else{
                    if(estado == ""){
                        if(dado.mf < 10){qtNegativa++; temNegativa = true}
                        if(dado.mf < 7){estado = reprovar}
                    } 
                }
            });
            if(!classeExame){
                if(qtNegativa > 0){estado = reprovar}
            }
        }

        /* Verificar se Desistio */
        disciplinasChaves.forEach(nota => {
            if(nota.mf == 0){mediasZerodesistido++}
        });
        if(mediasZerodesistido > 2){estado = desistir}

        if(estado == "" & !temNegativa){estado = aprovar}
        if(classeExame){if(qtNegativa < 2 & estado != aprovar & estado != reprovar & estado != desistir){estado = "RECURSO"}}

        return estado

    } catch (error) {
        return error
    }
}