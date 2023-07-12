const router = require('express').Router();
const authController = require('../controller/authController.js');
const {verifyToken} = require('../controller/verify');

    router.post('/register', authController.userRegister);
    router.post('/confirmUser', authController.confirmUser );
    router.post('/confirmCode', authController.confirmCode );
    // router.post('/resetPassword', authController.resetPassword );
    router.post('/refresh', authController.requestRefreshToken);

    router.post('/login', authController.loginUser);
    router.post('/logout', verifyToken, authController.logout );

module.exports = router;

