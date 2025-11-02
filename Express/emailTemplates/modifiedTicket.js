
export const modifiedTicketTemplate = (userName, passengerName, oldSeat, newSeat, newPrice, total, tickets) => {
  const rowsHTML = tickets.map(t => {
    const isModified = t.seat_number === newSeat;
    return `
      <tr style="${isModified ? 'background:#f7f0ff;border-left:4px solid #6821ec;' : ''}">
        <td data-label="Asiento" style="${isModified ? 'font-weight:bold;color:#6821ec;' : ''}">
          ${t.seat_number}
        </td>
        <td data-label="Pasajero">${t.passenger_name}</td>
        <td data-label="Clase">${t.class_name}</td>
        <td data-label="Precio">
          Q ${Number(t.price_paid).toFixed(2)} ${isModified ? '<small>(modificado)</small>' : ''}
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>✈️ Modificación de Reserva - InfiniteFlights</title>

<style>
  body {
    font-family: 'Poppins', Arial, sans-serif;
    background: #f4f4f8;
    margin: 0;
    padding: 0;
    text-align: center;
  }

  .navbar, .footer {
    width: 100%;
    background: #280071;
    color: white;
    padding: 18px 0;
    font-size: 18px;
    font-weight: bold;
  }

  .navbar img {
    width: 35px;
    vertical-align: middle;
    margin-left: 40px;
    border-radius: 6px;
  }

  .navbar span {
    margin-left: 8px;
    vertical-align: middle;
  }

  .container {
    max-width: 700px;
    background: #ffffff;
    margin: 20px auto;
    padding: 25px 30px;
    border-radius: 14px;
  }

  h2 {
    color: #280071;
    font-size: 24px;
    margin-top: 0;
  }

  p {
    color: #333;
    font-size: 15px;
  }

  .box {
    background: #f8f5ff;
    border: 1px solid #e7ddff;
    border-radius: 10px;
    padding: 12px 14px;
    margin: 12px auto;
    display: inline-block;
    font-size: 15px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    font-size: 15px;
  }

  th {
    background: #6821ec;
    color: white;
    padding: 10px;
  }

  td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  .total-row td {
    font-weight: bold;
    background: #f4f4f8;
  }

  .footer {
    margin-top: 25px;
    text-align: center;
  }

  /* 📱 Diseño responsive en móvil: mostrar cada asiento como una card */
  @media (max-width: 600px) {
    .container {
      padding: 15px;
    }

    table, thead, tbody, th, td, tr {
      display: block !important;
    }

    thead tr {
      display: none !important;
    }

    tr {
      margin-bottom: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      background: #fafafa;
    }

    td {
      text-align: left !important;
      border: none !important;
      position: relative;
      padding-left: 45% !important;
      color: #222;
    }

    td::before {
      content: attr(data-label);
      position: absolute;
      left: 10px;
      top: 10px;
      width: 40%;
      font-weight: bold;
      color: #6821ec;
      font-size: 14px;
      text-transform: uppercase;
    }

    .total-row td {
      background: #eee !important;
      font-weight: bold;
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
  <h2>✈️ ¡Tu reserva fue modificada con éxito, ${userName || "cliente"}!</h2>
  <p>Tu asiento <b>${oldSeat}</b> fue cambiado a <b>${newSeat}</b> respetando la misma clase.</p>

  <div class="box">
    Se aplicó el recargo del <strong>10%</strong> por modificación.
  </div>

  <table>
    <thead>
      <tr>
        <th>Asiento</th>
        <th>Pasajero</th>
        <th>Clase</th>
        <th>Precio</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
      <tr class="total-row">
        <td colspan="3">Total actualizado</td>
        <td>Q ${total}</td>
      </tr>
    </tbody>
  </table>

  <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
  <p>Gracias por volar con InfiniteFlights 💜</p>
</div>

<div class="footer">
  © ${new Date().getFullYear()} InfiniteFlights ✈️
</div>

</body>
</html>
`;
};
