import { addDespesaService, addReceitaService, findAllDespesasService, findAllReceitasService } from "../services/financas.service.js"


export const homeFinancas = async (req, res) => {
    try {

        res.render('Financas/homeFinancas')
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const receitas = async (req, res) => {
    try {
        const receitas = await findAllReceitasService()
        let total = 0
        receitas.forEach(receita => {
            total += receita.valor
        });
        //return res.send({ receitas })
        res.render('Financas/receitas', { receitas , total})
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const addReceita = async (req, res) => {
    try {

        res.render('Financas/addReceita')
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const saveReceita = async (req, res) => {
    try {
        let receita = req.body
        const valorCalc = receita.qt * receita.valor
        receita.valor = valorCalc

        const receitaSalva = await addReceitaService(receita)

        //res.send({receita})
        req.flash('success_msg', 'Receita adicionada com sucesso!')
        res.redirect('/financas/receitas')
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const despesas = async (req, res) => {
    try {

        const despesas = await findAllDespesasService()
        let total = 0
        despesas.forEach(receita => {
            total += receita.valor
        });
        res.render('Financas/despesas', {despesas, total})
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const addDespesa = async (req, res) => {
    try {

        res.render('Financas/addDespesa')
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const saveDespesa = async (req, res) => {
    try {
        let despesa = req.body

        const despesaSalva = await addDespesaService(despesa)

        //res.send({despesaSalva})
        req.flash('success_msg', 'Receita adicionada com sucesso!')
        res.redirect('/financas/despesas')
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const resumo = async (req, res) => {
    try {
        const despesas = await findAllDespesasService()
        const receitas = await findAllReceitasService()
        let totalRe = 0
        let totalDe = 0
        despesas.forEach(despesa => {
            totalDe += despesa.valor
        });
        receitas.forEach(receita => {
            totalRe += receita.valor
        });
        let saldo = totalRe - totalDe

        res.render('financas/resumo', {totalDe, totalRe, saldo})
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const relatorios = async (req, res) => {
    try {
        const despesas = await findAllDespesasService()
        const receitas = await findAllReceitasService()
        let relaDiario = []
        const relGeral = []
        
        despesas.forEach(despesa => {
            if(despesa.data = Date.now()){
                relaDiario.push(despesa)
            }
        });
        relGeral.push(relaDiario)
        

        res.render('financas/relatorios', {relGeral})
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const gerarRelDiario = async (req, res) => {
    try {
        const dia = req.body.dia
        //return res.send(dia)
        if(''+dia != '2023-07-25'){
            //return res.send('Não ha nenhum registro no dia selecionado!')
            req.flash('error_msg', 'Não ha nenhum registro no dia selecionado!')
            res.redirect('/financas/relatorios')
        }
        const despesas = await findAllDespesasService()
        const receitas = await findAllReceitasService()
        let relaDiario = []
        const relGeral = []
        
        
        //relGeral.push(relaDiario)
        

        res.render('financas/gerarRelatorio', {despesas, receitas, dia})
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const gerarRelSem = async (req, res) => {
    try {
        const dia = req.body.dia
        //return res.send(dia)
        if(''+dia != '2023-07-25'){
            //return res.send('Não ha nenhum registro no dia selecionado!')
            req.flash('error_msg', 'Não ha nenhum registro no dia selecionado!')
            res.render('financas/gerarRelSem')
        }
        const despesas = await findAllDespesasService()
        const receitas = await findAllReceitasService()
        let relaDiario = []
        const relGeral = []
        
        
        //relGeral.push(relaDiario)
        

        res.render('financas/gerarRelatorio', {despesas, receitas, dia})
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

