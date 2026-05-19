const express = require("express");
const router = express.Router();

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();

// מחזיר רשימת תורים של המשתמש שמחובר
router.post("/", (req, res) => {
  let { user_name, clientMail, service, startDate, endDate, barberMail } =
    req.body;
  let query =
    "SELECT appointments.*, u1.user_name AS barberName, u2.user_name AS customerName           FROM appointments LEFT JOIN users u1 ON appointments.barber_mail_address =                 u1.mail_address LEFT JOIN users u2 ON appointments.client_mail_address = u2.mail_address  WHERE appointments.is_cancel = 0";
  const values = [];
  if (clientMail) {
    query += " AND client_mail_address = ? ";
    values.push(clientMail);
  }
  if (user_name) {
    query += " AND u2.user_name LIKE ? ";
    values.push(`%${user_name}%`);
  }
  if (service) {
    query += " AND service_name = ? ";
    values.push(service);
  }
  if (startDate) {
    query += " AND appointment_date >= ? ";
    values.push(startDate);
  }
  if (endDate) {
    query += " AND appointment_date <= ? ";
    values.push(endDate);
  }
  if (barberMail) {
    query += " AND barber_mail_address = ? ";
    values.push(barberMail);
  }
  db.query(query, values, (err, results) => {
    if (err) return res.status(400).json({ message: "Internal Server Error" });
    if (results.length > 0) {
      return res.status(200).json(results);
    } // בסיס הנתונים החזיר 0 תוצאות
    else {
      return res.status(200).json([]);
    }
  });
});

// נתיב להוספת תור
router.post("/add-appointment", (req, res) => {
  console.log("innnnnnnnnnnn");
  
  // 1. בדיקה שהמשתמש מחובר
  if (!req.session || !req.session.user) {
    // בדיקה אם משתמש לא מחובר
    return res.status(401).json({ message: "User not logged in" });
  }

  console.log(req.body);
  
  const { constraintCode, barberMail, service, date, time, price } = req.body;
  const userMail = req.session.user.email;

  const insertQuery =
    "INSERT INTO appointments (appointment_time,appointment_date, constraint_code,service_name,client_mail_address,barber_mail_address,price,is_cancel) VALUES(?,?,?,?,?,?,?,?)";
  db.query(
    insertQuery,
    [time, date, constraintCode, service, userMail, barberMail, price,0],
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

/* ========================================================
   הזזנו את ראוטי האנליטיקה לכאן - מעל הראוט הדינמי של /:id
   ======================================================== */

// 1. ראוטר לגרפים החודשיים - משותף לספר ולמנהל (שונה ל-POST)
router.post("/analytics", (req, res) => {
  const { startDate, endDate } = req.body;
  const values = [];

  let query = `
    SELECT 
      MONTH(appointment_date) AS month_num, 
      COUNT(appointment_id) AS total_customers, 
      SUM(price) AS total_revenue 
    FROM appointments 
    WHERE YEAR(appointment_date) = 2026 
      AND is_cancel = 0 
      AND appointment_date <= NOW()`;

  // הוספת סינון דינמי לפי תאריכים אם נבחרו בדשבורד
  if (startDate) {
    query += " AND appointment_date >= ? ";
    values.push(startDate);
  }
  if (endDate) {
    query += " AND appointment_date <= ? ";
    values.push(endDate);
  }

  query += ` GROUP BY MONTH(appointment_date) ORDER BY month_num ASC`;

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });
    return res.status(200).json(results);
  });
});

// 2. ראוטר נפרד לחישוב אחוז הלקוחות החוזרים - רק למנהל (שונה ל-POST)
router.post("/analytics/repeat-customers", (req, res) => {
  const { startDate, endDate } = req.body;
  const values = [];

  // בניית תנאי התאריכים עבור תת-השאילתה הפנימית
  let dateConditions = "";
  if (startDate) {
    dateConditions += " AND appointment_date >= ? ";
    values.push(startDate);
  }
  if (endDate) {
    dateConditions += " AND appointment_date <= ? ";
    values.push(endDate);
  }

  const repeatCustomersQuery = `
    SELECT 
      COUNT(DISTINCT client_mail_address) AS total_unique, 
      COUNT(CASE WHEN appointment_count > 1 THEN 1 END) AS repeat_count 
    FROM (
      SELECT client_mail_address, COUNT(appointment_id) AS appointment_count 
      FROM appointments 
      WHERE is_cancel = 0 
        AND appointment_date < NOW()
        ${dateConditions} -- מוסיף את התאריכים ישירות לכאן
      GROUP BY client_mail_address
    ) AS customer_counts`;

  db.query(repeatCustomersQuery, values, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });

    const totalUnique = results[0].total_unique;
    const repeatCount = results[0].repeat_count;

    let repeatPercentage = 0;
    if (totalUnique > 0) {
      repeatPercentage = Math.round((repeatCount / totalUnique) * 100);
    }
    return res.status(200).json({ repeatPercentage: repeatPercentage });
  });
});
// נתיב לקבלת תור לפי ID (עכשיו הוא אחרון, אז הוא לא יבלע את המילה analytics)
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
