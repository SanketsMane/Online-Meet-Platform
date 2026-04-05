const nodemailer = require('nodemailer');
const config = require('../config');

/**
 * Email Service for Kidokool-LMS
 * Handles OTP and system notifications using Gmail SMTP
 */
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || config.email.user,
                pass: process.env.EMAIL_PASS || config.email.pass
            }
        });
    }

    /**
     * Send OTP for Verification or Password Reset
     * @param {object} user { email, name }
     * @param {string} otpCode
     */
    async sendOTP(user, otpCode) {
        const mailOptions = {
            from: `"Kidokool" <${process.env.EMAIL_USER || config.email.user}>`,
            to: user.email,
            subject: 'Your Kidokool Verification Code',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4a90e2;">Verification Code</h2>
                    <p>Hello ${user.name || 'User'},</p>
                    <p>Your verification code for Kidokool-LMS is:</p>
                    <div style="background: #f4f7f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
                        ${otpCode}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('OTP Email sent: ' + info.response);
            return true;
        } catch (error) {
            console.error('Error sending OTP email:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();
