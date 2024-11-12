const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Configura Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendVerificationCode(phoneOrEmail, verificationCode) {
    if (phoneOrEmail.includes('@')) {
        // Si es un email, enviamos un correo
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: phoneOrEmail,
            subject: 'Código de Verificación',
            text: `Tu código de verificación es: ${verificationCode}`
        };

        await transporter.sendMail(mailOptions);
        console.log('Código enviado por correo a ' + phoneOrEmail);
    } else {
        // Si es un número de teléfono, enviamos un SMS
        await twilioClient.messages.create({
            body: `Tu código de verificación es: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneOrEmail
        });
        console.log('Código enviado por SMS a ' + phoneOrEmail);
    }
}

module.exports = { sendVerificationCode };
