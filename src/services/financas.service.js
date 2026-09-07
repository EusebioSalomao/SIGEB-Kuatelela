import Receita from '../models/receitas.modell.js'
import Despesa from '../models/despesas.modell.js'

//Receitas
export const addReceitaService = (receita) => Receita(receita).save()

export const findAllReceitasService = () => Receita.find().lean()


//Despesas
export const addDespesaService = (despesa) => Despesa(despesa).save()
export const findAllDespesasService = () => Despesa.find().lean()