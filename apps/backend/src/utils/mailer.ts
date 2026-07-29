import nodemailer from 'nodemailer';

// Create a transporter. For this mock/fallback, we'll configure it to use a real SMTP if env vars exist, 
// otherwise we'll just log the email to the console.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendApprovalEmail = async (toEmail: string, temporaryPassword?: string) => {
  const isMock = !process.env.SMTP_USER;
  
  const loginUrl = 'http://localhost:3001/login'; // Adjust to production URL when needed

  const mailOptions = {
    from: '"ZyncoBill Setup" <no-reply@zyncobill.com>',
    to: toEmail,
    subject: 'Welcome to ZyncoBill - Your Account is Ready!',
    text: `Your free trial request has been approved!
    
Login URL: ${loginUrl}
Email: ${toEmail}
${temporaryPassword ? `Password: ${temporaryPassword}` : ''}

Welcome aboard!
- The ZyncoBill Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #1e3a8a;">Your ZyncoBill Account is Ready!</h2>
        <p>Your free trial request has been approved.</p>
        <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Email:</strong> ${toEmail}</p>
        ${temporaryPassword ? `<p><strong>Password:</strong> ${temporaryPassword}</p>` : ''}
        <br/>
        <p>Welcome aboard!</p>
        <p>- The ZyncoBill Team</p>
      </div>
    `
  };

  if (isMock) {
    console.log('\n=======================================');
    console.log('--- MOCK EMAIL SENT (SMTP Not Configured) ---');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Body:', mailOptions.text);
    console.log('=======================================\n');
    return true;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
