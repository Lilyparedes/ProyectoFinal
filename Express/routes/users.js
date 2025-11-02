import express from 'express';
import { pool } from '../database/db.js';
import bcrypt from 'bcrypt';
import { sendWelcomeEmail } from '../emailservice.js';

export const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailLower = email.toLowerCase();
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, emailLower, hashed]
    );

    await sendWelcomeEmail(emailLower, name);

    res.status(201).json({ message: 'Usuario creado con éxito y correo enviado 🎉' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase().trim();

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [emailLower]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    res.json({
      message: 'Inicio de sesión correcto ✅',
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
