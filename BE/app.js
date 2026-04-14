const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const usersRouter = require("./routes/users");

const port = 3000;

// 1. הגדרת תיקיית הקבצים הסטטיים - וודאו שהנתיב מדויק
// אם app.js נמצא בתוך תיקיית BE, אנחנו צריכים לצאת החוצה ל-FE
const fePath = path.join(__dirname, "..", "FE");
app.use(express.static(fePath));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// 2. שימוש בראוטר
app.use("/users", usersRouter);

// 3. הגדרת נתיב השורש - שליחת ה-index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(fePath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});