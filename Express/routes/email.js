import express from 'express';
import { transporter } from '../emailservice.js';
import { ticketEmailTemplate } from '../emailTemplates/ticketEmail.js';

export const router = express.Router();

router.post('/sendTicket', async (req, res) => {
  try {
    const { email, name, tickets, total, isVIP } = req.body;

    if (!email || !tickets) {
      return res.status(400).json({ message: "❌ Datos incompletos para enviar ticket" });
    }

    await transporter.sendMail({
      from: '"InfiniteFlights ✈️" <liliparedes198@gmail.com>',
      to: email,
      subject: `🎟 Tus boletos están listos ${isVIP ? "(VIP)" : ""} ✈️`,
      html: ticketEmailTemplate(name || "Pasajero", tickets, total, isVIP)
    });

    res.json({ message: "✅ Ticket enviado correctamente por correo!" });

  } catch (err) {
    console.error("❌ Error enviando ticket:", err);
    res.status(500).json({ message: "Error enviando correo" });
  }
});
