import mongoose from "mongoose"
const connectDB = () => {
    console.log("Aguardando a conexão com BD...")

    mongoose.Promise = global.Promise;

    //Trabalhando com a conexáo do Atlas
    /* mongodb+srv://eusebiosalomao_db_user:vuQ3ll7uqQm8BIQX@cluster0.fyjzrfn.mongodb.net/?appName=Cluster0 */
    /*  */
    mongoose.connect("mongodb+srv://devsalb9_db_user:yvnthuLzZHShPCQl@sigebteste.ptzqwvo.mongodb.net/?appName=SIGEBTESTE").then(() => {
        console.log("BD SIGEBTESTE conectado em Online!")
    }).catch((erro) => {
        console.log("Erro de Conexão com BD online: " + erro)
        
        mongoose.connect('mongodb://127.0.0.1/SIGEBTESTE').then(()=>{
        console.log("BD Local(SIGEBTESTE) conectado com sucesso!")
        }).catch((erro)=>{
        console.log("Erro de Conexão com o BD Local: " + erro)
        })
    }) 
}
//




export default connectDB;