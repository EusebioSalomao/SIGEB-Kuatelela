//import { path } from 'express/lib/application';
//import { time } from "console";
import multer from "multer"
import path from "path"

export const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve("public/uploads"));
    },
    filename: (req, file, callback) => {
        const time = new Date().getTime();

        callback(null, `${time}_${file.originalname}`);
    },
});





/* outra forma */
/* export const foto = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/uploads/fotos')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString() + "_"+file.originalname)
        }
    }),
    fileFilter: (req, file, cb) => {
        const extensaoImg = ['image/png', 'image/jpg', 'image/jpeg'].find(formatoAceito => formatoAceito == file.mimetype);
        if(extensaoImg){
            return cb(null, true);
        }
        return cb(null, false)
    }
})) */