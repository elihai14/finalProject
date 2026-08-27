/**
 * ============================================================================
 * מודול ניהול ימי ושעות פעילות 
 * ============================================================================
 * תפקיד המודול:
 * מודול זה אחראי על ניהול שעות הפעילות והפתיחה של המספרה/הטרקלין.
 * המודול מאפשר שליפת שעות פעילות עבור יום ספציפי, שליפת תרשים שעות הפעילות
 * השבועי המלא (ממוין לפי ימי השבוע ראשון-שבת), ועדכון שעות פתיחה וסגירה
 * על ידי מנהל המערכת.
 */

const express = require("express");
const router = express.Router();

const dbSingleton = require("../dbSingleton");

// קבלת חיבור יחיד (Singleton) למסד הנתונים
const db = dbSingleton.getConnection();

/**
 * שליפת פרטי שעות פעילות עבור יום ספציפי
 * POST /daysHours/get-day
 */
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

/**
 * שליפת שעות הפעילות של כל ימי השבוע (ממוין מיום ראשון עד שבת)
 * POST /daysHours/
 */
router.post("/", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  // השאילתה שולפת את שעות הפעילות וממיינת את הימים לפי הסדר שלהם בשבוע (מראשון עד שבת)
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

/**
 * עדכון שעות פתיחה וסגירה עבור יום מסוים
 * PUT /daysHours/update
 */
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
