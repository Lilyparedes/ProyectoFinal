

---

#  Flight Seat Reservation System

## Website Description

**Flight Seat Reservation System** is a full-stack web application that allows users to register, reserve airplane seats, modify or cancel reservations, and automatically receive digital tickets by email.

The system supports two seat classes (**Business** and **Economy**) and offers features such as **CUI validation**, real-time seat availability, **VIP discounts**, and automatic ticket delivery through **Nodemailer**.

Its purpose is to automate the airline reservation process, providing an intuitive interface, secure validations, and efficient management of seats and passengers.

---

## Technologies Used

| Layer             | Technology                                                |
| ----------------- | --------------------------------------------------------- |
| **Frontend**      | Angular 17 (HTML, CSS, TypeScript, Standalone Components) |
| **Backend**       | Node.js + Express.js                                      |
| **Database**      | PostgreSQL                                                |
| **Email Service** | Nodemailer                                                |
| **Security**      | bcryptjs (password hashing)                               |

---

##  Project Installation and Setup

### 1 Prerequisites

* Node.js (v18 or higher)
* PostgreSQL (v14 or higher)
* Angular CLI (v17 or higher)
* npm (installed with Node)

---

### 2 Create the Project Folder

```bash
mkdir FlightSeatReservationSystem
cd FlightSeatReservationSystem
```

---

### 3 Initialize the Backend with Express

```bash
mkdir backend
cd backend
npm init -y
npm install express pg cors nodemailer dotenv bcryptjs
npm install --save-dev nodemon
```

Folder structure:

```
backend/
 ├── index.js
 ├── routes/
 ├── database/
 ├── email/
 └── .env
```

---

### 4 Configure the Database

Inside PostgreSQL:

```sql
CREATE DATABASE reservas_db;
\c reservas_db
```

Then execute the following schema:

```sql
-- USERS
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150),
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_vip BOOLEAN DEFAULT FALSE,
  total_reservations INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEAT CLASSES
CREATE TABLE seat_classes (
  id serial PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10,2) NOT NULL
);

-- SEATS
CREATE TABLE seats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seat_number VARCHAR(10) UNIQUE NOT NULL,
  seat_class_id INTEGER REFERENCES seat_classes(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RESERVATIONS
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  seat_id uuid REFERENCES seats(id) ON DELETE CASCADE,
  passenger_name VARCHAR(200) NOT NULL,
  cui VARCHAR(20) NOT NULL,
  has_luggage BOOLEAN DEFAULT FALSE,
  price_paid NUMERIC(10,2) NOT NULL,
  modified_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique index to ensure one active reservation per seat
CREATE UNIQUE INDEX ux_seat_one_active ON reservations(seat_id) WHERE status = 'active';
```

---

### 5 Create the Frontend with Angular

From the project root:

```bash
ng new frontend
cd frontend
npm install bootstrap @angular/forms @angular/router
```

Add Bootstrap in `angular.json`:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

---

### 6 Run the Application

**Backend**

```bash
cd backend
npm run dev
```

**Frontend**

```bash
cd frontend
ng serve -o
```

---

##  How to Use the Application (Step-by-Step Guide)

The system is designed to be **intuitive, validated, and secure**.
Below is the full usage flow—from registration to cancellation.

---

### 1 Home / Login Page

When opening the application (`http://localhost:4200`), the user sees the **login form**.

**Available options:**

* Enter email + password if already registered.
* Click **“Register”** to create a new account.

**Validations:**

* Only `@gmail.com` or `@outlook.com` emails are allowed.
* Passwords must be at least 6 characters long.
* If credentials are incorrect, an error modal appears.

Once logged in successfully, the session is saved in `localStorage`, and the system automatically redirects to the **Home Dashboard**.

---

### 2 User Registration

The registration form asks for:

* Full Name
* Email Address
* Password

Upon successful registration:

* The email is validated to ensure it is unique.
* A styled HTML **welcome email** is sent automatically.
* The user is redirected back to the login page.

---

### 3 Seat Reservation Screen

After logging in, the user accesses the **seat map**, where they can:

* View seat availability (green = available, red = occupied).
* Choose between **Business Class** and **Economy Class**.
* Select a seat manually or allow the system to assign one randomly.

**Reservation Form:**

* Passenger Name
* CUI (validated using the official Guatemalan RENAP algorithm)
* Luggage Option (yes / no)

**Prices:**

* Business → Q1550
* Economy → Q750

If the user already has **5 reservations or more**, the system marks them as **VIP** and applies a **10 % discount** on new bookings.

When the reservation is confirmed:

* The selected seat is marked as occupied in the database.
* A confirmation email is sent including the passenger’s ticket.
* A success modal appears on screen.

---

### 4 Modify Reservation

In the **Modify** tab, users can change their seat by entering:

* CUI
* Current Seat Number
* New Seat Number

**Rules:**

* The new seat must belong to the same class.
* A **10 % extra charge** is applied.
* If the new seat is already taken, an error modal appears.

Once confirmed:

* The database is updated.
* The old seat is released.
* A new confirmation email is sent with the updated details.

---

### 5 Cancel Reservation

In the **Cancel** tab, the user provides:

* CUI
* Seat Number

The system validates that:

* The CUI exists.
* The seat belongs to that passenger.
* The reservation is not already canceled.

After confirmation:

* The reservation status becomes `canceled`.
* The seat is made available again.
* A cancellation email is automatically sent.

---

### 6 VIP Users

When a user reaches **five active or completed reservations**, the system:

* Updates `is_vip = true` in the `users` table.
* Displays a VIP banner or badge in the UI.
* Automatically applies a **10 % discount** to future bookings.

---

### 7 Statistics

The **Statistics** section shows:

* Total reservations per user
* Random vs manual selections
* Modified and canceled reservations
* Global counts of users and reservations

These values are obtained through grouped SQL queries on the backend.

---

### 8 XML Import / Export

In the **XML** section:

* **Export** → generates an XML file with all reservations.
* **Import** → uploads an XML file and saves valid records.

The system then displays:

* How many rows were successfully loaded.
* The total processing time in milliseconds.

---

### 9 Automatic Emails

Different HTML emails are sent automatically:

* **Successful Registration** (welcome message)
* **Reservation Confirmation** (with ticket)
* **Modified Reservation** (updated details)
* **Cancellation Confirmation**

All emails are generated using **Nodemailer** and custom HTML templates.

---

###  10. System Security

* Passwords are securely hashed using **bcryptjs**.
* CUI validation runs on both frontend and backend.
* Prevents booking of already-occupied seats.
* Automatically clears canceled seat reservations.

---


**Lilian Nineth Paredes Dávila**
Universidad Mesoamericana – Software Engineering
Course: *Web Programming (2S2025)*
 `liliparedes198@gmail.com`

---
