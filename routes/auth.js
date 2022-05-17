const express = require('express');
const router = express.Router();



const { register, login, forgotPassword, resetPassword, refreshToken, updateAvatar, upload } = require('../controller/auth');

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/forgotPassword").post(forgotPassword);

router.route("/resetPassword/:resetToken").put(resetPassword);

router.route("/refreshToken").post(refreshToken);

router.route("/updateAvatar").post(upload, updateAvatar);

module.exports = router;