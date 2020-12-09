const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const auth = async(req, res, next) => {
    try {
        const JWTsecret="Studocs3";
        var token = req.header("Authorization").replace("Bearer ","");   
        console.log(token);
        const decoded = jwt.verify(token, JWTsecret);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next()
    } catch (e) {
        res.status(401).send({ error: "Please Authenticate." });
        //res.send(e);
        //res.redirect("/login");
    }
}

module.exports = auth;