/**
 * ============================================================================
 * מודול ניהול משתמשים (Users Router - Backend Model / Controller)
 * ============================================================================
 * תפקיד המודול:
 * מודול זה מרכז את כל לוגיקת ה-API הקשורה לניהול המשתמשים במערכת.
 * המודול מנהל את תהליכי ההרשמה, ההתחברות האינטראקטיבית (OTP), ההתנתקות,
 * שליפת פרטי המשתמש המחובר, עדכון פרופיל וסטטוס הרשאות (לקוח/ספר/מנהל),
 * ובדיקת תורים עתידיים עבור הלקוח בעת ההתחברות.
 */

const express = require("express");
const router = express.Router();

const dbSingleton = require("../dbSingleton");

// קבלת חיבור יחיד (Singleton) למסד הנתונים
const db = dbSingleton.getConnection();

/**
 * שליפת רשימת משתמשים לפי סינון סטטוס ומיון
 * POST /users/
 */
router.post("/", (req, res) => {
  const { status, isReverse } = req.body;

  let query = "SELECT * FROM users";
  let values = [];

  // הרכבת תנאי ה-WHERE בהתאם לסטטוס המבוקש
  if (status === "ספר") {
    query += " WHERE status IN ('ספר', 'מנהל')";
  } else if (status) {
    query += " WHERE status = ?";
    values.push(status);
  }

  // הגדרת כיוון המיון לפי שם המשתמש
  query += " ORDER BY user_name " + (isReverse ? "DESC" : "ASC");

  // ביצוע השאילתא והחזרת תוצאות המשתמשים
  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    return res.status(200).json(results);
  });
});

/**
 * שליפת פרטי המשתמש הנוכחי שמחובר בסשן
 * POST /users/current
 */
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

/**
 * שליפת סטטוס ההרשאה של המשתמש המחובר
 * POST /users/get-status
 */
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

/**
 * הרשמת משתמש חדש למערכת
 * POST /users/register
 */
router.post("/register", (req, res) => {
  const { fullName, phoneNumber, mailAddress } = req.body;

  // ולידציה לפורמט תקין של טלפון נייד
  if (phoneNumber) {
    if (!/^\d{10}$/.test(phoneNumber) || !phoneNumber.startsWith("05")) {
      return res.status(400).json({ message: "מספר טלפון לא תקין" });
    }
  }

  if (!fullName || !phoneNumber || !mailAddress) {
    return res.status(400).json({ message: "נא למלא את כל השדות" });
  }

  // בדיקת קיום מוקדם של המייל במערכת
  const checkQuery = "SELECT * FROM users WHERE mail_address = ?";

  db.query(checkQuery, [mailAddress], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "המשתמש כבר קיים במערכת" });
    }

    // הוספת המשתמש החדש עם סטטוס "לקוח" כברירת מחדל
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

/**
 * שליחת קוד אימות חד-פעמי להתחברות
 * POST /users/login
 */
router.post("/login", (req, res) => {
  const { mailAddress } = req.body;
  const { otpCodes, transporter } = req.app.locals;

  const query = "SELECT * FROM users WHERE mail_address = ?";

  db.query(query, [mailAddress], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      // ייצור קוד אימות אקראי בן 4 ספרות
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

      // שמירת הקוד בזיכרון השרת לבדיקה
      otpCodes[mailAddress] = otpCode;

      // הגדרת תוכן הודעת המייל
      const mailOptions = {
        from: "your-email@gmail.com",
        to: mailAddress,
        subject: "קוד אימות להתחברות",
        text: `שלום, קוד האימות שלך הוא: ${otpCode}`,
      };

      // שליחת המייל באמצעות Nodemailer
      try {
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

/**
 * התנתקות מהמערכת והשמדת הסשן
 * POST /users/logout
 */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("logout failed");
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "התנתקות בוצעה בהצלחה" });
  });
});

/**
 * אימות קוד OTP ובדיקת תורים קרובים של המשתמש
 * POST /users/verify-otp
 */
router.post("/verify-otp", (req, res) => {
  const { mailAddress, code } = req.body;
  const { otpCodes } = req.app.locals;

  // בדיקה שהקוד שהוזן תואם לקוד בזיכרון השרת
  if (otpCodes[mailAddress] && otpCodes[mailAddress] === code) {
    delete otpCodes[mailAddress];

    const query =
      "SELECT status, mail_address FROM users WHERE mail_address = ?";
    db.query(query, [mailAddress], (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ message: "User data not found" });
      }

      const user = results[0];
      req.session.user = { email: user.mail_address, status: user.status };

      // בדיקת תורים קרובים בשבוע הקרוב (רק עבור לקוחות)
      if (user.status === "לקוח") {
        const checkQuery = `
          SELECT 1 
          FROM appointments
          WHERE client_mail_address = ? 
            AND is_cancel = 0
            AND appointment_date >= CURDATE()
            AND appointment_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          LIMIT 1;
        `;

        db.query(checkQuery, [mailAddress], (appErr, appResults) => {
          console.log("SQL Results:", appResults);
          const hasUpcoming = !appErr && appResults.length > 0;

          return res.status(200).json({
            message: "Authentication successful",
            status: user.status,
            hasUpcomingAppointments: hasUpcoming,
          });
        });
      } else {
        return res.status(200).json({
          message: "Authentication successful",
          status: user.status,
          hasUpcomingAppointments: false,
        });
      }
    });
  } else {
    return res.status(401).json({ message: "Invalid code" });
  }
});

/**
 * עדכון סטטוס/הרשאת משתמש (מנהל/ספר/לקוח)
 * PUT /users/updateStatus
 */
router.put("/updateStatus", (req, res) => {
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

/**
 * עדכון פרטים אישיים של המשתמש (שם וטלפון)
 * PUT /users/update
 */
router.put("/update", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  const email = req.session.user.email;
  const { newName, phoneNumber } = req.body;

  if (phoneNumber) {
    if (!/^\d{10}$/.test(phoneNumber) || !phoneNumber.startsWith("05")) {
      return res.status(400).json({ message: "מספר טלפון לא תקין" });
    }
  }

  if (!newName && !phoneNumber) {
    return res.status(400).json({ message: "נא להזין פרטים לעדכון" });
  }

  // בניית שאילתת עדכון דינמית לפי הפרטים שהוזנו
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
  values.push(email);

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

/**
 * שליפת פרטי ספר והשירותים שהוא מספק
 * GET /users/barber-details/:mail
 */
router.get("/barber-details/:mail", (req, res) => {
  const { mail } = req.params;

  const query = `
    SELECT
      user_name AS barberName,
      phone_number AS phone
    FROM users 
    WHERE mail_address = ?
  `;

  // שליפת פרטי הספר
  db.query(query, [mail], (err, barberResults) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (barberResults.length === 0) {
      return res.status(404).json({ message: "Barber not found" });
    }

    const barber = barberResults[0];

    // שליפת רשימת השירותים השייכים לספר
    const servicesQuery = `
      SELECT service_name
      FROM barber_services
      WHERE mail_address = ?
    `;

    db.query(servicesQuery, [mail], (err, serviceResults) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }

      return res.status(200).json({
        barberName: barber.barberName,
        phone: barber.phone,
        services: serviceResults.map((service) => service.service_name),
      });
    });
  });
});

module.exports = router;
