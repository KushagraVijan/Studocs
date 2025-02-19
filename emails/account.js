const sgMail = require('@sendgrid/mail');
sendgridApiKey = "";
sgMail.setApiKey(sendgridApiKey);

const sendOTPMail = (email, sub, otp) => {
    sgMail.send({
        to: email,
        from: 'studocs03@gmail.com',
        subject: sub,
        text: 'OTP: ' + otp
    })
}

const sendMsg = (email, sub, msg) => {
    sgMail.send({
        to: email,
        from: 'studocs03@gmail.com',
        subject: sub,
        text: msg
    })
}

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'studocs03@gmail.com',
        subject: 'Thanks for joining in Studocs!',
        text: 'Welcome to the app, ' + name + '. Let me know how you get along with the app.'
    })
}

const sendCancelationMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'studocs03@gmail.com',
        subject: 'Sorry to see you go!',
        text: 'Goodbye, ' + name + '.I hope to see you back soon.'
    })
}

function generateOTP() {         
    // Declare a digits variable  
    // which stores all digits 
    var digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < 6; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    return OTP; 
} 

module.exports = {
    sendWelcomeMail,
    sendCancelationMail,
    generateOTP, 
    sendMsg,
    sendOTPMail
}
