const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    // Add CORS headers so frontend can call it from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, email, action, question, answer, product } = req.body;

        // Retrieve SMTP settings from Vercel Environment Variables
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || '587');
        const smtpUser = process.env.SMTP_USER; // Your Gmail / SMTP username
        const smtpPass = process.env.SMTP_PASS; // Your Gmail App Password / SMTP password
        const toEmail = process.env.TO_EMAIL || 'dipakparmar2466@gmail.com';

        if (!smtpUser || !smtpPass) {
            return res.status(400).json({ 
                error: 'SMTP credentials not configured on Vercel environment variables. Please set SMTP_USER and SMTP_PASS.' 
            });
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        let subject = 'New Interactive 3D Shop Update';
        let htmlContent = '<h3>3D Shop Alert</h3>';

        if (action) {
            subject = `New Lead: ${name || 'User'} (${action})`;
            htmlContent = `
                <h2>New Experience Lead Entry</h2>
                <p><strong>Name:</strong> ${name || 'N/A'}</p>
                <p><strong>Email:</strong> ${email || 'N/A'}</p>
                <p><strong>Action Type:</strong> ${action}</p>
            `;
        } else if (question && answer) {
            subject = `Website Feedback: ${answer}`;
            htmlContent = `
                <h2>User Experience Feedback</h2>
                <p><strong>Question:</strong> ${question}</p>
                <p><strong>Response:</strong> ${answer}</p>
            `;
        } else if (product) {
            subject = `Garment Action Alert: ${product.name} (${product.action})`;
            htmlContent = `
                <h2>Garment Interaction Alert</h2>
                <p><strong>Garment Name:</strong> ${product.name}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Fabric:</strong> ${product.fabric}</p>
                <p><strong>Origin:</strong> ${product.origin}</p>
                <p><strong>Action Type:</strong> ${product.action || 'Viewed'}</p>
            `;
        }

        await transporter.sendMail({
            from: `"3D Shop Vault" <${smtpUser}>`,
            to: toEmail,
            subject: subject,
            html: htmlContent
        });

        return res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Mail sending error:', error);
        return res.status(500).json({ error: 'Failed to send email.', details: error.message });
    }
};
