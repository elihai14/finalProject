// ייבוא React, ספריית XLSX לייצוא קובצי אקסל וקובץ העיצוב
import React from "react";
import * as XLSX from "xlsx";
import classes from "./statisticsExport.module.css";

// קומפוננטה לייצוא דוחות סטטיסטיקה של העסק לקובץ Excel (.xlsx)
const StatisticsExport = ({ statsData, startDate, endDate }) => {

// פונקציית הייצוא הראשית
  const handleExport = () => {
// בדיקה אם קיימים נתונים לייצוא
    if (!statsData) {
      alert("אין נתונים זמינים לייצוא");
      return;
    }

// --- 1. בניית הגיליון הראשון: סיכום מדדים כללי ---
    const summaryRows = [
      {
        "מדד סטטיסטי": "כמות הכנסות חודשיות",
        ערך: `₪${statsData.monthlyRevenue?.toLocaleString() || 0}`,
      },
      {
        "מדד סטטיסטי": "כמות לקוחות חודשית",
        ערך: `${statsData.monthlyCustomers || 0} לקוחות`,
      },
    ];

    // רק אם המשתמש הוא מנהל (קיים אחוז לקוחות חוזרים), נוסיף את השורה הזו
    if (statsData.returningCustomersPercent !== undefined) {
      summaryRows.push({
        "מדד סטטיסטי": "אחוז לקוחות חוזרים",
        ערך: `${statsData.returningCustomersPercent}%`,
      });
    }

// הפיכת נתוני הסיכום לגיליון אקסל
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows, {
      header: ["מדד סטטיסטי", "ערך"],
    });

    // הגדרת RTL לגיליון הראשון
    if (!wsSummary["!wb"]) wsSummary["!wb"] = {};
    wsSummary["!wb"].sheetView = [{ sheetDirection: "rtl" }];
    wsSummary["!cols"] = [{ wch: 25 }, { wch: 15 }];

    // --- 2. יצירת ה-Workbook הראשי ---
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, wsSummary, "סיכום מדדים כללי");

    // --- 3. בדיקה חכמה: האם יש נתוני עומסים? (רק עבור מנהל) ---
    if (statsData.busyDays && statsData.busyHours) {
      const analyticsRows = [];

// הוספת נתוני הימים העמוסים ביותר
      analyticsRows.push({
        "נתוני עומסים ודירוגים": "🏆 דירוג 3 הימים העמוסים ביותר",
        פרטים: "",
        נתון: "",
      });
      statsData.busyDays.forEach((item) => {
        // חילוץ בטוח של מספר התורים - בדיקה של appointments או count והפיכה למספר
        const appointmentsCount =
          parseInt(item.appointments || item.count, 10) || 0;

        analyticsRows.push({
          "נתוני עומסים ודירוגים": `מקום ${item.rank}`,
          פרטים: item.day,
          נתון: `${appointmentsCount} תורים`,
        });
      });

// שורת רווח מפרידה
      analyticsRows.push({ "נתוני עומסים ודירוגים": "", פרטים: "", נתון: "" });

// הוספת נתוני השעות העמוסות ביותר
      analyticsRows.push({
        "נתוני עומסים ודירוגים": "⏰ דירוג שעות לפי עומס",
        פרטים: "",
        נתון: "",
      });
      statsData.busyHours.forEach((item) => {
        analyticsRows.push({
          "נתוני עומסים ודירוגים": `מקום ${item.rank}`,
          פרטים: item.hour,
          נתון: item.load || `${item.appointments || item.count} תורים`,
        });
      });

// הפיכת נתוני העומסים לגיליון אקסל
      const wsAnalytics = XLSX.utils.json_to_sheet(analyticsRows, {
        header: ["נתוני עומסים ודירוגים", "פרטים", "נתון"],
      });

      // הגדרת RTL לגיליון השני
      if (!wsAnalytics["!wb"]) wsAnalytics["!wb"] = {};
      wsAnalytics["!wb"].sheetView = [{ sheetDirection: "rtl" }];
      wsAnalytics["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];

      // מוסיפים את הגיליון השני רק אם הנתונים קיימים!
      XLSX.utils.book_append_sheet(workbook, wsAnalytics, "ניתוח עומסי פעילות");
    }

    // --- 4. הגדרת כיוון כללי לקובץ והורדה ---
    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
    workbook.Workbook.Views[0] = { RTL: true };

    const currentDate = new Date()
      .toLocaleDateString("he-IL")
      .replace(/\./g, "-");
    XLSX.writeFile(workbook, `דוח_סטטיסטיקה_עסקית_${startDate}-${endDate}.xlsx`);
  };

// רינדור כפתור הייצוא
  return (
    <button
      onClick={handleExport}
      className={classes.exportButton}
      type="button"
    >
      📥 ייצא דוח לאקסל (.xlsx)
    </button>
  );
};

export default StatisticsExport;