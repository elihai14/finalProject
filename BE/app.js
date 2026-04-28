const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const cors = require("cors"); // <-- הוספנו
const nodemailer = require("nodemailer"); // <-- הוספנו

const usersRouter = require("./routes/users");
const appRouter = require("./routes/appointments");
const servicesRouter = require("./routes/services");

const port = 5000;

// --- הגדרת Nodemailer ---
// שים לב: כאן תצטרך לשים את המייל שלך ואת ה-App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'elihaiafuta@gmail.com', 
    pass: 'sphxfmclreqrnznh'    
  }
});

// הגדרת נתיב ה-Frontend
const distPath = path.join(__dirname, "..", "FE", "dist");

// --- Middleware ---
app.use(cors()); // <-- חובה לחיבור עם React
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// אובייקט לשמירת קודים זמניים בשרת
// (הוא יהיה נגיש לראוטרים שלך אם תעביר אותו ב-req)
app.locals.otpCodes = {}; 
app.locals.transporter = transporter;

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// --- קבצים סטטיים ---
app.use(express.static(distPath));

// --- נתיבי API ---
app.use("/users", usersRouter);
app.use("/appointments", appRouter);
app.use("/services", servicesRouter);

// --- Catch-all ---
app.use((req, res, next) => {
  if (req.path.startsWith('/users') || req.path.startsWith('/appointments')) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});