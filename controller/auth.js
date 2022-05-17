const crypto = require('crypto');
const User = require("../models/User");
const { use } = require('../routes/private');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
//const {storage} = require('../middleware/uploadAvatar');
const multer = require('multer');
const sharp = require('sharp')
exports.register = async (req, res, next) => {
    const { username, email, password, avatar } = req.body;

    try {
        const user = await User.create({
            username,
            email,
            password,
            avatar
        })
        sendToken(user, 201, res);

    } catch (error) {
        res.status(500).json({
            succes: false,
            error: error.keyValue.email,

        })

    }
};

exports.login = async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ succes: false, error: "ingrese email y contraseña" })
    }

    try {
        const user = await User.findOne({ email }).select("+password")

        if (!user) {
            return res.status(404).json({ succes: false, error: "credenciales invalidas" })
        }


        const isMarch = await user.matchPassword(password);

        if (!isMarch) {
            return res.status(400).json({ succes: false, error: "error de contraseña" })
        }
        sendToken(user, 200, res);
    } catch (error) {
        return res.status(500).json({ succes: false, error: error.message });
    }

};

exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ succes: false, error: "email no sincronizado" })
        }
        const resetToken = user.getResetPasswordToken();

        await user.save();

        const restUrl = `http://localhost:5001/resetpassword/${resetToken}`;
        const message = `
            <h1> Restablecer contraseña </h1>
            <p> enlace para restablecer su contraseña </p>
            <a href=${restUrl} clicktracking=off>${restUrl}</a>
        `
        try {

            await sendEmail({
                to: user.email,
                subject: "restablecer su contraseña",
                text: message

            });
            res.status(200).json({ succes: false, data: "email enviado" })
        } catch (error) {
            console.log(error)
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return res.status(500).json({ succes: false, error: "no se pudo enviar el email" })
        }
    } catch (error) {
        next(error);
    }

};

exports.resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        })
        if (!user) {
            return res.status(404).json({ succes: false, error: "invalido reinicie token" })
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ succes: false, data: "contraseña restablecida" })
    } catch (error) {
        next(error);
    }
}

exports.updateAvatar = async (req, file, next) => {
    let token = req.body.token
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        console.log(user)
        if (!user) {
            return res.status(404).json({ succes: false, error: "id no sincronizado" })
        }
    
    console.log(file)
    helperImg(req.file.path,`resize-${req.file.filename}`,100 )
    file.status(200).json({ succes: false, data: "imagen actualizada" })
    }
    catch{
        
    }
};
exports.refreshToken = async (req, res, next) => {

    

    let token = req.body.token
    console.log("1" + token)
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        console.log(user)
        if (!user) {
            return res.status(404).json({ succes: false, error: "id no sincronizado" })
        }
        const resetToken = user.getSignedToken();
        console.log(resetToken)
        await user.save();
        res.status(200).json({
            token: resetToken,
        }
        )


    } catch (error) {
        return res.status(404).json({ succes: false, error: "id no sincronizado" })
    }

};


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
exports.upload = upload.single('file')



const helperImg = (filePath,filename, size = 300) =>{
    return sharp(filePath)
    .resize(size)
    .toFile(`./img/optimize/${filename}`)
}







