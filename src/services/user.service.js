
import Usuario from '../models/user.modles.js'
import jwt from 'jsonwebtoken'

export const findByUsernameService = (username) => Usuario.findOne({username: username}).lean();

export const generateToken = (id) => jwt.sign({id: id}, process.env.SECRET_JWT, {expiresIn: '1h'})

export const createUserService = (novoUsuario) => Usuario(novoUsuario).save();

export const findAllUsers = () => Usuario.find().lean().sort({username: 1})

export const findUsuariosByCategoriaService = (categoria) => Usuario.find({categoria: categoria}).lean().sort({username: 1})

export const findUserBuNameService = (username) => Usuario.findOne({username: username}).lean();

export const findUserByIdService = (id) => Usuario.findById(id).lean()

export const findUserByIdAndDelet = (id) => Usuario.findByIdAndDelete(id)

export const findUserBIdAndUpdate = (id, usuario) => Usuario.findByIdAndUpdate(id, usuario)

import bcrypt from 'bcryptjs'
export const changePassword = (userId, oldPassword, newPassword) => {
  try {

    Usuario.findById(userId).then( async (usuario) => {
        // 1. Buscar usuário no banco

    // 2. Validar senha antiga (opcional, mas recomendado)
    //const isMatch =  bcrypt.compare(oldPassword, usuario.senha);
    //if (!isMatch) throw new Error("Senha antiga incorreta");
    
    // 3. Gerar hash da nova senha
    const saltRounds = 10; // custo do hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    //return hashedPassword;

    // 4. Atualizar no banco
    usuario.senha = hashedPassword;
    usuario.updateOne();
    }).catch((error) =>{
        console.log("Erro ao alterar: "+error.message)

    }
    )

    /* // 1. Buscar usuário no banco
    const user = Usuario.findById(userId);
    if (!user) throw new Error("Usuário não encontrado");

    // 2. Validar senha antiga (opcional, mas recomendado)
    //const isMatch =  bcrypt.compare(oldPassword, user.senha);
    const senhaAnterior = user.username
    return senhaAnterior
   // if (!isMatch) throw new Error("Senha antiga incorreta");
    
    // 3. Gerar hash da nova senha
    const saltRounds = 10; // custo do hash
    //const hashedPassword = await bcrypt.hash(newPassword, 10);
    //return hashedPassword;

    // 4. Atualizar no banco
    user.senha = newPassword;
    user.save(); */


    return "Senha alterada com sucesso!";
  } catch (err) {
    throw new Error(err.message);
  }
}