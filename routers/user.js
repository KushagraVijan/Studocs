const express = require('express');
const router = new express.Router();
const User = require('../models/user.js');
//const auth = require('../middleware/auth.js');
const { sendWelcomeMail, sendCancelationMail, generateOTP } = require('../emails/account');

// for req.body
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/signup", (req, res) => {
    res.render('signUpForm');
})

router.get("/homepage", (req, res) => {
    res.render('home', { name: "Kush" });
})

router.post("/signup", async(req, res) => {
    var OTP = generateOTP();
    req.body.otp = OTP;

    const user1 = await User.findOne({ email: req.body.email });
    if(user1 && user1.otp!="000000"){
        user1.remove();
    }

    const user = new User(req.body);
    
    try{
        await user.save();
        console.log(OTP);
        //sendWelcomeMail(user.email, user.name);
        //const token = await user.generateAuthToken();
        //res.status(201).send({ user });
        console.log("Registered Successfully");
        var link = "/otp/" + user._id;
        res.redirect(link);
    } catch (e) {
        if(e.name=="MongoError"){
            if(e.keyValue.email)
            res.status(400).send(e.keyValue.email+" already exists.");
            else
            res.status(400).send(e.keyValue.name+" already exists. Change Username.");
        }
        if(e.errors.password!=null)
        res.status(400).send(e.errors.password.message);
        if(e.errors.email!=null)
        res.status(400).send(e.errors.email.message);
        res.status(400).send(e);
    }
})

router.get("/otp/:id", (req, res) => {
    res.render('otp');
})

router.post("/otp/:id", async(req, res) => {
    const user = await User.findById(req.params.id);
    var OTP = req.body.otp;
    if(!user){
        res.redirect("/signup");
    }
    else if(user.otp == OTP){
        user.otp = "000000";
        await user.save();
        res.render('home', { name: user.name });
    } else {
        user.remove();
        res.send("Wrong OTP you Entered. Again sign up Please.");
    }
})

router.get("/login", (req, res) => {
    res.render('loginForm');
})

router.post("/home", async(req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    //const token = await user.generateAuthToken();

    try {
        const user = await User.findByCredentials(email, password);
        res.render('home', { name: user.name});
        console.log("Login successful");
    } catch (e) {
        res.status(400).send("Invalid Login credentials");
    }
})

router.get("/forgotPass", async(req, res)=>{
    const email = req.query.email;
    if(!email)
    res.render('forgotPass');
    else{
        const user = await User.findOne({ email });
        if(user==undefined)
        res.send("No such user found.");
        else{
            const OTP = generateOTP();
            user.otp = OTP;
            await user.save();
            console.log(OTP);
            res.render('forgotOtp');
        }
    }
})

router.post("/forgotPass", async (req, res) => {
    const email = req.query.email;
    const OTP = req.body.otp;
    const user = await User.findOne({ email });
    if(user.otp == OTP){
    
        user.otp = "000000";
        user.password = req.body.password;
        
        try{
            await user.save();
            res.send("Password changed successfully");
        } catch (e) {
            if(e.errors.password!=null)
            res.status(400).send(e.errors.password.message);
            if(e.errors.email!=null)
            res.status(400).send(e.errors.email.message);
        }
    } else {
        res.send("Wrong OTP you Entered.");
    }
    
})

/*
router.get("/users/me", auth, async(req, res) => {
    res.send(req.user);
})
*/

module.exports = router;