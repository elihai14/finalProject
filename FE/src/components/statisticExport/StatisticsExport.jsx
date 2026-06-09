import React from "react";
import * as XLSX from "xlsx";
import classes from "./statisticsExport.module.css";

const StatisticsExport = ({ statsData, startDate, endDate }) => {
  // דוגמה למבנה הנתונים שהקומפוננטה מצפה לקבל ב-statsData:

  // const statsData = {
  //   monthlyRevenue: 15450,
  //   monthlyCustomers: 120,
  //   returningCustomersPercent: 65,
  //   busyDays: [
  //     { rank: 1, day: "חמישי", appointments: 45 },
  //     { rank: 2, day: "שישי", appointments: 38 },
  //     { rank: 3, day: "שלישי", appointments: 22 }
  //   ],
  //   busyHours: [
  //     { rank: 1, hour: "16:00 - 17:00", load: "גבוה מאוד" },
  //     { rank: 2, hour: "17:00 - 18:00", load: "גבוה" },
  //     { rank: 3, hour: "10:00 - 11:00", load: "בינוני" }
  //   ]
  // };

  const handleExport = () => {
    if (!statsData) {
      alert("אין נתונים זמינים לייצוא");
      return;
    }

    // --- 1. בניית הגיליון הראשון: מדדים כלליים (רלוונטי גם למנהל וגם לספר) ---
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

      analyticsRows.push({ "נתוני עומסים ודירוגים": "", פרטים: "", נתון: "" });

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
