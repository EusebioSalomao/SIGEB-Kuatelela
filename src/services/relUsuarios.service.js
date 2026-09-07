import RelUsuarios from '../models/relUsuarios.modell.js'

export const createRelUserService = (relUsuarios) => RelUsuarios(relUsuarios).save()

export const findAllRelUserService = () => RelUsuarios.find().sort({_id: -1}).lean() 