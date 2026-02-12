'use strict';

const nodemailer = require('../lib/nodemailer');
const config = require('../config');
const Logger = require('../Logger');
const log = new Logger('EmailService');

const APP_NAME = config.ui?.brand?.app?.name || 'KIDOKOOL';
const BRAND_COLOR = '#6366f1'; // Indigo-500
const TEXT_COLOR = '#1e293b';
const BG_COLOR = '#f8fafc';

class EmailService {
    /**
     * Get Base HTML Template
     * @param {string} title 
     * @param {string} content 
     * @returns {string}
     */
    static getHTMLTemplate(title, content) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: ${TEXT_COLOR}; background-color: ${BG_COLOR}; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
                    .header { background: ${BRAND_COLOR}; padding: 32px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
                    .content { padding: 40px; }
                    .footer { padding: 24px; text-align: center; font-size: 12px; color: #64748b; background: #f1f5f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; }
                    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #ef4444; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${APP_NAME}</h1>
                    </div>
                    <div class="content">
                        <h2 style="margin-top: 0; color: #0f172a;">${title}</h2>
                        ${content}
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} ${APP_NAME} SFU. All rights reserved.<br>
                        This is an automated security notification.
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Send Welcome Email to Developer
     * @param {object} user 
     */
    static async sendWelcome(user) {
        const title = 'Welcome to the Developer Portal';
        const content = `
            <p>Hi ${user.name || 'Developer'},</p>
            <p>Thank you for joining the ${APP_NAME} Developer ecosystem. Your account is now active and you can start generating API keys to integrate video conferencing into your applications.</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Log in to your dashboard</li>
                <li>Generate your first API Key</li>
                <li>Check the "Documentation" tab for quick-start guides</li>
            </ul>
            <a href="${config.server.hostUrl}/developer" class="button">Go to Dashboard</a>
        `;
        
        await this.sendBrandedEmail(user.email, title, content);
    }

    /**
     * Send Security Alert (Key Revocation/Deletion)
     * @param {object} user 
     * @param {string} action 
     * @param {string} keyName 
     */
    static async sendSecurityAlert(user, action, keyName) {
        const title = 'Security Alert: API Key Managed';
        const content = `
            <p>Hello,</p>
            <p>This is to inform you that an action was performed on your API keys:</p>
            <div style="background: #fff1f2; border-left: 4px solid #f43f5e; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b;"><strong>Action:</strong> ${action}</p>
                <p style="margin: 4px 0 0 0; color: #991b1b;"><strong>Key Name:</strong> ${keyName}</p>
            </div>
            <p>If you did not authorize this action, please log in and change your password immediately.</p>
        `;
        
        await this.sendBrandedEmail(user.email, title, content);
    }

    /**
     * Send Incident Alert to Admin
     * @param {object} data 
     */
    static async sendIncidentAlert(data) {
        const title = '🚨 System Incidence Alert';
        const content = `
            <p>A critical system event was detected that requires attention:</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px;">
                <p><strong>Event:</strong> ${data.event}</p>
                <p><strong>Severity:</strong> ${data.severity || 'Medium'}</p>
                <p><strong>Details:</strong> ${data.details}</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
        `;
        
        // Send to global alert recipient defined in config
        const adminEmail = config.integrations?.email?.sendTo;
        if (adminEmail) {
            await this.sendBrandedEmail(adminEmail, title, content);
        }
    }

    /**
     * Send Branded Email Helper
     * @param {string} to 
     * @param {string} title 
     * @param {string} content 
     */
    static async sendBrandedEmail(to, title, content) {
        try {
            const html = this.getHTMLTemplate(title, content);
            const subject = `${APP_NAME} - ${title}`;
            
            // Use the base nodemailer library's send function
            // We need to export it or use it indirectly
            const { sendEmail } = require('../lib/nodemailer');
            sendEmail(subject, html, to);
            
            log.info('Branded email sent', { to, title });
        } catch (error) {
            log.error('Failed to send branded email', error);
        }
    }
}

module.exports = EmailService;
