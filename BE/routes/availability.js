/**
 * ============================================================================
 * מודול ניהול זמינות ואילוצי עבודה לספרים 
 * ============================================================================
 * תפקיד המודול:
 * מודול זה מנהל את משמרות העבודה, הזמינות והאילוצים של הספרים במערכת.
 * המודול מאפשר לספרים ומנהלים לשלוף את ימי ושעות העבודה, להוסיף אילוצי עבודה
 * חדשים, לבטל משמרות, ולשלוף מזהה זמינות לפי תאריך ושעה.
 */

const express = require("express");
const router = express.Router();

const dbSingleton = require("../dbSingleton");

// קבלת חיבור יחיד למסד הנתונים
const db = dbSingleton.getConnection();

/**
 * שליפת ימי העבודה והזמינות הפעילים של ספר מחובר 
 * GET /availability/
 */
router.get("/", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }
  const { startDate, endDate } = req.query;

  const status = req.session.user.status;
  console.log(status);

  if (status != "ספר" && status != "מנהל")
    return res.status(403).json({ message: "Not authorized" });

  let values = [];
  const mail = req.session.user.email;
  values.push(mail);

  let query =
    "SELECT * FROM availability WHERE mail_address = ? AND status = 'פעיל'";

  // סינון לפי תאריך התחלה או כברירת מחדל מהיום והלאה
  if (startDate) {
    query += " AND date >= ?";
    values.push(startDate);
  } else {
    const date = new Date();

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const today = `${yyyy}-${mm}-${dd}`;
    query += " AND date >= ?";
    values.push(today);
  }

  // סינון לפי תאריך סיום במידה ונשלח
  if (endDate) {
    query += " AND date <= ?";
    values.push(endDate);
  }

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    return res.status(200).json(results);
  });
});

/**
 * שליפת שעות העבודה והזמינות של ספר בתאריך ספציפי
 * POST /availability/barbers-constraints
 */
router.post("/barbers-constraints", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const { bMail, date } = req.body;
  const query =
    "SELECT * FROM availability WHERE mail_address = ? AND status = 'פעיל' AND `date` = ?";

  db.query(query, [bMail, date], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Error" });
    }

    return res.status(200).json(results);
  });
});

/**
 * שליפת פרטי ימי ושעות העבודה של ספר בטווח תאריכים 
 * GET /availability/range
 */
router.get("/range", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const status = req.session.user.status;
  if (status != "ספר" && status != "מנהל")
    return res.status(403).json({ message: "Not authorized" });

  const mail = req.session.user.mail_address;
  const { startDate, endDate } = req.query;

  if (!startDate)
    return res.status(400).json({ message: "חובה לציין תאריך התחלה " });

  let query;
  let queryParams;

  if (endDate) {
    query =
      "SELECT * FROM availability WHERE mail_address = ? AND date >= ? AND date <= ? AND status = 'פעיל' ORDER BY date ASC";
    queryParams = [mail, startDate, endDate];
  } else {
    query =
      "SELECT * FROM availability WHERE mail_address = ? AND date >= ? AND status = 'פעיל' ORDER BY date ASC";
    queryParams = [mail, startDate];
  }

  db.query(query, queryParams, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    return res.status(200).json(results);
  });
});

/**
 * הוספת שעות עבודה חדשות עבור ספר (כולל בדיקת תקינות זמנים וחפיפות)
 * POST /availability/add-constraint
 */
router.post("/add-constraint", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const status = req.session.user.status;
  if (status != "ספר" && status != "מנהל")
    return res.status(403).json({ message: "Not authorized" });

  const mail = req.session.user.email;
  const { date, start_time, end_time } = req.body;

  if (start_time >= end_time)
    return res
      .status(400)
      .json({ message: "שעת הסיום חייבת להיות אחרי שעת התחלה" });

  // בדיקת חפיפה מול שעות עבודה קיימות של אותו ספר
  const checkQuery =
    "SELECT * FROM availability WHERE mail_address = ? AND date = ? AND start_time < ? AND end_time > ? AND status = 'פעיל' ";

  db.query(checkQuery, [mail, date, end_time, start_time], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    if (results.length > 0) {
      return res
        .status(409)
        .json({ message: "כבר קיימות שעות עבודה חופפות בתאריך זה" });
    }

    const insertQuery =
      "INSERT INTO availability (mail_address, date, start_time, end_time) VALUES (?, ?, ?, ?)";

    db.query(
      insertQuery,
      [mail, date, start_time, end_time],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Internal Error" });

        return res.status(201).json({ message: "האילוץ נוסף בהצלחה" });
      },
    );
  });
});

/**
 * ביטול משמרת של ספר וביטול של התורים שנקבעו באותן שעות
 * PUT /availability/remove-constraint/:id
 */
router.put("/remove-constraint/:id", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const status = req.session.user.status;
  if (status != "ספר" && status != "מנהל")
    return res.status(403).json({ message: "Not authorized" });

  const mail = req.session.user.email;
  const constraintCode = parseInt(req.params.id, 10);

  // שליפת הזמינות המקורית כדי לדעת אילו תורים יש לבטל במקביל
  const getAvailabilityQuery =
    "SELECT * FROM availability WHERE constraint_code = ? AND mail_address = ?";

  db.query(
    getAvailabilityQuery,
    [constraintCode, mail],
    (err, availResults) => {
      if (err) return res.status(500).json({ message: "Internal Error" });

      if (availResults.length === 0)
        return res.status(404).json({ message: "הזמינות לא נמצאה" });

      const targetDate = availResults[0].date;
      const startTime = availResults[0].start_time;
      const endTime = availResults[0].end_time;

      // עדכון סטטוס הזמינות ל'לא פעיל'
      const updateQuery =
        "UPDATE availability SET status = 'לא פעיל' WHERE constraint_code = ? AND mail_address = ?";

      db.query(updateQuery, [constraintCode, mail], (err, updateResults) => {
        if (err) return res.status(500).json({ message: "Internal Error" });

        // ביטול אוטומטי של כל התורים של הספר שנופלים בחלון הזמן שבוטל
        const cancelAppointmentsQuery = `
        UPDATE appointments 
        SET is_cancel = 1
        WHERE barber_mail_address = ? 
          AND appointment_date = ? 
          AND appointment_time >= ? 
          AND appointment_time <= ?
      `;

        db.query(
          cancelAppointmentsQuery,
          [mail, targetDate, startTime, endTime],
          (err, cancelResults) => {
            if (err) return res.status(500).json({ message: "Internal Error" });

            return res.status(200).json({
              message: "הזמינות בוטלה בהצלחה והתורים התואמים בוטלו",
            });
          },
        );
      });
    },
  );
});

/**
 * שליפת שעות הפעילות של המספרה ממוינות לפי ימי השבוע
 * GET /availability/days-activity
 */
router.get("/days-activity", (req, res) => {
  const query =
    "SELECT * FROM dayshoursactivity ORDER BY FIELD(day, 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת')";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    return res.status(200).json(results);
  });
});

/**
 * עדכון שעות הפעילות של המספרה עבור יום ספציפי (מנהל בלבד)
 * PUT /availability/update-day/:day
 */
router.put("/update-day/:day", (req, res) => {
  if (req.session.user.status !== "מנהל")
    return res.status(403).json({ message: "Not authorized" });

  const { day } = req.params;
  const { start, end } = req.body;

  const query = "UPDATE dayshoursactivity SET start = ?, end = ? WHERE day = ?";

  db.query(query, [start, end, day], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });
    if (results.affectedRows > 0)
      return res.status(200).json({ message: `יום ${day} עודכן בהצלחה!` });
    return res.status(404).json({ message: "היום לא נמצא" });
  });
});

/**
 * שליפת קוד זמינות עבור ספר בתאריך ושעה מסוימים
 * POST /availability/get-code
 */
router.post("/get-code", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const { date, barberMail, time } = req.body;
  const query =
    "SELECT constraint_code FROM availability WHERE date = ? AND mail_address = ? AND ? BETWEEN start_time AND end_time; ";
  db.query(query, [date, barberMail, time], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });
    if (results.length > 0) return res.status(200).json(results[0]);
    return res.status(404).json({ message: "availability Not Found" });
  });
});

module.exports = router;
