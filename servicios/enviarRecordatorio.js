const nodemailer = require('nodemailer');

async function enviarRecordatorio(email, asunto, mensaje) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: asunto,
        text: mensaje
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Recordatorio enviado a ${email}`);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error; // Para que el test pueda detectar errores
    }
}

module.exports = enviarRecordatorio;
