const User = require('../models/User');
exports.getPrivateData = (req, res, next) => {
    res.status(200).json({
        succes: true,
        data: "tienes acceso a datos privados de esta ruta",
        user: { "id":req.user.id ,"usuario": req.user.username, "email": req.user.email, "avatar":""}
    })

}