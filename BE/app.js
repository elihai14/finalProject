const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const usersRouter = require("./routes/users");
const appRouter = require("./routes/appointments");
const servicesRouter = require("./routes/services");



const port = 3000;

// הגדרת הנתיב לתיקיית ה-dist (ה-Frontend המוכרז)
const distPath = path.join(__dirname, "..", "FE", "dist");

// --- שלב 1: הגדרות Middleware בסיסיות ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// --- שלב 2: הגשת קבצים סטטיים ---
// זה מאפשר לדפדפן למצוא את ה-CSS וה-JS שבתוך dist/assets
app.use(express.static(distPath));

// --- שלב 3: נתיבי ה-API ---
app.use("/users", usersRouter);
app.use("/appointments", appRouter);
app.use("/services", servicesRouter);


// --- שלב 4: פתרון ה-Catch-all (למניעת שגיאות Regex) ---
// הפונקציה הזו תתפוס כל בקשה שלא טופלה למעלה ותחזיר את ה-index.html
app.use((req, res, next) => {
  // אם הבקשה היא לכתובת API שלא קיימת, אל תחזיר את ה-HTML (אופציונלי)
  if (req.path.startsWith('/users')) {
    return res.status(404).json({ error: "API route not found" });
  }
  // בכל מקרה אחר (ניווט בדפים), שלח את ה-React
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});