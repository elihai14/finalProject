/**
 * ============================================================================
 * מודול ניהול תורים ואנליטיקה 
 * ============================================================================
 * תפקיד המודול:
 * מודול זה מרכז את כל הפעולות הקשורות לתורים במערכת:
 * 1. שליפת תורים לפי סינונים (לקוח, ספר, שירות, טווח תאריכים).
 * 2. הוספה, ביטול ושליפת פרטי תור לפי מזהה יחודי.
 * 3. בדיקת תורים קיימים למניעת חפיפות.
 * 4. הפקת נתונים ודוחות מנהל: סכום הכנסות, סך לקוחות, לקוחות חוזרים,
 *    ניתוח השעות העמוסות ביותר והימים העמוסים בשבוע.
 */

const express = require("express");
const router = express.Router();

const dbSingleton = require("../dbSingleton");

// קבלת חיבור יחיד (Singleton) למסד הנתונים
const db = dbSingleton.getConnection();

const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const currentTimeStr = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

/**
 * שליפת תורים פעילים לפי סינונים דינמיים (שם לקוח, מייל לקוח, שירות, ספר, טווח תאריכים)
 * POST /appointments/
 */
router.post("/", (req, res) => {
  let { user_name, clientMail, service, startDate, endDate, barber_mail } =
    req.body;

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
    } else {
      query += " AND appointment_date >= ? ";
      values.push(startDate);
    }
  }

  if (endDate) {
    query += " AND appointment_date <= ? ";
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
    } else {
      return res.status(200).json([]);
    }
  });
});

/**
 * הוספת תור חדש למערכת עבור לקוח מחובר
 * POST /appointments/add-appointment
 */
router.post("/add-appointment", (req, res) => {
  if (!req.session || !req.session.user) {
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

/**
 * שליפת תורים קיימים ופעילים ביום מסוים למניעת חפיפות (כולל משך זמן השירות)
 * POST /appointments/existing-apps
 */
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

/**
 * ביטול תור לפי מזהה ייחודי (Soft Delete - מעדכן is_cancel ל-1)
 * PUT /appointments/cancel/:id
 */
router.put("/cancel/:id", (req, res) => {
  const appId = req.params.id;
  const query = "UPDATE appointments SET is_cancel=1 WHERE appointment_id = ?";
  db.query(query, [appId], (err, result) => {
    if (err) return res.status(500).json({ message: "Internal server error" });
    if (result.affectedRows === 0)
      return res.status(404).json("appointment not found");
    return res.status(200).json({ message: "appointment deleted successfuly" });
  });
});

/**
 * דוח אנליטיקה: כמות לקוחות סך הכל וסך הכנסות בטווח תאריכים
 * POST /appointments/analytics
 */
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

/**
 * דוח אנליטיקה: כמות הלקוחות החוזרים (קבעו יותר מתור אחד) בטווח תאריכים
 * POST /appointments/analytics/repeat-customers
 */
router.post("/analytics/repeat-customers", (req, res) => {
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

/**
 * דוח אנליטיקה: התפלגות השעות העמוסות ביותר בטווח תאריכים
 * GET /appointments/busy-hours
 */
router.get("/busy-hours", (req, res) => {
  const hoursQuery = `SELECT MIN(start) as min_start, MAX(end) as max_end FROM dayshoursactivity WHERE start != '00:00:00'`;
  const { startDate, endDate } = req.query;

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

      res.status(200).json({
        min_start: hoursRes[0].min_start || "08:00:00",
        max_end: hoursRes[0].max_end || "18:00:00",
        appointments: apptsRes,
      });
    });
  });
});

/**
 * דוח אנליטיקה: ניתוח הימים העמוסים ביותר בשבוע בטווח תאריכים
 * GET /appointments/busy-days
 */
router.get("/busy-days", (req, res) => {
  const { startDate, endDate } = req.query;

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

/**
 * שליפת פרטי תור מסוים לפי מזהה ייחודי (ID)
 * GET /appointments/:id
 */
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM appointments WHERE appointment_id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(400).json({ message: "Internal Server Error" });
    if (results.length === 1) {
      return res.status(200).json(results);
    } else {
      return res.status(400).json({ message: "תור לא קיים" });
    }
  });
});

module.exports = router;
