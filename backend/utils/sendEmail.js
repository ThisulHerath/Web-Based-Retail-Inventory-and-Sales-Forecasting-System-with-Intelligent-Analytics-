import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env vars are available even when the process is started outside backend/.
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const normalizeSmtpPassword = (value) => {
    // Gmail app passwords are often copied with spaces every 4 chars.
    return String(value || '').replace(/\s+/g, '');
};

/**
 * Utility to send an email using standard SMTP.
 * Must configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and FROM_EMAIL in environment variables.
 */
const sendEmail = async (options) => {
    try {
        const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT, 10) || 587;
        const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USER;
        const smtpPass = normalizeSmtpPassword(process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.MAIL_PASS);
        const tlsRejectUnauthorized = String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true').toLowerCase() !== 'false';

        if (!smtpUser || !smtpPass) {
            throw new Error('SMTP configuration is incomplete. Please set SMTP_USER and SMTP_PASS in backend/.env');
        }

        const buildTransporter = (rejectUnauthorized) => nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for 587
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            tls: {
                rejectUnauthorized,
            },
        });

        let transporter = buildTransporter(tlsRejectUnauthorized);

        // Fail fast with a clear SMTP-level error before attempting sendMail.
        try {
            await transporter.verify();
        } catch (verifyError) {
            const verifyMessage = String(verifyError?.message || '').toLowerCase();
            const hasCertChainIssue =
                verifyMessage.includes('self-signed certificate') ||
                verifyMessage.includes('certificate chain');

            if (tlsRejectUnauthorized && hasCertChainIssue) {
                console.warn('SMTP verify failed due to certificate chain; retrying with rejectUnauthorized=false');
                transporter = buildTransporter(false);
                await transporter.verify();
            } else {
                throw verifyError;
            }
        }

        const logoPath = path.join(__dirname, '..', 'public', 'super-city-logo.png');
        const attachments = options.attachments || (fs.existsSync(logoPath) ? [{
            filename: 'super-city-logo.png',
            path: logoPath,
            cid: 'supercitylogo'
        }] : []);

        const mailOptions = {
            from: `${process.env.FROM_NAME || '7 Super City Network'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
            attachments,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent successfully to ${options.email} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error(`Email send failed: ${error.message}`);
    }
};

/**
 * Returns the HTML template for the 7 Super City Welcome Email.
 */
export const getWelcomeEmailTemplate = (name, role, email, password) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1e7a34; padding: 20px; text-align: center;">
            <img src="cid:supercitylogo" alt="7 Super City Logo" style="max-width: 180px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to 7 Super City POS</h1>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 16px;">You have been securely added to the 7 Super City system as a <strong>${role}</strong>.</p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #1e7a34; padding: 15px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; font-size: 16px; color: #555;"><strong>Your official login details:</strong></p>
                <p style="margin: 0 0 5px 0; font-size: 18px;">Email: <strong>${email}</strong></p>
                <p style="margin: 0; font-size: 18px;">Temporary Password: <strong>${password}</strong></p>
            </div>
            
            <p style="color: #e74c3c; font-size: 15px; font-weight: bold;">
                ⚠️ For security reasons, please log in and change your password immediately.
            </p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-top: 1px solid #ddd;">
            <p style="margin: 0; font-size: 12px; color: #777;">Best Regards,<br>The 7 Super City Admin Team</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #aaa;">This is an automated system email, please do not reply.</p>
        </div>
    </div>
    `;
};

export default sendEmail;
