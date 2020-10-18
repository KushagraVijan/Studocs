const sgMail = require('@sendgrid/mail');

sendgridApiKey = "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";

sgMail.setApiKey(sendgridApiKey);

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'kushagravijan33@gmail.com',
        subject: 'Thanks for joining in Studocs!',
        text: 'Welcome to the app, ' + name + '. Let me know how you get along with the app.'
    })
}

const sendCancelationMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'kushagravijan33@gmail.com',
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
    generateOTP
}