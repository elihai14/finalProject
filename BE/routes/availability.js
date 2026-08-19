const express = require("express");
const router = express.Router();

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();


// ראוטר מחזיר את פרטי כל ימי העבודה של ספר 
router.get("/", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }
  const {startDate, endDate} = req.query;

  const status = req.session.user.status;
  console.log(status);
  
  if (status != "ספר" && status != "מנהל")
    return res.status(403).json({ message: "Not authorized" });
  let values = [];
  const mail = req.session.user.email;
  values.push(mail)
  let query =
    "SELECT * FROM availability WHERE mail_address = ? AND status = 'פעיל'";
  if(startDate)
  {
    query += " AND date >= ?"
    values.push(startDate);
  }
  else 
  {
        const date = new Date();

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        const today = `${yyyy}-${mm}-${dd}`;
        query += " AND date >= ?";
        values.push(today);
  }

  if (endDate)
  {
      query += " AND date <= ?";
      values.push(endDate);

  }
  db.query(query, values , (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    return res.status(200).json(results);
  });
});

// מחזיר את שעות העבודה של ספר בתאריך מסוים 
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

// נתיב המחזיר את פרטי ימי ושעות העבודה של ספר בטווח תאריכים מסוים
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

// נתיב להוספת יום ושעות עבודה עבור ספר 
router.post("/add-constraint", (req, res) => {
  // 1. אבטחה: בדיקה שהמשתמש מחובר
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
      }
    );
  });
});

// נתיב למחיקת זמני עבודה של ספר 
router.put("/remove-constraint/:id", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const status = req.session.user.status;
  if (status != "ספר" && status != "מנהל")
    return res.status(403).json({ message: "Not authorized" });

  const mail = req.session.user.email;
  const constraintCode = parseInt(req.params.id, 10);

  const getAvailabilityQuery =
    "SELECT * FROM availability WHERE constraint_code = ? AND mail_address = ?";

  db.query(getAvailabilityQuery, [constraintCode, mail], (err, availResults) => {
      if (err) return res.status(500).json({ message: "Internal Error" });

      if (availResults.length === 0)
        return res.status(404).json({ message: "הזמינות לא נמצאה" });

      const targetDate = availResults[0].date;
      const startTime = availResults[0].start_time;
      const endTime = availResults[0].end_time;

      const updateQuery = "UPDATE availability SET status = 'לא פעיל' WHERE constraint_code = ? AND mail_address = ?";

      db.query(updateQuery, [constraintCode, mail], (err, updateResults) => {
        if (err) return res.status(500).json({ message: "Internal Error" });

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

            return res.status(200)
            .json({ message: "הזמינות בוטלה בהצלחה והתורים התואמים בוטלו" });
          },
        );
      });
    },
  );
});


router.get("/days-activity", (req, res) => {
  const query =
    "SELECT * FROM dayshoursactivity ORDER BY FIELD(day, 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת')";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    return res.status(200).json(results);
  });
});

// נתיב לעדכון שעות פעילות המספרה ביום מסוים
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

// נתיב לשליפת קוד זמינות עבודה של ספר בטווח תאריכים 
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
