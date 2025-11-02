import nodemailer from 'nodemailer';
import { welcomeEmailTemplate } from './emailTemplates/welcomeEmail.js';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'liliparedes198@gmail.com',
    pass: 'wnva gazt bygb axzm'
  }
});

export const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: '"InfiniteFlights ✈️" <liliparedes198@gmail.com>',
    to,
    subject: '¡Bienvenido a InfiniteFlights! ✈️',
    html: welcomeEmailTemplate(name)
  };

  return transporter.sendMail(mailOptions);
};
