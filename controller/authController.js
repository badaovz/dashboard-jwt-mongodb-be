const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

let refreshTokens = [];
let resetUser = {
    userEmail: '',
    codeReset: null
}

console.log("CodeReset: ", resetUser.codeReset);

const authController = {
    userRegister: async (req, res) => {
        try {
            //encode password
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt); 

            //create new user
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                img: req.body.img,
                address: req.body.address,
                country: req.body.country,
                status: req.body.status,
                age: req.body.age,
                password: hashed, 
            });

            const user = await newUser.save();
            return res.status(200).json(user);

        } catch (error) {
            return res.status(500).json(error);
        }
    },

    // createCode: async (req, res) => {
    //     try {
    //         const user = await User.find({email: req.body.email});
    //         if(!user){
    //             return res.status(403).json('Email not valid!')
    //         }
    //         const code = Math.floor(Math.random()*1000000);
    //         codes.push(code);
    //         return res.status(200).json({data: {
    //             user,
    //             code,
    //         }});
    //    } catch (err) {
    //        return res.status(500).json(err);
    //    }
    // },

    confirmUser: async (req, res) => {
        try {
            const user = await User.find({email: req.body.email});
            resetUser.userEmail = req.body.email;
            if(!user){
                return res.status(403).json('Email not valid!')
            }
            const code = Math.floor(Math.random()*1000000);
            resetUser.codeReset = code;
            return res.status(200).json({user, code});
       } catch (err) {
           return res.status(500).json(err);
       }

    },

    confirmCode: async (req, res) => {
        try {
            const code = await req.body.code;
            if(!code){
                return res.status(403).json('no code');
            }
            if(code == resetUser.codeReset){
                await authController.resetPassword(req.body.newPassword);
                resetUser.userId = '';
                resetUser.codeReset = null;
                return res.status(200).json('resetPassword successfully!');
            }
            return res.status(404).json('code not valid!');
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    resetPassword: async (newPassword) => {
        const salt = await bcrypt.genSalt(10);
        const passHashed = await bcrypt.hash(newPassword, salt); 
        const query = {email: resetUser.userEmail}
        await User.findOneAndUpdate(query, {password: passHashed} );    
    },
    //access token
    generateAccessToken: (user) => {
        return jwt.sign({
                id: user.id,
                isAdmin: user.isAdmin,
            },
            process.env.ACCESS_TOKEN_PUBLIC_KEY,
            {
                expiresIn: '30s'
            }
        );
    },
    //refresh token
    generateRefreshToken: (user) => {
        return jwt.sign({
                id: user.id,
                isAdmin: user.isAdmin,
            },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            {
                expiresIn: '365d'
            }
        )
    },
    //login
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({username: req.body.username});
            if(!user){
                return res.status(404).json('Incorrect username')
            }
            const validPassword = await bcrypt.compare(
                req.body.password, user.password
            )
            if(!validPassword) {
                return res.status(404).json('Incorrect password');
            }

            if(user && validPassword){
                const accessToken = authController.generateAccessToken(user);
                const refreshToken = authController.generateRefreshToken(user);
                refreshTokens.push(refreshToken);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure:false,
                    path: "/",
                    sameSite: "strict",
                  });
                const {password, ...others} = user._doc;
                return res.status(200).json({...others, accessToken});

            }
        } catch (err) {
            return res.status(500).json(err);
        }
    },

    requestRefreshToken: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            return res.status(401).json('you are not authenticated')
        };
        // if(!refreshTokens.includes(refreshToken)) {
        //     return res.status(403).json('refreshToken is invalid')
        // };
        jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
            if(err){
                return res.status(500).json(err);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);
            refreshTokens.push(newRefreshToken);
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            return res.status(200).json({
                accessToken: newAccessToken, 
                
            });

        });
    },

    logout: async (req, res) => {
        try {
            await res.clearCookie('refreshToken');
            refreshTokens = refreshTokens.filter(token => token !== req.body.token);
            return res.status(200).json('logout successfully!');
        } catch (err) {
            return res.status(500).json(err);
        }
    }

}


module.exports = authController;
