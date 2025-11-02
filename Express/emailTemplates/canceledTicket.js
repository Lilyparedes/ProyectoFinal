
export const canceledTicketTemplate = (userName, passengerCanceled, seatCanceled, newTotal, tickets) => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reserva cancelada - InfiniteFlights</title>
<style>
  body {
    font-family: 'Poppins', Arial, sans-serif;
    background:#f4f4f8;
    margin:0;
    padding:0;
    text-align:center;
  }
  .navbar, .footer {
    width:100%;
    background:#280071;
    color:#fff;
    padding:18px 0;
    font-size:18px;
    font-weight:bold;
  }
  .navbar img { width:35px; vertical-align:middle; margin-left:40px; border-radius:6px; }
  .navbar span { margin-left:8px; vertical-align:middle; }
  .container {
    max-width:700px;
    background:#fff;
    margin:20px auto;
    padding:25px 30px;
    border-radius:14px;
  }
  h2 { color:#d42c2c; margin-top:0; }
  p { color:#333; }

  table {
    width:100%;
    border-collapse:collapse;
    margin-top:15px;
    font-size:15px;
  }
  th {
    background:#6821ec;
    color:#fff;
    padding:10px;
  }
  td {
    padding:10px;
    border-bottom:1px solid #ddd;
  }
  .canceled-row {
    background:#ffe9e9;
    border-left:4px solid #d42c2c;
  }
  .total-row td {
    font-weight:bold;
    background:#f4f4f8;
  }
  .footer {
    margin-top:25px;
    text-align:center;
  }

  /* 📱 Responsive: cards con label */
  @media (max-width: 600px) {
    .container { padding:15px; }
    table, thead, tbody, th, td, tr { display:block !important; }
    thead tr { display:none !important; }
    tr {
      margin-bottom:15px;
      border:1px solid #ddd;
      border-radius:8px;
      padding:10px;
      background:#fafafa;
    }
    td {
      text-align:left !important;
      border:none !important;
      position:relative;
      padding-left:45% !important;
    }
    td::before {
      content: attr(data-label);
      position:absolute;
      left:10px;
      top:10px;
      width:40%;
      font-weight:bold;
      color:#6821ec;
      text-transform:uppercase;
      font-size:12px;
    }
    .total-row td {
      background:#eee !important;
      font-weight:bold;
    }
  }
</style>
</head>
<body>

<div class="navbar">
  <img src="https://i.ibb.co/zTxxyqMt/logo1.png" alt="InfiniteFlights Logo">
  <span>InfiniteFlights</span>
</div>

<div class="container">
  <h2>⚠️ Se canceló un asiento de tu reserva</h2>
  <p>Hola ${userName || 'cliente'}, el asiento <strong>${seatCanceled}</strong> a nombre de <strong>${passengerCanceled}</strong> fue cancelado.</p>
  <p>Este es el estado actual de tu reserva:</p>

  <table>
    <thead>
      <tr>
        <th>Asiento</th>
        <th>Pasajero</th>
        <th>Clase</th>
        <th>Precio</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      ${tickets.map(t => {
        const isCanceled = t.status === 'canceled';
        return `
          <tr class="${isCanceled ? 'canceled-row' : ''}">
            <td data-label="Asiento">${t.seat_number}</td>
            <td data-label="Pasajero">${t.passenger_name}</td>
            <td data-label="Clase">${t.class_name}</td>
            <td data-label="Precio">Q ${Number(t.price_paid).toFixed(2)}</td>
            <td data-label="Estado" style="font-weight:600; color:${isCanceled ? '#d42c2c' : '#008000'}">
              ${isCanceled ? 'Cancelado' : 'Activo'}
            </td>
          </tr>
        `;
      }).join('')}
      <tr class="total-row">
        <td colspan="4">Total vigente</td>
        <td>Q ${newTotal}</td>
      </tr>
    </tbody>
  </table>

  <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
  <p>Si no fuiste tú quien hizo la cancelación, contáctanos.</p>
  <p>Gracias por volar con InfiniteFlights!!</p>
  <p>infinite@flights.com.gt </p>
</div>

<div class="footer">
  © ${new Date().getFullYear()} InfiniteFlights ✈️
</div>

</body>
</html>
`;

