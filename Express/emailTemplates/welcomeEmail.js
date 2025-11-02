export const welcomeEmailTemplate = (name) => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Bienvenido a InfiniteFlights</title>

<style>
  body {
    font-family: 'Poppins', Arial, sans-serif;
    background-color: #f4f4f8;
    margin: 0;
    padding: 0;
    text-align: center;
  }

  /*  Navbar y footer iguales */
  .navbar, .footer {
    width: 100%;
    background: #280071;
    color: white;
    padding: 18px 0;
    font-size: 18px;
    font-weight: bold;
  }

    .footer {
    text-align: center;
  }

  .navbar {
    text-align: left;}


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
    max-width: 650px;
    background: #ffffff;
    margin: 0 auto;
    padding: 30px;
  }

  h1 {
    color: #280071;
    font-size: 27px;
    margin-bottom: 10px;
  }

  p {
    color: #444;
    font-size: 16px;
    line-height: 1.6;
  }

  .btn {
    display: inline-block;
    padding: 14px 32px;
    background: #6821ec;
    color: white !important;
    text-decoration: none;
    font-size: 16px;
    margin-top: 25px;
    border-radius: 8px;
    font-weight: bold;
  }

  .btn:hover {
    background: #5718c0;
  }

</style>

</head>
<body>

<div class="navbar">
  <img src="https://i.ibb.co/zTxxyqMt/logo1.png" alt="Logo InfiniteFlights">
  <span>InfiniteFlights</span>
</div>

<div class="container">

  <h1>¡Bienvenido a InfiniteFlights, ${name}! ✈️</h1>

  <p>Tu cuenta fue creada exitosamente </p>
  <p>Ya puedes iniciar sesión y reservar tu asiento </p>

  <a href="http://localhost:4200/login" class="btn">Iniciar Sesión Ahora </a>

</div>

<!--  Footer ahora igual al navbar -->
<div class="footer">
  © ${new Date().getFullYear()} InfiniteFlights ✈️
</div>

</body>
</html>
`;
