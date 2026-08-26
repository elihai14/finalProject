const express = require("express");
const router = express.Router();

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();
const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const currentTimeStr = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;
// מחזיר רשימת תורים של המשתמש שמחובר

// נתיב לשליפת תורים לפי סינון 
router.post("/", (req, res) => {
  let { user_name, clientMail, service, startDate, endDate, barber_mail } = req.body;

  let query =
    "SELECT appointments.*, u1.user_name AS barberName, u2.user_name AS customerName           FROM appointments LEFT JOIN users u1 ON appointments.barber_mail_address =                 u1.mail_address LEFT JOIN users u2 ON appointments.client_mail_address = u2.mail_address  WHERE appointments.is_cancel = 0";
  const values = [];
  if (clientMail) {
    query += " AND client_mail_address = ? ";
    values.push(clientMail);
  }
  if (user_name) {
    query +=
      " AND client_mail_address IN (SELECT mail_address FROM users WHERE user_name = ?) ";
    values.push(user_name);
  }
  if (service) {
    query += " AND service_name = ? ";
    values.push(service);
  }

  if (startDate) {
    if (startDate == todayStr) {
      query +=
        " AND (appointment_date > ? OR (appointment_date = ? AND appointment_time > ?)) ";
      values.push(startDate);
      values.push(startDate);
      values.push(currentTimeStr);
    }else
    {
      query +=
        " AND appointment_date >= ? ";
      values.push(startDate);
    }
  }

  if (endDate) {
    query += " AND appointment_date <= ? ";
    // const nextDay = new Date(endDate);
    // nextDay.setDate(nextDay.getDate() + 1);
    // values.push(nextDay.toISOString().slice(0, 10));
    values.push(endDate);
  }

  if (barber_mail) {
    query += " AND appointments.barber_mail_address = ? ";
    values.push(barber_mail);
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
    [time, date, constraintCode, service, userMail, barberMail, price, 0],
    (err, result) => {
      if (err) return res.status(500).json({ message: "שגיאה בהוספת התור" });

      return res.status(200).json({ message: "התור נוסף בהצלחה" });
    },
  );
});

// נתיב לשליפת כל התורים הקיימים והפעילים 
router.post("/existing-apps", (req, res) => {
  const { date, barberMail, clientMail } = req.body;

  const appQuery = `
    SELECT 
      a.appointment_time,
      s.duration
    FROM appointments a
    JOIN barber_services s
      ON a.service_name = s.service_name
    WHERE a.appointment_date = ?
      AND (a.barber_mail_address = ?
            OR a.client_mail_address=?)
      AND a.is_cancel = 0
    ORDER BY a.appointment_time ASC
  `;

  db.query(appQuery, [date, barberMail, clientMail], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: "Internal Server Error",
      });
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

// נתיב המחזיר את כמות הלקוחות וסכום הכנסות בטווח תאריכים 
router.post("/analytics", (req, res) => {
  const { startDate, endDate } = req.body;

  let query = `
    SELECT 
      COUNT(appointment_id) AS total_customers, 
      SUM(price) AS total_revenue 
    FROM appointments 
    WHERE  appointment_date >= ?
      AND appointment_date <= ?
      AND is_cancel = 0 
      AND appointment_date <= NOW()`;

  db.query(query, [startDate, endDate], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });
    return res.status(200).json(results);
  });
});

// נתיב המחזיר את כמות הלקוחות החוזרים בטווח תאריכים מסוים
router.post("/analytics/repeat-customers", (req, res) => {
  // אם לא נשלחו תאריכים, נשים תאריכי ברירת מחדל קיצוניים (למשל משנת 1970 ועד היום)
  const startDate = req.body.startDate || "1970-01-01";
  const endDate = req.body.endDate || new Date().toISOString().split("T")[0];

  const query = `
    SELECT COUNT(*) AS repeatCount 
    FROM (
      SELECT client_mail_address 
      FROM appointments 
      WHERE is_cancel = 0 
        AND appointment_date < NOW()
        AND appointment_date >= ? 
        AND appointment_date <= ?
      GROUP BY client_mail_address
      HAVING COUNT(appointment_id) > 1
    ) AS repeat_customers`;

  db.query(query, [startDate, endDate], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });

    return res.status(200).json({ repeatCount: results[0].repeatCount });
  });
});

// נתיב המחזיר מערך הכולל את השעות הכי עמוסות בטווח תאריכים מסוים
router.get("/busy-hours", (req, res) => {
  // שאילתה שמביאה רק את שעות הפעילות
  const hoursQuery = `SELECT MIN(start) as min_start, MAX(end) as max_end FROM dayshoursactivity WHERE start != '00:00:00'`;
  const { startDate, endDate } = req.query;
  // שאילתה שמביאה את כמות התורים לכל שעה
  const appointmentsQuery = `
    SELECT HOUR(appointment_time) as hour, COUNT(*) as total 
    FROM appointments 
    WHERE appointment_date >= ?
      AND appointment_date <= ?
      AND is_cancel = 0 
    GROUP BY HOUR(appointment_time)
    ORDER BY total
  `;

  db.query(hoursQuery, (err, hoursRes) => {
    if (err) return res.status(500).json({ error: "Database error hours" });

    db.query(appointmentsQuery, [startDate, endDate], (err, apptsRes) => {
      if (err)
        return res.status(500).json({ error: "Database error appointments" });

      // איחוד התוצאות
      res.status(200).json({
        min_start: hoursRes[0].min_start || "08:00:00",
        max_end: hoursRes[0].max_end || "18:00:00",
        appointments: apptsRes,
      });
    });
  });
});

// נתיב המחזיר את שלושת הימים הכי עמוסים במספרה בטווח תאריכים מסוים
router.get("/busy-days", (req, res) => {
  const { startDate, endDate } = req.query;

  // השאילתה המדויקת לפי ה-dayshoursactivity
  const query = `
    SELECT 
        d.day as day_name, 
        COUNT(a.appointment_id) as total_appointments
    FROM dayshoursactivity d
    LEFT JOIN appointments a ON 
        (
          (DAYNAME(a.appointment_date) = 'Sunday' AND d.day = 'ראשון') OR
          (DAYNAME(a.appointment_date) = 'Monday' AND d.day = 'שני') OR
          (DAYNAME(a.appointment_date) = 'Tuesday' AND d.day = 'שלישי') OR
          (DAYNAME(a.appointment_date) = 'Wednesday' AND d.day = 'רביעי') OR
          (DAYNAME(a.appointment_date) = 'Thursday' AND d.day = 'חמישי') OR
          (DAYNAME(a.appointment_date) = 'Friday' AND d.day = 'שישי') OR
          (DAYNAME(a.appointment_date) = 'Saturday' AND d.day = 'שבת')
        )
        AND appointment_date >= ?
        AND appointment_date <= ?
        AND a.is_cancel = 0
    WHERE d.start != '00:00:00' 
      AND d.end != '00:00:00'
    GROUP BY d.day
    ORDER BY FIELD(d.day, 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת') ASC
  `;

  db.query(query, [startDate, endDate], (err, results) => {
    if (err) {
      console.error("SQL Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// נתיב לשליפת פרטי תור לפי מזהה יחודי של התור 
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
