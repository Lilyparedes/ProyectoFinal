import express from 'express';
import { pool } from '../database/db.js';

export const router = express.Router();

// Obtener todos los asientos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
  SELECT 
    s.id, 
    s.seat_number, 
    s.is_available,
    c.slug,
    CASE 
      WHEN c.slug = 'business' THEN 'Business'
      WHEN c.slug = 'economy' THEN 'Economy'
      ELSE 'Unknown'
    END AS class_name
  FROM public.seats s
  JOIN public.seat_classes c ON c.id = s.seat_class_id
  ORDER BY class_name, s.seat_number;
`);


    res.json(result.rows);

  } catch (err) {
    console.error('❌ Error cargando asientos:', err.message); //  IMPRIME ERROR DE BD
    return res.status(500).json({ error: err.message });
  }
});
