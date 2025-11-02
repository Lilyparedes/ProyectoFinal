export const ticketEmailTemplate = (userName, tickets, total, isVIP) => {

  const rowsHTML = tickets.map(t => {
    const originalPrice = t.price_paid;
    const vipPrice = isVIP ? (originalPrice * 0.9).toFixed(2) : originalPrice.toFixed(2);

    return `
      <tr>
        <td>${t.seat_number}</td>
        <td>${t.passenger_name}</td>
        <td>${t.class_name}</td>
        <td style="color: ${isVIP ? '#008000' : '#000'}">
          Q ${vipPrice} ${isVIP ? "<small>(VIP)</small>" : ""}
        </td>
      </tr>
    `;
  }).join('');

  const originalTotal = tickets.reduce((acc, t) => acc + t.price_paid, 0);
  const vipTotal = (originalTotal * 0.9).toFixed(2);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reserva Confirmada - InfiniteFlights</title>

<style>
  body {
    font-family: 'Poppins', Arial, sans-serif;
    background-color: #f4f4f8;
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
    width:35px;
    vertical-align:middle;
    margin-left:40px;
    border-radius:6px;
  }

  .navbar span {
    margin-left:8px;
    vertical-align:middle;
  }

  .container {
    max-width: 700px;
    background: #ffffff;
    margin: 20px auto;
    padding: 25px 30px;
    border-radius: 14px;
  }

  /* 🌸 Hace que la tabla sea adaptable */
  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    width: 100%;
    margin-top: 15px;
    border-collapse: collapse;
    font-size: 15px;
    min-width: 400px;
  }

  th {
    background: #6821ec;
    color: white;
    padding: 10px;
    text-align: center;
  }

  td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    text-align: center;
  }

  .total-row td {
    font-weight: bold;
    background: #f4f4f8;
  }

  .vip-label {
    background: gold;
    color: black;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 14px;
    display: inline-block;
    margin-top: 10px;
  }

  .footer {
    margin-top: 25px;
    text-align: center;
  }

  /* 🌿 Modo “cards” en pantallas pequeñas */
  @media (max-width: 600px) {
  .container {
    padding: 15px;
  }

  table, thead, tbody, th, td, tr {
    display: block !important;
    width: 100% !important;
  }

  thead {
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
    position: relative !important;
    padding-left: 48% !important;
    font-size: 15px !important;
    color: #222 !important;
  }

  td::before {
    content: attr(data-label) " ";
    position: absolute !important;
    left: 10px !important;
    top: 10px !important;
    width: 45% !important;
    font-weight: bold !important;
    color: #6821ec !important;     
    font-size: 14px !important;
    text-transform: uppercase !important;
  }

  .total-row td {
    background: #eee !important;
    font-weight: bold !important;
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
  <h2>🎟️ ¡Tu reserva está confirmada, ${userName || "Pasajero"}!</h2>
  <p>Gracias por viajar con InfiniteFlights ✈️</p>

  ${isVIP ? `<p class="vip-label">✓ Usuario VIP — 10% descuento aplicado</p>` : ""}

  <div class="table-wrapper">
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
        ${tickets.map(t => {
          const originalPrice = t.price_paid;
          const vipPrice = isVIP ? (originalPrice * 0.9).toFixed(2) : originalPrice.toFixed(2);
          return `
            <tr>
              <td data-label="Asiento">${t.seat_number}</td>
              <td data-label="Pasajero">${t.passenger_name}</td>
              <td data-label="Clase">${t.class_name}</td>
              <td data-label="Precio" style="color:${isVIP ? '#008000' : '#000'}">
                Q ${vipPrice} ${isVIP ? "<small>(VIP)</small>" : ""}
              </td>
            </tr>`;
        }).join('')}
        <tr class="total-row">
          <td colspan="3">Total pagado</td>
          <td>Q ${isVIP ? vipTotal : originalTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
</div>

<div class="footer">
  © ${new Date().getFullYear()} InfiniteFlights ✈️
</div>

</body>
</html>
`;
};
