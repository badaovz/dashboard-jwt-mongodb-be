const router =  require("express").Router();
const userController =  require("../controller/useController");
const { 
    verifyToken,
    verifyTokenAndAdmin,
    verifyAndUserAuthorization,
} = require('../controller/verify');

    router.get('/', verifyToken, userController.getAllUsers);
    router.delete('/:id', verifyAndUserAuthorization, userController.deleteUser);
module.exports = router;