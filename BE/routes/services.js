const express = require("express");
const router = express.Router();

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();

router.post("/", (req, res) => {
  const { barberMail } = req.body;

  const query =
    "SELECT service_name , price FROM barber_services WHERE mail_address = ?";
  db.query(query, [barberMail], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "There is no any service for this mail" });
    }

    return res.status(200).json(results);
  });
});

router.post("/barber/add-service", (req, res) => {
    // 1. אבטחה: בדיקה שהמשתמש מחובר
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "User not logged in" });
    }

  const { serviceName, price, duration } = req.body;
  const barberMail = req.session.user.mail_address;

  const checkBarberQuery =
    "SELECT * FROM barber_services WHERE mail_address = ? AND service_name = ?";

  db.query(checkBarberQuery, [barberMail, serviceName], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "השירות כבר קיים בתפריט שלך" });
    }

  const insertBarberServices ="INSERT INTO barber_services (mail_address, service_name, price,  duration) VALUES (?, ?, ?, ?)";

    db.query(insertBarberServices,[barberMail, serviceName, price, duration],(err) => {
      if (err)
        return res.status(500).json({ message: "Error linking service" });

        return res.status(200).json({ message: "השירות נוסף בהצלחה למספרה שלך" });
      },
    );
  });
});


router.post("/admin/add-service", (req, res) => {
  // 1. אבטחה: בדיקה שהמשתמש מחובר
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }
  const { serviceName } = req.body;

  const barberMail = req.session.user.mail_address;

  const checkQuery = "SELECT * FROM services WHERE service_name = ?";

  db.query(checkQuery, [serviceName], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "השירות כבר קיים בקטלוג המערכת" });
    }

    const insertQuery =
      "INSERT INTO services (service_name, status_service) VALUES (?, 1)";

    db.query(insertQuery, [serviceName], (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error adding to global services" });

      return res.status(200).json({ message: "השירות נוסף למערכת בהצלחה" });
    });
  });
});

router.post("/remove-service", (req, res) => {
  // בדיקה שהמשתמש מחובר
  if (!req.session || !req.session.user) {
    // בדיקה אם משתמש לא מחובר
    return res.status(401).json({ message: "User not logged in" });
  }

  const { serviceName } = req.body;
  const query = "UPDATE services SET status_service = 0 WHERE service_name = ?";

  db.query(query, [serviceName], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "שירות לא נמצא" });
    }

    return res.status(200).json({ message: "השירות הוסר בהצלחה" });
  });
});

router.put("/update-service" , (req, res) => {
  // בדיקה שהמשתמש מחובר
  if (!req.session || !req.session.user) {
  // בדיקה אם משתמש לא מחובר
    return res.status(401).json({ message: "User not logged in" });
  }
  const barberMail = req.session.user.mail_address; 

  const { serviceName, newPrice, newDuration } = req.body;
  const query =
    "UPDATE barber_services SET price = ? , duration = ? WHERE service_name = ?                 AND mail_address = ?";

  db.query(query, [newPrice, newDuration,serviceName, barberMail] , (err,results) =>{
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: `השירות ${serviceName} לא חלק מהשירותים שלך` });
    }

    return res.status(200).json({ message: "השירות עודכן בהצלחה" });
  });
});

router.post("/price", (req, res) => {
  const { barberMail, serviceName } = req.body;
  const query =
    "SELECT price from appointments WHERE barber_mail_address = ? AND service_name = ?";
  db.query(query, [barberMail, serviceName], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });
    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Price not found for this service and barber" });
    }

    return res.status(200).json(results[0]);
  });
});

module.exports = router;