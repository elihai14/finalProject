/**
 * ============================================================================
 * מודול ניהול שירותים 
 * ============================================================================
 * תפקיד המודול:
 * מודול זה מנהל את קטלוג השירותים במערכת, הן ברמת המערכת הגלובלית (מנהל)
 * והן ברמת הצעות המחיר והזמנים האישיות של כל ספר.
 * המודול כולל ניהול, הוספה, עדכון, הסרה/כיבוי ושליפת נתוני
 * מחיר ומשך זמן עבור שירותים שונים.
 */

const express = require("express");
const router = express.Router();

const dbSingleton = require("../dbSingleton");

// קבלת חיבור יחיד (Singleton) למסד הנתונים
const db = dbSingleton.getConnection();

/**
 * שליפת כל השירותים הפעילים של ספר ספציפי
 * POST /services/
 */
router.post("/", (req, res) => {
  const { barberMail } = req.body;
  console.log(req.body);
  console.log(barberMail);

  const query =
    "SELECT service_name, price, duration FROM barber_services WHERE mail_address = ? AND barber_service_status = 1";
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

/**
 * שליפת כל שמות השירותים הפעילים בקטלוג המערכת הגלובלי
 * GET /services/global
 */
router.get("/global", (req, res) => {
  const query = "SELECT service_name FROM services WHERE status_service = 1";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.status(200).json(results);
  });
});

/**
 * הוספה או הפעלה מחדש של שירות בתפריט האישי של ספר
 * POST /services/barber/add-service
 */
router.post("/barber/add-service", (req, res) => {
  let barberMail = req.body.barberMail;

  if (!barberMail && req.session && req.session.user) {
    barberMail = req.session.user.mail_address;
  }

  const { serviceName, price, duration } = req.body;

  if (!barberMail) {
    return res.status(400).json({ message: "לא נמצא מייל של הספר המחובר" });
  }

  // בדיקת קיום השירות אצל הספר
  const checkBarberQuery =
    "SELECT * FROM barber_services WHERE mail_address = ? AND service_name = ?";

  db.query(checkBarberQuery, [barberMail, serviceName], (err, results) => {
    if (err) return res.status(500).json({ message: "Internal Error" });

    if (results.length > 0) {
      if (results[0].barber_service_status === 1) {
        return res.status(400).json({ message: "השירות כבר קיים בתפריט שלך" });
      }

      // אם השירות היה מבוטל בעבר - מעדכנים ומחזירים לסטטוס פעיל (1)
      const updateBackQuery =
        "UPDATE barber_services SET barber_service_status = 1, price = ?, duration = ? WHERE mail_address = ? AND service_name = ?";
      db.query(
        updateBackQuery,
        [Number(price), Number(duration), barberMail, serviceName],
        (err) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Error activating service" });

          return res
            .status(200)
            .json({ message: "השירות הוחזר לתפריט שלך בהצלחה" });
        },
      );

      return;
    }

    // הוספת שירות חדש לגמרי לתפריט הספר
    const insertBarberServices =
      "INSERT INTO barber_services (mail_address, service_name, price, duration, barber_service_status) VALUES (?, ?, ?, ?, 1)";

    db.query(
      insertBarberServices,
      [barberMail, serviceName, Number(price), Number(duration)],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error linking service" });
        }

        return res
          .status(200)
          .json({ message: "השירות נוסף בהצלחה למספרה שלך" });
      },
    );
  });
});

/**
 * הוספת שירות חדש לקטלוג המערכת הגלובלי (מנהל בלבד)
 * POST /services/admin/add-service
 */
router.post("/admin/add-service", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "User not logged in",
    });
  }

  const { serviceName } = req.body;

  const checkQuery = "SELECT * FROM services WHERE service_name = ?";

  db.query(checkQuery, [serviceName], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Internal Error",
      });
    }

    if (results.length > 0) {
      const service = results[0];

      if (service.status_service === 1) {
        return res.status(400).json({
          message: "השירות כבר קיים בקטלוג המערכת",
        });
      }

      // הפעלה מחדש של שירות במערכת הגלובלית
      const updateQuery =
        "UPDATE services SET status_service = 1 WHERE service_name = ?";

      db.query(updateQuery, [serviceName], (err) => {
        if (err) {
          return res.status(500).json({
            message: "Error updating service",
          });
        }

        return res.status(200).json({
          message: "השירות הוחזר למערכת בהצלחה",
        });
      });

      return;
    }

    // יצירת שירות חדש במערכת הגלובלית
    const insertQuery =
      "INSERT INTO services (service_name, status_service) VALUES (?, 1)";

    db.query(insertQuery, [serviceName], (err) => {
      if (err) {
        return res.status(500).json({
          message: "Error adding service",
        });
      }

      return res.status(200).json({
        message: "השירות נוסף למערכת בהצלחה",
      });
    });
  });
});

/**
 * הסרת שירות (כיבוי סטטוס) מהתפריט האישי של ספר
 * PUT /services/remove-service
 */
router.put("/remove-service", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const { serviceName } = req.body;
  const barberMail = req.session.user.email;

  const query =
    "UPDATE barber_services SET barber_service_status = 0 WHERE service_name = ? AND mail_address = ?";

  db.query(query, [serviceName, barberMail], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "שירות לא נמצא בתפריט שלך" });
    }

    return res
      .status(200)
      .json({ message: "השירות הוסר בהצלחה מהתפריט האישי שלך" });
  });
});

/**
 * הסרת שירות מהמערכת הגלובלית וביטולו אצל כל הספרים (Transaction - מנהל בלבד)
 * PUT /services/admin/remove-service
 */
router.put("/admin/remove-service", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const { serviceName } = req.body;
  if (!serviceName) {
    return res.status(400).json({ message: "נא לספק את שם השירות למחיקה" });
  }

  // התחלת טרנזקציה להבטחת עקביות הנתונים
  db.beginTransaction((err) => {
    if (err)
      return res.status(500).json({ message: "Failed to start transaction" });

    const updateGlobalQuery =
      "UPDATE services SET status_service = 0 WHERE service_name = ?";

    db.query(updateGlobalQuery, [serviceName], (err, globalResult) => {
      if (err || globalResult.affectedRows === 0) {
        return db.rollback(() => {
          res
            .status(err ? 500 : 404)
            .json({ message: err ? "Error" : "Service not found" });
        });
      }

      // כיבוי השירות גם אצל כל הספרים שאימצו אותו
      const updateBarbersQuery =
        "UPDATE barber_services SET barber_service_status = 0 WHERE service_name = ?";

      db.query(updateBarbersQuery, [serviceName], (err, barbersResult) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({
              message: "Internal Server Error (Barbers Update Failed)",
            });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ message: "Failed to commit" });
            });
          }
          return res.status(200).json({ message: "הוסר בהצלחה" });
        });
      });
    });
  });
});

/**
 * עדכון מחיר וזמן של שירות בתפריט הספר
 * PUT /services/update-service
 */
router.put("/update-service", (req, res) => {
  let barberMail = req.body.barberMail;

  if (!barberMail && req.session && req.session.user) {
    barberMail = req.session.user.mail_address;
  }

  const { serviceName, newPrice, newDuration } = req.body;
  const cleanServiceName = serviceName ? serviceName.trim() : "";

  if (!barberMail) {
    return res.status(400).json({ message: "לא נמצא מייל של הספר המחובר" });
  }

  const query =
    "UPDATE barber_services SET price = ? , duration = ? WHERE service_name = ? AND mail_address = ?";

  db.query(
    query,
    [Number(newPrice), Number(newDuration), cleanServiceName, barberMail],
    (err, results) => {
      if (err) {
        console.error("שגיאת SQL בעדכון:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: `השירות ${cleanServiceName} לא חלק מהשירותים שלך` });
      }

      return res.status(200).json({ message: "השירות עודכן בהצלחה" });
    },
  );
});

/**
 * שליפת מחיר שירות ספציפי אצל ספר
 * POST /services/price
 */
router.post("/price", (req, res) => {
  const { barberMail, serviceName } = req.body;

  const query =
    "SELECT price from barber_services WHERE mail_address = ? AND service_name = ?";
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

/**
 * שליפת משך זמן שירות ספציפי אצל ספר
 * POST /services/duration
 */
router.post("/duration", (req, res) => {
  const { barberMail, serviceName } = req.body;
  const query =
    "SELECT duration from barber_services WHERE mail_address = ? AND service_name = ?";
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
