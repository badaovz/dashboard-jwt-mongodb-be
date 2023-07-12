 const jwt = require('jsonwebtoken');

 const verifyToken = (req, res, next) => {
     const token = req.headers.token;
    //  const refreshToken = req.cookies.refreshToken;
     if(token) {
         const accessToken = token.split(' ')[1];
         jwt.verify(accessToken, process.env.ACCESS_TOKEN_PUBLIC_KEY, (err, user) => {
             if(err) {
                 return res.status(403).json('Token is invalid');
             }
             req.user = user;
             next();
         })
     }else {
         return res.status(401).json("You're not authenticated");
     }
 };

 const verifyAndUserAuthorization = (req, res, next) => {
     verifyToken(req, res, () => {
         if(req.user.id === req.params.id || req.user.isAdmin) {
             next();
         }else {
             return res.status(403).json("you're not allowed to do that!");
         }

     });
 };

 const verifyTokenAndAdmin = (req, res, next) => {
     verifyToken(req, res, () => {
         if(req.user.isAdmin) {
             next();
         }else {
            return res.status(403).json("you're not allowed to do that!");
         }
     })
 }

 module.exports = {
     verifyToken,
     verifyTokenAndAdmin,
     verifyAndUserAuthorization,
 };