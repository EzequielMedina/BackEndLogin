const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.protect = async(req, res, next) =>{
    let token;
    if(req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1]
    }

    if(!token){
        return res.status(400).json({succes: false, error: "no autorizado"})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id);
        
        if(!user){
            return res.status(404).json({succes: false, error: "No se encontro el usuario"})
        }
        req.user = user
        next();
    } catch (error) {
        return res.status(401).json({succes: false, error: "ruta no autorizada"})
    }
}