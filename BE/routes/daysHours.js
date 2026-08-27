const express = require("express");
const router = express.Router();

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();

// נתיב המחזיר פרטי היום מטבלת ימי פעילות המספרה
router.post("/get-day", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  const { day } = req.body;
  const query = "SELECT * FROM dayshoursactivity WHERE day = ?";

  db.query(query, [day], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(404).json({ message: "day not found" });
    }
  });
});

// נתיב המחזיר פרטי כל הימים מטבלת ימי פעילות המספרה
router.post("/", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  const query = `SELECT day, 
  TIME_FORMAT(start, '%H:%i') AS start, 
  TIME_FORMAT(end, '%H:%i') AS end 
  FROM dayshoursactivity 
  ORDER BY CASE day
    WHEN 'ראשון' THEN 1
    WHEN 'שני' THEN 2
    WHEN 'שלישי' THEN 3
    WHEN 'רביעי' THEN 4
    WHEN 'חמישי' THEN 5
    WHEN 'שישי' THEN 6
    WHEN 'שבת' THEN 7 
    END`;

  db.query(query, [], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(404).json({ message: "" });
    }
  });
});

router.put("/update", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  const { day, newStart, newEnd } = req.body;
  let query = "UPDATE dayshoursactivity SET start = ?, end = ? where day=? ";

  db.query(query, [newStart, newEnd, day], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "תקלה בעדכון הפרטים",
      });
    }

    return res.status(200).json({
      message: "עודכן בהצלחה",
    });
  });
});

module.exports = router;
