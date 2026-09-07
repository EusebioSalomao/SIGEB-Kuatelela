import Credencial from "../models/credenciais.modell.js";

export const createCredencial = (credencial) => Credencial(credencial).save()

export const findAllCredenciasService = () => Credencial.find().sort().lean()