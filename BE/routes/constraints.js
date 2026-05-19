const express = require("express");
const router = express.Router();

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  // 1. אבטחה: בדיקה שהמשתמש מחובר
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const status = req.session.user.status;
  if (status != "ספר" && status != "מנהל")
    return res.status(403).json({ message: "Not authorized" });

  const mail = req.session.user.mail_address;
  const query =
    "SELECT * FROM constraints WHERE mail_address = ? AND status = 'פעיל'";
  db.query(query, [mail], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    return res.status(200).json(results);
  });
});

router.post("/barbers-constraints", (req, res) => {
  // 1. אבטחה: בדיקה שהמשתמש מחובר
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const { bMail, date } = req.body;
  const query =
    "SELECT * FROM constraints WHERE mail_address = ? AND status = 'פעיל' AND `date` = ?";
  db.query(query, [bMail, date], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Error" });
    }

    return res.status(200).json(results);
  });
});

router.get("/range", (req, res) => {
  // 1. אבטחה: בדיקה שהמשתמש מחובר
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
      "SELECT * FROM constraints WHERE mail_address = ? AND date >= ? AND date <= ? AND status = 'פעיל' ORDER BY date ASC";
    queryParams = [mail, startDate, endDate];
  } else {
    query =
      "SELECT * FROM constraints WHERE mail_address = ? AND date >= ? AND status = 'פעיל' ORDER BY date ASC";
    queryParams = [mail, startDate];
  }
  db.query(query, queryParams, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    return res.status(200).json(results);
  });
});

router.post("/add-constraint", (req, res) => {
  // 1. אבטחה: בדיקה שהמשתמש מחובר
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const status = req.session.user.status;
  if (status != "ספר" && status != "מנהל")
    return res.status(403).json({ message: "Not authorized" });

  const mail = req.session.user.mail_address;
  const { date, start_time, end_time } = req.body;

  if (start_time >= end_time)
    return res
      .status(400)
      .json({ message: "שעת הסיום חייבת להיות אחרי שעת התחלה" });

  const checkQuery =
    "SELECT * FROM constraints WHERE mail_address = ? AND date = ? AND start_time < ? AND end_time > ? AND status = 'פעיל' ";

  db.query(checkQuery, [mail, date, end_time, start_time], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    if (results.length > 0) {
      return res
        .status(409)
        .json({ message: "כבר קיימות שעות עבודה חופפות בתאריך זה" });
    }

    const insertQuery =
      "INSERT INTO constraints (mail_address, date, start_time, end_time) VALUES (?, ?, ?, ?)";

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

router.put("/remove-constraint/:id", (req, res) => {
  // 1. אבטחה: בדיקה שהמשתמש מחובר
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const status = req.session.user.status;
  if (status != "ספר" && status != "מנהל")
    return res.status(403).json({ message: "Not authorized" });

  const mail = req.session.user.mail_address;
  const constraintCode = req.params.id;

  const query =
    "UPDATE constraints SET status = 'לא פעיל' WHERE constraint_code = ? AND mail_address = ?";

  db.query(query, [constraintCode, mail], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "האילוץ לא נמצא" });
    return res.status(200).json({ message: "האילוץ הוסר בהצלחה" });
  });
});

router.post("/get-code", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const { date, barberMail, time } = req.body;
  const query =
    "SELECT constraint_code FROM constraints WHERE date = ? AND mail_address = ? AND ? BETWEEN start_time AND end_time; ";
  db.query(query, [date, barberMail, time], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });
    if (results.length > 0) return res.status(200).json(results[0]);
    return res.status(404).json({ message: "Constraint Not Found" });
  });
});

module.exports = router;
