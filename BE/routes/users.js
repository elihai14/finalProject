const express = require("express");
const router = express.Router();

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();

router.post("/", (req, res) => {
  const { status, isReverse } = req.body;
  let query = "SELECT * FROM users ";
  let values = [];

  // כאן השינוי: אם ביקשו 'ספר', נחזיר את כל מי שמוגדר כספר או כמנהל
  if (status === "ספר") {
    query += " WHERE status IN ('ספר', 'מנהל')";
  } else if (status === "לקוח" || status === "מנהל") {
    query += " WHERE status = ?";
    values.push(status);
  }

  query += " ORDER BY user_name";
  if (isReverse) query += " DESC";
  else query += " ASC";

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });
    if (results.length > 0) return res.status(200).json(results);
    else return res.status(404).json({ message: "User not found" });
  });
});


router.post("/current", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  const mail = req.session.user.email;
  const query = "SELECT * FROM users WHERE mail_address = ?";

  db.query(query, [mail], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });
});

router.post("/get-status", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  const mail = req.session.user.email;
  const query = "SELECT status FROM users WHERE mail_address = ?";

  db.query(query, [mail], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });
});

router.post("/register", (req, res) => {
  const { fullName, phoneNumber, mailAddress } = req.body;
  
  if (phoneNumber) {
    if (!/^\d{10}$/.test(phoneNumber) || !phoneNumber.startsWith("05")) {
      return res.status(400).json({ message: "מספר טלפון לא תקין" });
    }
  }

  if (!fullName || !phoneNumber || !mailAddress) {
    return res.status(400).json({ message: "נא למלא את כל השדות" });
  }

  const checkQuery = "SELECT * FROM users WHERE mail_address = ?";

  db.query(checkQuery, [mailAddress], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "המשתמש כבר קיים במערכת" });
    }

    const insertQuery =
      "INSERT INTO users (user_name, phone_number, mail_address, status) VALUES (?, ?, ?, 'לקוח')";

    db.query(
      insertQuery,
      [fullName, phoneNumber, mailAddress],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "שגיאה בתהליך ההרשמה, נסה שוב" });
        }

        return res
          .status(201)
          .json({ message: "נרשמת בהצלחה! כעת ניתן להתחבר" });
      },
    );
  });
});

router.post("/login", (req, res) => {
  const { mailAddress } = req.body;
  const { otpCodes, transporter } = req.app.locals; // שליפת הכלים מה-app.js

  const query = "SELECT * FROM users WHERE mail_address = ?";

  db.query(query, [mailAddress], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      // 1. המשתמש קיים - מייצרים קוד רנדומלי
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

      // 2. שומרים את הקוד בזיכרון השרת (כדי שנוכל לבדוק אותו ב-verify)
      otpCodes[mailAddress] = otpCode;

      // 3. הגדרת תוכן המייל
      const mailOptions = {
        from: "your-email@gmail.com",
        to: mailAddress,
        subject: "קוד אימות להתחברות",
        text: `שלום, קוד האימות שלך הוא: ${otpCode}`,
      };

      try {
        // 4. שליחה בפועל
        await transporter.sendMail(mailOptions);
        console.log(`OTP ${otpCode} sent to ${mailAddress}`);
        return res.status(200).json({ message: "הקוד נשלח לכתובת המייל" });
      } catch (mailErr) {
        console.error("Mail Error:", mailErr);
        return res.status(500).json({ message: "שגיאה בשליחת המייל" });
      }
    } else {
      return res.status(400).json({ message: "משתמש לא קיים" });
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


router.post("/verify-otp", (req, res) => {
  const { mailAddress, code } = req.body;
  const { otpCodes } = req.app.locals;

  if (otpCodes[mailAddress] && otpCodes[mailAddress] === code) {
    delete otpCodes[mailAddress];

    // כאן אנחנו מוציאים את המשתמש מהדאטהבייס כדי לדעת מה הסטטוס שלו
    const query =
      "SELECT status, mail_address FROM users WHERE mail_address = ?";
    db.query(query, [mailAddress], (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ message: "User data not found" });
      }

      const user = results[0];
      req.session.user = { email: user.mail_address, status: user.status };

      // שולחים לריאקט את הסטטוס!
      return res.status(200).json({
        message: "Authentication successful",
        status: results[0].status,
      });
    });
  } else {
    return res.status(401).json({ message: "Invalid code" });
  }
});

router.get("/:status", (req, res) => {
  const status = req.params.status;
  const query = "SELECT * FROM users WHERE status = ?";
  db.query(query, [status], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res
        .status(404)
        .json({ message: "No users found with this status" });
    }
  });
});

router.put("/updateStatus", (req, res) => {
    console.log("UPDATE STATUS ROUTE HIT");

  const { status, userEmail } = req.body;
  console.log(userEmail);
  

  const query = "UPDATE users SET status = ? WHERE mail_address = ?";
  db.query(query, [status, userEmail], (err, results) => {
    if (err) {
      console.log(err);
      
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Status updated successfully for " + userEmail });
  });
});

router.put("/update", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  const oldEmail = req.session.user.email;
  const { newName, phoneNumber } = req.body;

  // וולידציה לטלפון
  if (phoneNumber) {
    if (!/^\d{10}$/.test(phoneNumber) || !phoneNumber.startsWith("05")) {
      return res.status(400).json({ message: "מספר טלפון לא תקין" });
    }
  }

  if (!newName && !phoneNumber) {
    return res.status(400).json({ message: "נא להזין פרטים לעדכון" });
  }

  let query = "UPDATE users SET ";
  let values = [];

  if (newName && phoneNumber) {
    query += "user_name = ?, phone_number = ?";
    values.push(newName, phoneNumber);
  } else if (newName) {
    query += "user_name = ?";
    values.push(newName);
  } else {
    query += "phone_number = ?";
    values.push(phoneNumber);
  }

  query += " WHERE mail_address = ?";
  values.push(oldEmail);

  db.query(query, values, (err, results) => {
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
