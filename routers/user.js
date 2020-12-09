const express = require('express');
const router = new express.Router();
const User = require('../models/user.js');
const auth = require('../middleware/auth.js');
const { sendMsg, sendOTPMail, sendWelcomeMail, sendCancelationMail, generateOTP } = require('../emails/account');

// for req.body
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/signup", (req, res) => {
    res.render('signUpForm');
})

router.post("/signup", async(req, res) => {
    var OTP = generateOTP();
    req.body.otp = OTP;

    const user1 = await User.findOne({ email: req.body.email });
    if(user1 && user1.otp!="000000-"){
        user1.remove();
    }

    const user = new User(req.body);
    
    try{
        await user.save();
        console.log(OTP);
        //sendOTPMail(user.email, "Register OTP", user.otp);
        //const token = await user.generateAuthToken();
        //res.status(201).send({ user });
        console.log("OTP sent:");
        var link = "/otp/" + user._id;
        res.redirect(link);
    } catch (e) {
        if(e.name=="MongoError"){
            if(e.keyValue.email)
            //res.status(400).send(e.keyValue.email+" already exists.");
            res.render('error', { error: e.keyValue.email+" already exists." });
            else
            //res.status(400).send(e.keyValue.name+" already exists. Change Username.");
            res.render('error', { error: e.keyValue.name+" already exists. Change your username." });
        }
        if(e.errors.password!=null)
        //res.status(400).send(e.errors.password.message);
        res.render('error', { error: e.errors.password.message });
        else if(e.errors.email!=null)
        //res.status(400).send(e.errors.email.message);
        res.render('error', { error: e.errors.email.message });
        //res.status(400).send(e);
        else
        res.render('error', { error: e });
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
    } else if(user.otp == "000000-"){
        res.send("You are already a user.");
    } else if(user.otp == OTP){
        user.otp = "000000-";
        user.registered = true;
        await user.save();
        //sendWelcomeMail(user.email, user.name);
        console.log("Registered Successfully");
        res.redirect('/home/'+user.name);
    } else {
        //sendMsg(user.email, "Wrong OTP", "Wrong OTP you Entered. Sign up again please." );
        user.remove();
        res.send("Wrong OTP you Entered. Again sign up Please.");
    }
})

router.get("/home/:name", auth, async(req, res) => {
    const name = req.params.name;
    const user = await User.findOne({ name });
    if(user){
        //res.send("Such user does not exist.");
        res.render('home', { name });
    } else {
        res.send("Such user does not exist.");
    }    
})

router.get("/login", (req, res) => {
    res.render('loginForm');
})

router.post("/login", async(req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    
    try {
        const user = await User.findByCredentials(email, password);
        console.log("Login successful");
        const token = await user.generateAuthToken();
        //sendMsg(email, "Login successful", "You logged in successfully.");
        res.redirect('/home/'+user.name);
    } catch (e) {
        //res.status(400).send("Invalid Login credentials");
        res.render('error', { error: "Invalid Login credentials" });
    }
})

router.get("/forgotPass", async(req, res)=>{
    const email = req.query.email;
    if(!email)
    res.render('forgotPass');
    else{
        const user = await User.findOne({ email });
        if(!user)
        //res.send("No such user found.");
        res.render('error', { error:"No such user found" });
        else{
            const OTP = generateOTP();
            user.otp = OTP;
            await user.save();
            //sendOTPMail(user.email, "Forgot Password", user.otp);
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
    
        user.otp = "000000-";
        user.password = req.body.password;
        
        try{
            await user.save();
            //res.send("Password changed successfully");
            //sendMsg(user.email, "Password", "You have successfully changed your password.");
            res.render('error', { error: "Password changed successfully" });
        } catch (e) {
            if(e.errors.password!=null)
            //res.status(400).send(e.errors.password.message);
            res.render('error', { error: e.errors.password.message });
            if(e.errors.email!=null)
            //res.status(400).send(e.errors.email.message);
            res.render('error', { error: e.errors.email.message });
        }
    } else {
        //res.send("Wrong OTP you Entered.");
        res.render('error', { error: "Wrong OTP you Entered." });
    }
});

router.get("/home/:name/profile", async(req, res) => {
    const name = req.params.name;
    const user = await User.findOne({ name });
    if(user){
        res.render('profile', { user });
    } else {
        res.send("Such user does not exist.");
    } 
})

router.get("/home/:name/editProfile", async(req, res) => {
    const name = req.params.name;
    const user = await User.findOne({ name });
    if(user){
        res.render('editProfile', { user });
    } else {
        res.send("Such user does not exist.");
    } 
})

router.get("/home/:name/deleteOtp", async(req, res) => {
    const name = req.params.name;
    const user = await User.findOne({ name });
    if(user){
        const OTP = generateOTP();
        user.otp = OTP;
        await user.save();
        //sendOTPMail(user.email, "Delete Account", "OTP: " + user.otp);
        console.log(OTP);
        res.render('deleteOtp');
    } else {
        res.send("Such user does not exist.");
    } 
})

router.post("/home/:name/deleteOtp", async (req, res) => {
    const name = req.params.name;
    const OTP = req.body.otp;
    const user = await User.findOne({ name });
    if(user.otp == OTP){
        try{
            //const email = user.email;
            await user.remove();
            console.log("Removed Successfully.");
            //sendOTPMail(email, "Deleted Account", "Your account deleted successfully.");
            res.redirect('/signup');
        } catch (e) {
            res.send(e);
        }
    } else {
        res.send("Wrong OTP you Entered.");
    }
});

router.post("/home/:name/editProfile", async(req, res) => {
    const name = req.params.name;
    const user = await User.findOne({ name });
    const user1 = req.body;
    // Editing a profile
    user.name = user1.name;
    user.age = user1.age;
    user.gender = user1.gender;
    
    user.branch = user1.branch;
    user.batch = user1.batch;
    user.sid = user1.sid;
    user.mobile = user1.mobile;
    user.address = user1.address;

    user.website = user1.website;
    user.github = user1.github;
    user.twitter = user1.twitter;
    user.instagram = user1.instagram;
    user.facebook = user1.facebook;
    
    //For DP
    if(user1.gender == "Male" || user1.gender == "M"){
        user.pic = 7;
    }
    if(user1.gender == "Female" || user1.gender == "F"){
        user.pic = 3;
    }

    try{
        await user.save();
        res.redirect('/home/'+user.name+'/profile');
        //sendMsg(user.email, "Edited Profile", "You have successfully edited your profile.");
    } catch (e) {
        if(e.name=="MongoError"){
            res.send(e.keyValue.name+" already exists. ");
        } else{
            res.send(e.message+" "); 
        }
    }
})

router.get("/home/:name/search", async (req, res) => {
    var name = req.query.id;
    var email = req.query.id;

    if(name){
        var user = await User.findOne({ name });
        var user1 = await User.findOne({ email });
        if(user){
            res.render('searchProfile', { user });

        } else if (user1) {
            user = user1;
            res.render('searchProfile', { user });
        } else {
            res.render('search', { error: name+" does not exist." })
        }
    } else {
        res.render('search', { error: "" });
    }
})

router.get("/home/:name/internship", async (req, res) => {
    const name = req.params.name;
    const user = await User.findOne({ name });
    res.render('internship', { user });
})

router.get("/home/:name/placement", async (req, res) => {
    const name = req.params.name;
    const user = await User.findOne({ name });
    res.render('placement', { user });
})

module.exports = router;