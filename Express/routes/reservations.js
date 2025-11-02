import express from 'express';
import { pool } from '../database/db.js';
import { transporter } from '../emailservice.js';
import { modifiedTicketTemplate } from '../emailTemplates/modifiedTicket.js';
import { canceledTicketTemplate } from '../emailTemplates/canceledticket.js';
import { create } from 'xmlbuilder2'; 
import multer from 'multer';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const router = express.Router();

/* Crear reserva */
router.post('/', async (req, res) => {
  try {
    const { user_id, seat_id, passenger_name, cui, has_luggage, price_paid, selection_type, reservation_group } = req.body;

    // Verificar que el asiento esté disponible
    const seat = await pool.query(`SELECT is_available FROM seats WHERE id=$1`, [seat_id]);
    if (!seat.rows[0].is_available) {
      return res.status(400).json({ message: 'El asiento ya está ocupado' });
    }

    // Si no viene un grupo, generarlo
    const groupId = reservation_group || uuidv4();

    // Contar reservas únicas (por grupo)
    const countGroups = await pool.query(`
      SELECT COUNT(DISTINCT reservation_group)
      FROM reservations
      WHERE user_id = $1 AND status IS DISTINCT FROM 'canceled'
    `, [user_id]);

    const previousGroups = Number(countGroups.rows[0].count);
    const isVIP = previousGroups >= 5;
    const finalPrice = isVIP ? (price_paid * 0.9).toFixed(2) : price_paid;

    // Registrar reserva
    const result = await pool.query(`
      INSERT INTO reservations 
      (user_id, seat_id, passenger_name, cui, has_luggage, price_paid, selection_type, reservation_group)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [user_id, seat_id, passenger_name, cui, has_luggage, finalPrice, selection_type, groupId]);

    await pool.query(`UPDATE seats SET is_available=false WHERE id=$1`, [seat_id]);

    res.status(201).json({
      message: isVIP
        ? '🎉 Reserva creada con descuento VIP ✅'
        : 'Reserva creada ✅',
      reservation: result.rows[0],
      appliedDiscount: isVIP
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


router.put('/modify', async (req, res) => {
  try {
    const { cui, oldSeatNumber, newSeatNumber } = req.body;

    // 🔹 Buscar la reserva original
    const query = await pool.query(`
      SELECT r.id, r.reservation_group, r.price_paid, r.user_id, r.passenger_name,
             u.email, u.name,
             c.slug AS class_slug
      FROM reservations r
      JOIN seats s ON s.id = r.seat_id
      JOIN seat_classes c ON c.id = s.seat_class_id
      JOIN users u ON u.id = r.user_id
      WHERE r.cui = $1 AND s.seat_number = $2 AND r.status IS DISTINCT FROM 'canceled'
    `, [cui, oldSeatNumber]);

    if (query.rowCount === 0)
      return res.status(404).json({ message: '❌ No se encontró reserva con esos datos' });

    const { id, reservation_group, price_paid, class_slug, email, name, passenger_name, user_id } = query.rows[0];

    // 🔹 Validar nuevo asiento
    const newSeatQuery = await pool.query(`
      SELECT s.id, s.seat_number, s.is_available, c.slug AS class_slug
      FROM seats s
      JOIN seat_classes c ON c.id = s.seat_class_id
      WHERE s.seat_number = $1
    `, [newSeatNumber]);

    if (newSeatQuery.rowCount === 0)
      return res.status(404).json({ message: '❌ El asiento nuevo no existe' });

    const newSeat = newSeatQuery.rows[0];

    if (!newSeat.is_available)
      return res.status(400).json({ message: '❌ El asiento nuevo ya está ocupado' });

    if (newSeat.class_slug !== class_slug)
      return res.status(400).json({ message: '⚠ Debe ser de la misma clase' });

    // 🔹 Calcular nuevo precio (+10%)
    // 🔹 Asegurar que el cambio NO aplique descuento VIP
// (El descuento VIP solo se aplica en reservas nuevas, nunca al modificar)

let basePrice = Number(price_paid);

// Si el precio pagado tenía descuento VIP (por ejemplo 10%), lo revertimos
// Supongamos que un VIP pagó 0.9 del precio original → recuperamos el 100%
const userQuery = await pool.query(`SELECT is_vip FROM users WHERE id = $1`, [user_id]);
const isVip = userQuery.rows[0]?.is_vip || false;

if (isVip) {
  // Revertir el descuento para trabajar sobre el precio base original
  basePrice = basePrice / 0.9; 
}

// Ahora sí aplicamos el recargo del 10 % por modificación
const newPrice = Number(basePrice * 1.10).toFixed(2);


    // 🔹 Actualizar la reserva modificada
    await pool.query(`
      UPDATE reservations
      SET seat_id=$1, price_paid=$2, modified_count = modified_count + 1
      WHERE id = $3
    `, [newSeat.id, newPrice, id]);

    // 🔹 Actualizar disponibilidad de asientos
    await pool.query(`UPDATE seats SET is_available=true WHERE seat_number=$1`, [oldSeatNumber]);
    await pool.query(`UPDATE seats SET is_available=false WHERE seat_number=$1`, [newSeatNumber]);

    // 🔹 Obtener TODAS las reservas del mismo grupo
    const groupQuery = await pool.query(`
      SELECT s.seat_number, r.passenger_name, c.name AS class_name, r.price_paid
      FROM reservations r
      JOIN seats s ON s.id = r.seat_id
      JOIN seat_classes c ON c.id = s.seat_class_id
      WHERE r.reservation_group = $1
    `, [reservation_group]);

    const tickets = groupQuery.rows;
    const total = tickets.reduce((acc, t) => acc + Number(t.price_paid), 0).toFixed(2);

    // 🔹 Enviar correo actualizado (mostrar todos los asientos)
    await transporter.sendMail({
      from: '"InfiniteFlights ✈️" <liliparedes198@gmail.com>',
      to: email,
      subject: '✈️ ¡Tu reserva fue modificada!',
      html: modifiedTicketTemplate(
        name,
        passenger_name,
        oldSeatNumber,
        newSeatNumber,
        newPrice,
        total,
        tickets // pasa todos los asientos
      )
    });

    res.json({
      message: " Modificación realizada y correo enviado",
      newPrice,
      total,
      seats: tickets.length
    });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


/* Cancelar reserva por CUI + Asiento (envía todo el grupo) */
router.put('/cancel', async (req, res) => {
  try {
    const { cui, seatNumber } = req.body;

    // 1. Buscar la reserva exacta que quieren cancelar
    const current = await pool.query(`
      SELECT 
        r.id,
        r.user_id,
        r.passenger_name,
        r.reservation_group,
        u.email,
        u.name
      FROM reservations r
      JOIN seats s ON s.id = r.seat_id
      JOIN users u ON u.id = r.user_id
      WHERE r.cui = $1
        AND s.seat_number = $2
        AND r.status IS DISTINCT FROM 'canceled'
    `, [cui, seatNumber]);

    if (current.rowCount === 0) {
      return res.status(400).json({ message: '❌ Datos no coinciden o la reserva ya estaba cancelada.' });
    }

    const {
      id: reservationId,
      user_id,
      passenger_name,
      reservation_group,
      email,
      name
    } = current.rows[0];

    // 2. Cancelar SOLO este asiento
    await pool.query(`UPDATE reservations SET status = 'canceled' WHERE id = $1`, [reservationId]);
    await pool.query(`UPDATE seats SET is_available = true WHERE seat_number = $1`, [seatNumber]);

    // 3. Traer TODA la reserva del grupo (activos y cancelados) para mostrar en el correo
    const groupRes = await pool.query(`
      SELECT 
        r.id,
        r.passenger_name,
        r.status,
        r.price_paid,
        r.cui,
        s.seat_number,
        sc.slug AS class_name
      FROM reservations r
      JOIN seats s ON s.id = r.seat_id
      JOIN seat_classes sc ON sc.id = s.seat_class_id
      WHERE r.user_id = $1
        AND r.reservation_group = $2
      ORDER BY r.created_at ASC
    `, [user_id, reservation_group]);

    const tickets = groupRes.rows.map(r => ({
      seat_number: r.seat_number,
      passenger_name: r.passenger_name,
      class_name: r.class_name,
      price_paid: Number(r.price_paid),
      status: r.status
    }));

    // 4. Recalcular total SOLO de los que siguen activos
    const activeTotal = tickets
      .filter(t => t.status !== 'canceled')
      .reduce((acc, t) => acc + t.price_paid, 0)
      .toFixed(2);

    // 5. Enviar correo con TODO el grupo y resaltando el cancelado
    await transporter.sendMail({
      from: '"InfiniteFlights ✈️" <liliparedes198@gmail.com>',
      to: email,
      subject: '⚠️ ¡Un asiento de tu reserva fue cancelado!',
      html: canceledTicketTemplate(
        name,
        passenger_name,
        seatNumber,
        activeTotal,
        tickets   
      )
    });

    res.json({
      message: '✅ Reserva cancelada y correo enviado',
      total_activo: activeTotal,
      asientos_en_grupo: tickets.length
    });

  } catch (err) {
    console.error('❌ ERROR en cancelación:', err);
    res.status(500).json({ message: err.message });
  }
});




/* Exportar reservas a XML sin errores */
router.get('/export/xml', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(r.passenger_name, 'Desconocido') AS passenger_name,
        COALESCE(r.cui, 'N/A') AS cui,
        COALESCE(r.has_luggage, false) AS has_luggage,
        COALESCE(r.created_at, NOW()) AS created_at,
        COALESCE(s.seat_number, 'Sin número') AS seat_number,
        COALESCE(u.email, 'Sin correo') AS user_email
      FROM reservations r
      JOIN seats s ON s.id = r.seat_id
      JOIN users u ON u.id = r.user_id
      WHERE r.status IS DISTINCT FROM 'canceled'
      ORDER BY r.created_at DESC;
    `);

    //  Crea un solo documento raíz
    const root = create({ version: '1.0' }).ele('flightReservation');

    result.rows.forEach(r => {
      const seat = root.ele('flightSeat');
      seat.ele('seatNumber').txt(r.seat_number);
      seat.ele('passengerName').txt(r.passenger_name);
      seat.ele('user').txt(r.user_email);
      seat.ele('idNumber').txt(r.cui);
      seat.ele('hasLuggage').txt(r.has_luggage.toString());
      seat.ele('reservationDate').txt(new Date(r.created_at).toLocaleString());
    });

    const xml = root.end({ prettyPrint: true });

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="reservas.xml"');
    res.send(xml);

  } catch (err) {
    console.error('❌ Error generando XML:', err.message);
    res.status(500).send('Error generando XML');
  }
});

/* Importar XML (con manejo de usuarios duplicados y grupos) */
const upload = multer({ dest: 'uploads/' });

router.post('/import/xml', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  let success = 0;
  let errors = 0;
  const reservationGroup = uuidv4();

  try {
    const fileData = fs.readFileSync(req.file.path, 'utf8');
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonData = parser.parse(fileData);

    const seats = jsonData.flightReservation?.flightSeat;
    if (!seats || seats.length === 0) {
      return res.status(400).json({ message: '⚠️ El archivo XML no contiene reservas válidas.' });
    }

    const flightSeats = Array.isArray(seats) ? seats : [seats];

    for (const seat of flightSeats) {
      try {
        const seatNumber = seat.seatNumber?.trim()?.toUpperCase();
        const email = seat.user?.trim()?.toLowerCase();
        const passengerName = seat.passengerName?.trim() || 'Usuario XML';
        const cui = String(seat.idNumber ?? '').trim();
        const hasLuggage = String(seat.hasLuggage).toLowerCase() === 'true';

        if (!seatNumber || !email) throw new Error('Datos incompletos en el asiento.');

        // Buscar o crear usuario
        let userResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
        if (userResult.rowCount === 0) {
          const defaultPassword = await bcrypt.hash('xml123', 10);
          try {
            const newUser = await pool.query(
              `INSERT INTO users (name, email, password_hash, is_vip, total_reservations)
               VALUES ($1, $2, $3, false, 0)
               RETURNING id`,
              [passengerName, email, defaultPassword]
            );
            userResult = newUser;
            console.log(`🆕 Usuario creado automáticamente: ${email}`);
          } catch (err) {
            if (err.code === '23505') {
              console.log(`ℹ Usuario ${email} ya existía, usando su ID existente`);
              userResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
            } else {
              throw err;
            }
          }
        }

        // Buscar asiento
        const seatResult = await pool.query(`SELECT id FROM seats WHERE seat_number = $1`, [seatNumber]);
        if (seatResult.rowCount === 0) throw new Error(`El asiento ${seatNumber} no existe.`);

        const seatId = seatResult.rows[0].id;

        // Verificar si ya está reservado
        const reserved = await pool.query(
          `SELECT id FROM reservations WHERE seat_id = $1 AND status = 'active'`,
          [seatId]
        );
        if (reserved.rowCount > 0) throw new Error(`El asiento ${seatNumber} ya está reservado.`);

        // Insertar reserva
        await pool.query(`
          INSERT INTO reservations 
          (user_id, seat_id, passenger_name, cui, has_luggage, price_paid, selection_type, reservation_group)
          VALUES ($1, $2, $3, $4, $5, $6, 'manual', $7)
        `, [
          userResult.rows[0].id,
          seatId,
          passengerName,
          cui,
          hasLuggage,
          750,
          reservationGroup
        ]);

        await pool.query(`UPDATE seats SET is_available = false WHERE id = $1`, [seatId]);

        console.log(`✅ Asiento ${seatNumber} reservado correctamente para ${passengerName}`);
        success++;

      } catch (err) {
        console.error(`❌ Error en asiento ${seat.seatNumber}: ${err.message}`);
        errors++;
      }
    }

    const totalTime = Date.now() - startTime;

    res.json({
      title: '📦 Carga completada',
      message: `✅ ${success} asientos cargados correctamente.<br>❌ ${errors} con errores.<br>⏱️ Tiempo total: ${totalTime} ms.`,
      cargados: success,
      errores: errors,
      tiempo: `${totalTime} ms`
    });

  } catch (err) {
    console.error('🚨 Error general en importación:', err.message);
    res.status(500).json({ error: 'Error al procesar el archivo XML.' });
  } finally {
    if (req.file?.path) fs.unlinkSync(req.file.path);
  }
});