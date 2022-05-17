const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img') // guarda la imagen cruda
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}.${ext}`);
        console.log(ext);
        
    }
    
})
const upload = multer({storage})
exports.upload =  async(req, file, next) => {upload.single('file')}











