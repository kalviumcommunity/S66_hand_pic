const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can change this to your email provider
            auth: {
                user: process.env.EMAIL_USER, // Set these in .env
                pass: process.env.EMAIL_PASS  // Use App Password for Gmail
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@handscape.com',
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = sendEmail;
