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
      return res.status(400).json({ message: "There is no any service for this mail" });
    }

    return res.status(200).json(results);
  });
});

router.post("/add-service" , (req,res) => {
    // 1. בדיקה שהמשתמש מחובר
    if (!req.session || !req.session.user) { // בדיקה אם משתמש לא מחובר 
        return res.status(401).json({ message: 'User not logged in' });
    }

    const { serviceName , duration } = req.body;
    const query =
      "INSERT INTO services(service_name , duration) VALUES (? , ?)";

    db.query(query , [serviceName , duration] , (err , results) =>{
        if(err) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
        return res.status(200).json({ message: "השירות נוסף בהצלחה" });
    })
})

router.post("/remove-service", (req, res) => {
  // 1. בדיקה שהמשתמש מחובר
//   if (!req.session || !req.session.user) {
//     // בדיקה אם משתמש לא מחובר
//     return res.status(401).json({ message: "User not logged in" });
//   }

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

router.post("/price" , (req,res) =>{
    const {barberMail , serviceName} = req.body;
    const query =
      "SELECT price from appointments WHERE barber_mail_address = ? AND service_name = ?";
    db.query(query , [barberMail , serviceName] , (err,results) => {
        if(err)
            return res.status(500).json({ message: "Internal Server Error" });
        if (results.length === 0) {
          return res.status(400).json({ message: "Price not found for this service and barber"});
        }

        return res.status(200).json(results[0]);
    })
})

module.exports = router;
