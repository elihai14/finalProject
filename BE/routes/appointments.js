const express = require("express");
const router = express.Router();

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();

// מחזיר רשימת תורים של המשתמש שמחובר
router.post("/", (req, res) => {
  let { clientMail, service, startDate, endDate, barberMail } = req.body;
  let query = "SELECT * FROM appointments WHERE 1=1 ";
  const values = [];
  if (clientMail) {
    query += "AND client_mail_address = ? ";
    values.push(clientMail);
  }
  if (service) {
    query += "AND service_name = ? ";
    values.push(service);
  }
  if (startDate) {
    query += "AND appointment_date >= ? ";
    values.push(startDate);
  }
  if (endDate) {
    query += "AND appointment_date <= ? ";
    values.push(endDate);
  }
  if (barberMail) {
    query += "AND barber_mail_address = ? ";
    values.push(barberMail);
  }
  db.query(query, values, (err, results) => {
    if (err) return res.status(400).json({ message: "Internal Server Error" });
    if (results.length > 0) {
      return res.status(200).json(results);
    } // בסיס הנתונים החזיר 0 תוצאות
    else {
      return res.status(400).json({ message: "אין תורים עדיין" });
    }
  });
});

// נתיב להוספת תור
router.post("/add-Appointment", (req, res) => {
  // 1. בדיקה שהמשתמש מחובר
  if (!req.session || !req.session.user) {
    // בדיקה אם משתמש לא מחובר
    return res.status(401).json({ message: "User not logged in" });
  }

  const { constraintCode, barberMail, service, date, time, price } = req.body;
  const userMail = req.session.user.email;

  const insertQuery =
    "INSERT INTO appointments (appointment_time,appointment_date, constraint_code,service_name,client_mail_address,barber_mail_address,price) VALUES(?,?,?,?,?,?,?)";
  db.query(
    insertQuery,
    [time, date, constraintCode, service, userMail, barberMail, price],
    (err, result) => {
      if (err) return res.status(500).json({ message: "שגיאה בהוספת התור" });

      return res.status(200).json({ message: "התור נוסף בהצלחה" });
    }
  );
});

// נתיב המחזיר את השעות הפנויות לפי תאריך ושירות מבוקשים
router.post("/existing-apps", (req, res) => {
  const { date } = req.body;
  const appQuery =
    "SELECT a.appointment_time , s.duration FROM appointments a join barber_services s ON a.service_name = s.service_name WHERE a.appointment_date = ? ORDER BY a.appointment_time ASC";

  db.query(appQuery, [date], (err, results) => {
    // שאילתה לקבלת שעת תור ומשך זמן שירות לכל תור בתאריך המבוקש
    if (err) {
      return res.status(400).json({ message: "Internal Server Error" });
    }

    return res.status(200).json(results);
  });
});

// נתיב למחיקת תור
router.put("/cancel/:id", (req, res) => {
  const appId = req.params.id;
  const query = "UPDATE appointments SET is_cancel=1 WHERE appointment_id = ?";
  db.query(query, [appId], (err, result) => {
    // שאילתה שמוחקת תור לפי ID של תור מבוקש
    if (err) return res.status(500).json({ message: "Internal server error" });
    if (result.affectedRows === 0)
      return res.status(404).json("appointment not found"); //בדיקה אם לא בוצע שינוי
    return res.status(200).json({ message: "appointment deleted successfuly" });
  });
});

// נתיב לקבלת תור לפי ID
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM appointments WHERE appointment_id = ?";
  db.query(query, [id], (err, results) => {
    // שאילתה לקבלת תור לפי ID של תור מבוקש
    if (err) return res.status(400).json({ message: "Internal Server Error" });
    if (results.length === 1) {
      // בדיקה אם חזרה תוצאה אחת
      return res.status(200).json(results);
    } else {
      return res.status(400).json({ message: "תור לא קיים" });
    }
  });
});

module.exports = router;
