const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  // Check if email credentials are provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('-----------------------------------------');
    console.log('EMAIL SIMULATION (No credentials found):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body:', options.html.replace(/<[^>]*>/g, ' '));
    console.log('-----------------------------------------');
    return; // Do not throw, just simulate
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const message = {
    from: `${process.env.EMAIL_FROM_NAME || 'EduCafe'} <${process.env.EMAIL_FROM || 'noreply@educafe.com'}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  }

  try {
    await transporter.sendMail(message)
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Nodemailer Error:', error)
    // In development, we don't want to crash everything if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Email failed but continuing in development mode.');
      return;
    }
    throw error
  }
}

module.exports = sendEmail
