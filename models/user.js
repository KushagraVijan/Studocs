const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: { 
        type: String,
        unique: true,
        required: true
    },
    
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email Address");
            } 
            else if(!value.toLowerCase().includes("@pec.edu.in")){
                throw new Error("Use Pec Id to register in Studocs.");
            }
        }
    },

    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value){
            if (value.toLowerCase().includes("password")) {
                throw new Error("Password cannot contain 'password' ");    
            }    
        }
    },
    
    otp: {
        type: String,
        default: "000000-"
    },

    registered: {
        type: Boolean,
        default: false
    },
    
    // Profile Settings->
    
    branch: {
        type: String,
        default: "Branch"
    },

    batch: {
        type: Number,
        default: 2022,
        validate(value) {
            if(value < 2019 || value > 2025) {
                throw new Error("Incorrect Batch Year");             
            }
        }
    },
    
    age: {
        type: Number,
        validate(value) {
            if(value < 18) {
                throw new Error("Age cannot be less than 18");             
            }
        }
    },

    sid: {
        type: Number,
        validate(value) {
            if((value/1000000)<=15 || (value/1000000)>21) {
                throw new Error("Incorrect SID");             
            }
        }
    },
    
    mobile: {
        type: Number,
        validate(value) {
            if(value >= 10000000000 || value <= 999999999) {
                throw new Error("Invalid Mobile No.");
            } 
        }
    },

    address: {
        type: String,
        default: "Address"
    },

    website: {
        type: String,
        default: "Website"
    },

    github: {
        type: String,
        default: "Github"
    },

    twitter: {
        type: String,
        default: "Twitter"
    },

    instagram: {
        type: String,
        default: "Instagram"
    },

    facebook: {
        type: String,
        default: "Facebook"
    },

    gender: {
        type: String,
        validate(value) {
            if(value!="Male" && value!="Female" && value!="M" && value!="F") {
                throw new Error("Choose correct Gender");
            }
        }
    },
    
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],

    pic: {
        type: Number,
        default: 7
    }

}, {
    timestamp: true
});

//For authentication token generation
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const JWTsecret="Studocs3";
    const token = jwt.sign({ _id: user._id.toString() }, JWTsecret);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
}

// findByCredentials is not a pre defined so we are able to use other name also.
userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ email });

    if (!user || user.registered==false) {
        throw new Error("Unable to Login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Unable to Login");
    }

    return user
}

//Hash the password
userSchema.pre('save', async function(next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next()
})

const User = mongoose.model("User", userSchema)

module.exports = User;
