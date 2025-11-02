import express from 'express';
import { pool } from '../database/db.js';

export const router = express.Router();

/* 📊 Estadísticas por usuario */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.userId;
    const stats = {};

    // 🔹 1. Total de reservas (cada grupo de reserva cuenta como una)
    const totalRes = await pool.query(`
      SELECT COUNT(DISTINCT reservation_group) AS total_reservations
      FROM reservations
      WHERE user_id = $1
        AND status IS DISTINCT FROM 'canceled';
    `, [userId]);
    stats.total = Number(totalRes.rows[0].total_reservations);

    // 🔹 2. Asientos seleccionados de forma aleatoria
    const randomSeats = await pool.query(`
      SELECT COUNT(*) FROM reservations
      WHERE selection_type = 'random'
        AND user_id = $1;
    `, [userId]);
    stats.random = Number(randomSeats.rows[0].count);

    // 🔹 3. Asientos seleccionados manualmente
    const manualSeats = await pool.query(`
      SELECT COUNT(*) FROM reservations
      WHERE selection_type = 'manual'
        AND user_id = $1;
    `, [userId]);
    stats.manual = Number(manualSeats.rows[0].count);

    // 🔹 4. Asientos modificados (sumatoria de cambios)
    const modifiedSeats = await pool.query(`
      SELECT SUM(modified_count) FROM reservations
      WHERE user_id = $1;
    `, [userId]);
    stats.modified = Number(modifiedSeats.rows[0].sum || 0);

    // 🔹 5. Asientos cancelados
    const canceledSeats = await pool.query(`
      SELECT COUNT(*) FROM reservations
      WHERE status = 'canceled'
        AND user_id = $1;
    `, [userId]);
    stats.canceled = Number(canceledSeats.rows[0].count);

    // 🔹 6. Total de asientos ocupados (activos)
    const activeSeats = await pool.query(`
      SELECT COUNT(*) FROM reservations
      WHERE user_id = $1
        AND status = 'active';
    `, [userId]);
    stats.active = Number(activeSeats.rows[0].count);

    res.json(stats);

  } catch (err) {
    console.error('❌ Error en /stats:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* 🌎 Estadísticas globales */
router.get('/global', async (req, res) => {
  try {
    const users = await pool.query(`SELECT COUNT(*) FROM users`);
    const reservations = await pool.query(`SELECT COUNT(*) FROM reservations`);

    res.json({
      totalUsers: Number(users.rows[0].count),
      totalReservations: Number(reservations.rows[0].count)
    });
  } catch (err) {
    console.error('❌ Error en /global:', err.message);
    res.status(500).json({ error: err.message });
  }
});
