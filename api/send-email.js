const nodemailer = require('nodemailer');
const https = require('https');

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

        // Retrieve SMTP settings from environment variables
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || '587');
        const smtpUser = process.env.SMTP_USER; // Your Gmail / SMTP username
        const smtpPass = process.env.SMTP_PASS; // Your Gmail App Password / SMTP password
        const toEmail = process.env.TO_EMAIL || 'dipakparmar2466@gmail.com';

        // Format Timestamp in Indian Standard Time (IST)
        const dateObj = new Date();
        const formattedTime = dateObj.toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        }) + ' (IST)';

        let subject = 'New 3D Shop Activity';
        let actionTitle = 'Shop Activity Alert';
        let accentColor = '#00E5FF'; // Cyber cyan default
        let actionDetailsHTML = '';
        let plainTextDetails = '';

        // Determine Action Type & format email elements
        if (action) {
            // Lead popup SUBMIT or SKIP
            const isSubmit = action.toUpperCase() === 'SUBMITTED';
            subject = `Shop Activity: ${isSubmit ? 'Lead Entered' : 'Lead Skipped'} - ${name || 'Visitor'}`;
            actionTitle = isSubmit ? 'Lead Entry: Completed' : 'Lead Entry: Skipped';
            accentColor = isSubmit ? '#4AFF83' : '#FF4A4A'; // Neon Green or Neon Red
            actionDetailsHTML = isSubmit 
                ? `Visitor filled the lead form and clicked <strong>ENTER EXPERIENCE</strong>.` 
                : `Visitor loaded the page and selected <strong>[ SKIP ]</strong>.`;
            plainTextDetails = isSubmit 
                ? `Visitor filled the lead form and clicked ENTER EXPERIENCE.` 
                : `Visitor loaded the page and selected [ SKIP ].`;
        } else if (question && answer) {
            // Feedback widget YES or NO
            const isYes = answer.toUpperCase() === 'YES';
            subject = `Shop Activity: Feedback - ${answer} from ${name || 'Visitor'}`;
            actionTitle = `Experience Feedback: ${answer}`;
            accentColor = isYes ? '#4AFF83' : '#FF4A4A';
            actionDetailsHTML = `Clicked <strong>${answer}</strong> on feedback prompt:<br><span style="color: #888; font-style: italic;">"${question}"</span>`;
            plainTextDetails = `Clicked ${answer} on feedback prompt: "${question}"`;
        } else if (product) {
            // Product interaction
            const productAction = product.action || 'Viewed';
            subject = `Shop Activity: Product ${productAction} - ${product.name}`;
            actionTitle = `Garment Alert: ${productAction}`;
            accentColor = '#00E5FF'; // Cyan
            actionDetailsHTML = `
                Interaction on garment design:<br><br>
                <strong>Garment Name:</strong> ${product.name}<br>
                <strong>Price:</strong> ${product.price || 'N/A'}<br>
                <strong>Fabric:</strong> ${product.fabric || 'N/A'}<br>
                <strong>Origin:</strong> ${product.origin || 'N/A'}<br>
                <strong>Action Triggered:</strong> ${productAction}
            `;
            plainTextDetails = `Garment Name: ${product.name} | Price: ${product.price} | Fabric: ${product.fabric} | Origin: ${product.origin} | Action: ${productAction}`;
        }

        // Build premium, responsive, dark-themed HTML content for SMTP delivery
        const htmlBody = `
            <div style="background-color: #0A0A0C; color: #FFFFFF; font-family: 'Courier New', Courier, monospace; padding: 40px 20px; text-align: center; border: 1px solid #222225; max-width: 600px; margin: 0 auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <!-- Header Logo -->
                <div style="font-size: 22px; font-weight: bold; letter-spacing: 5px; color: #FFFFFF; margin-bottom: 30px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px;">
                    PIXELVAULT <span style="color: #00E5FF;">2047</span>
                </div>
                
                <!-- Action Alert Title -->
                <div style="font-size: 12px; font-weight: bold; letter-spacing: 2px; color: ${accentColor}; text-transform: uppercase; margin-bottom: 25px; background: rgba(255, 255, 255, 0.02); display: inline-block; padding: 10px 20px; border: 1px solid ${accentColor}; border-radius: 4px;">
                    ${actionTitle}
                </div>
                
                <!-- Activity Grid Details -->
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; text-align: left; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05);">
                    <tbody>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 14px 20px; font-weight: bold; color: #666; font-size: 11px; width: 35%; text-transform: uppercase; letter-spacing: 1px;">Who (Kisne)</td>
                            <td style="padding: 14px 20px; color: #FFF; font-size: 13px;">
                                <strong>${name || 'Anonymous Visitor'}</strong><br>
                                <span style="color: #888; font-size: 11px;">${email || 'N/A'}</span>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 14px 20px; font-weight: bold; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">What (Kya)</td>
                            <td style="padding: 14px 20px; color: #FFF; font-size: 13px; line-height: 1.5;">
                                ${actionDetailsHTML}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 14px 20px; font-weight: bold; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">When (Kab)</td>
                            <td style="padding: 14px 20px; color: #00E5FF; font-size: 13px; font-weight: bold;">
                                ${formattedTime}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Footer -->
                <div style="font-size: 9px; color: #444; letter-spacing: 1px; margin-top: 30px; text-transform: uppercase; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                    Automated activity transmission • PixelVault Security Daemon
                </div>
            </div>
        `;

        let emailSent = false;
        let deliveryMethod = '';

        // Check if SMTP is configured
        if (smtpUser && smtpPass) {
            // Deliver using Nodemailer
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            await transporter.sendMail({
                from: `"PixelVault Alert" <${smtpUser}>`,
                to: toEmail,
                subject: subject,
                html: htmlBody
            });

            emailSent = true;
            deliveryMethod = 'SMTP (Nodemailer)';
        } else {
            // Zero-config fallback to FormSubmit.co using native HTTP request
            const postData = JSON.stringify({
                "Who (Kisne)": `${name || 'Anonymous Visitor'} (${email || 'N/A'})`,
                "What (Kya)": plainTextDetails.replace(/<[^>]*>/g, ''),
                "When (Kab)": formattedTime,
                _subject: subject,
                _template: 'table'
            });

            await new Promise((resolve, reject) => {
                const options = {
                    hostname: 'formsubmit.co',
                    port: 443,
                    path: `/ajax/${toEmail}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData),
                        'Accept': 'application/json'
                    }
                };

                const reqOptions = https.request(options, (resOptions) => {
                    let body = '';
                    resOptions.on('data', chunk => { body += chunk; });
                    resOptions.on('end', () => {
                        if (resOptions.statusCode >= 200 && resOptions.statusCode < 300) {
                            resolve();
                        } else {
                            reject(new Error(`FormSubmit returned status ${resOptions.statusCode}: ${body}`));
                        }
                    });
                });

                reqOptions.on('error', err => reject(err));
                reqOptions.write(postData);
                reqOptions.end();
            });

            emailSent = true;
            deliveryMethod = 'FormSubmit.co (Zero-Config Backend)';
        }

        return res.status(200).json({ 
            success: true, 
            message: `Email sent successfully using ${deliveryMethod}!`,
            details: {
                recipient: toEmail,
                method: deliveryMethod,
                timestamp: formattedTime
            }
        });

    } catch (error) {
        console.error('Mail sending error:', error);
        return res.status(500).json({ error: 'Failed to send email.', details: error.message });
    }
};
