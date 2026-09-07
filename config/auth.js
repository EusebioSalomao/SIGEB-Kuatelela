import localStrategy from 'passport-local'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

//Model de usuario


/* 
module.exports = function(passport){

    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done)=>{
        Usuario.findOne({email: email}).then((usuario)=>{
            if(!usuario){
                return done(null, false, {message: 'Esta conta não existe!'})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) =>{
                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: 'senha incorrecta!'})
                }
            })
        })
    }))

    passport.serializeUser((usuario, done)=>{
        done(null, usuario.id)
    })
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) =>{
            done(err, usuario)
        })
    })
} */