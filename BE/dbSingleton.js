/**
 * ============================================================================
 * מודול ניהול חיבור למסד הנתונים
 * ============================================================================
 */

const mysql = require("mysql2");

// משתנה פנימי לשמירת ה-Instance היחיד של החיבור
let connection;

const dbSingleton = {
  /**
   * פונקציה לקבלת אובייקט החיבור למסד הנתונים
   * במידה ואין חיבור פעיל - היא יוצרת אותו, במידה וקיים - היא מחזירה את הקיים.
   */
  getConnection: () => {
    if (!connection) {
      // הגדרת פרטי התחברות ויצירת אובייקט החיבור ל-MySQL
      connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "finalprojectdb",
        timezone: "Z",
      });

      // ביצוע ההתחברות בפועל וטיפול בשגיאות אתחול
      connection.connect((err) => {
        if (err) {
          console.error("Error connecting to database:", err);
          throw err;
        }
        console.log("Connected to MySQL!");
      });

      // האזנה לאירועי שגיאה בזמן ריצה וטיפול בניתוק פתאומי
      connection.on("error", (err) => {
        console.error("Database connection error:", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          connection = null; // איפוס המשתנה כדי לאפשר התחברות מחדש בקריאה הבאה
        }
      });
    }

    return connection;
  },
};

module.exports = dbSingleton;
