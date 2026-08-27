/**
 * ============================================================================
 * קובץ השרת הראשי 
 * ============================================================================
 * תפקיד המודול:
 * קובץ זה מהווה את נקודת הכניסה הראשית של השרת .
 * הקובץ מייבא ומגדיר את כל תופסי התקשורת  כגון CORS ו-Sessions,
 * מגדיר את אובייקט שליחת הדוא"ל (Nodemailer), מקשר את נתיבי ה-API השונים (Routes),
 * ומעלה את שרת ה-Express לאוויר בפורט המוגדר.
 */

const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const nodemailer = require("nodemailer");

// ייבוא ראוטרים לניהול נתיבי המערכת
const usersRouter = require("./routes/users");
const appRouter = require("./routes/appointments");
const servicesRouter = require("./routes/services");
const availabilityRouter = require("./routes/availability");
const daysHoursRouter = require("./routes/daysHours");

const port = 5000;

// הגדרת מנגנון שליחת מיילים באמצעות Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "elihaiafuta@gmail.com",
    pass: "sphxfmclreqrnznh",
  },
});

// הגדרת נתיב לקבצים הסטטיים של ממשק המשתמש 
const distPath = path.join(__dirname, "..", "FE", "dist");

// הגדרות Middlewares מרכזיים 
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// הגדרת משתנים גלובליים ברמת השרת (קודים זמניים ושירות הדוא"ל)
app.locals.otpCodes = {};
app.locals.transporter = transporter;

// הגדרת ניהול סשנים של משתמשים 
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  }),
);

// הגשת קבצים סטטיים
app.use(express.static(distPath));

// שיוך נתיבי הAPI השונים בשרת 
app.use("/users", usersRouter);
app.use("/appointments", appRouter);
app.use("/services", servicesRouter);
app.use("/availability", availabilityRouter);
app.use("/daysHours", daysHoursRouter);

// טיפול בנתיבים שלא קיימים ותמיכה באפליקציה בעלת עמוד יחיד
app.use((req, res, next) => {
  if (req.path.startsWith("/users") || req.path.startsWith("/appointments")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// הפעלת השרת והאזנה לבקשות
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
