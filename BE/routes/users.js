const express = require("express");
const router = express.Router();
const session = require("express-session");

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();




//נתיב התחברות לאתר
router.post("/login", (req, res) => {
  const { mail} = req.body;

  const query = "SELECT * FROM users WHERE mail_address = ?";
  db.query(query, [mail], (err, results) => {
    //מחזיר את המשתמשים בעלי אותו שם
    if (err) return res.status(400).json({ message: "Internal Server Error" });
    if (results.length > 0) //בדיקה אם משתמש קיים
    {
        return res.status(400).json({ message: "User Exists" });

      
    } else //משתמש לא קיים
    {
      return res.status(400).json({ message: "User Not Exists" });
          

    }
  });
});

//נתיב להתנתקות המשתמש מהמערכת
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    //משמיד את הsession ומנתק את המשתמש
    if (err) {
      return res.status(500).send("logout failed");
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "התנתקות בוצעה בהצלחה" });
  });
});

module.exports = router;
