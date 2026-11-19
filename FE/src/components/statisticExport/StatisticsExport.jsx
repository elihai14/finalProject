// ייבוא React, ספריית XLSX לייצוא קובצי אקסל וקובץ העיצוב
import React from "react";
import * as XLSX from "xlsx";
import classes from "./statisticsExport.module.css";

// פונקציית עזר לחילוץ מספרי של כמות תורים מתוך פריט סטטיסטיקה
const getCountValue = (item) => {
  if (!item) return 0;
  const raw = item.appointments ?? item.count ?? item.load ?? 0;
  const parsed = parseInt(String(raw), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

// קומפוננטה לייצוא דוחות סטטיסטיקה של העסק לקובץ Excel (.xlsx)
const StatisticsExport = ({ statsData, startDate, endDate, appointments, status }) => {
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
        "מדד סטטיסטי": "כמות הכנסות תקופתית",
        ערך: `₪${statsData.monthlyRevenue?.toLocaleString() || 0}`,
      },
      {
        "מדד סטטיסטי": "כמות לקוחות תקופתית",
        ערך: `${statsData.monthlyCustomers || 0} לקוחות`,
      },
    ];

    // רק אם המשתמש הוא מנהל (קיים אחוז לקוחות חוזרים), נוסיף את השורה הזו
    if (statsData.returningCustomersPercent !== undefined) {
      summaryRows.push({
        "מדד סטטיסטי": "כמות לקוחות חוזרים",
        ערך: `${statsData.returningCustomersPercent}`,
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
    if (statsData.busyDays && statsData.busyHours && status === "מנהל") {
      const analyticsRows = [];

      // מיון הימים העמוסים מהגבוה לנמוך לפי כמות התורים
      const sortedBusyDays = [...statsData.busyDays].sort(
        (a, b) => getCountValue(b) - getCountValue(a)
      );

      // הוספת נתוני הימים העמוסים ביותר
      analyticsRows.push({
        "נתוני עומסים ודירוגים": "🏆 דירוג 3 הימים העמוסים ביותר",
        פרטים: "",
        נתון: "",
      });
      sortedBusyDays.forEach((item, index) => {
        const appointmentsCount = getCountValue(item);

        analyticsRows.push({
          "נתוני עומסים ודירוגים": `מקום ${index + 1}`,
          פרטים: item.day,
          נתון: `${appointmentsCount} תורים`,
        });
      });

      // שורת רווח מפרידה
      analyticsRows.push({ "נתוני עומסים ודירוגים": "", פרטים: "", נתון: "" });

      // מיון השעות העמוסות מהגבוה לנמוך לפי כמות התורים
      const sortedBusyHours = [...statsData.busyHours].sort(
        (a, b) => getCountValue(b) - getCountValue(a)
      );

      // הוספת נתוני השעות העמוסות ביותר
      analyticsRows.push({
        "נתוני עומסים ודירוגים": "⏰ דירוג שעות לפי עומס",
        פרטים: "",
        נתון: "",
      });
      sortedBusyHours.forEach((item, index) => {
        const hourCount = getCountValue(item);

        analyticsRows.push({
          "נתוני עומסים ודירוגים": `מקום ${index + 1}`,
          פרטים: item.hour,
          נתון:
            item.appointments !== undefined || item.count !== undefined
              ? `${hourCount} תורים`
              : item.load || `${hourCount} תורים`,
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

    // --- 5. יצירת גיליון רשימת התורים ---
    if (appointments && appointments.length > 0) {
      const appointmentsRows = appointments.map((item) => ({
        תאריך: new Date(item.appointment_date).toLocaleDateString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "UTC",
        }),
        שעה: item.appointment_time,
        "שם הספר": item.barberName,
        "שם הלקוח": item.customerName,
        "סוג השירות": item.service_name,
        מחיר: `${item.price} ₪`,
      }));

      // יצירת גיליון התורים
      const wsAppointments = XLSX.utils.json_to_sheet(appointmentsRows, {
        header: ["תאריך", "שעה", "שם הספר", "שם הלקוח", "סוג השירות", "מחיר"],
      });

      // הגדרת RTL
      if (!wsAppointments["!wb"]) {
        wsAppointments["!wb"] = {};
      }

      wsAppointments["!wb"].sheetView = [{ sheetDirection: "rtl" }];

      // רוחב עמודות
      wsAppointments["!cols"] = [
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
      ];

      XLSX.utils.book_append_sheet(workbook, wsAppointments, "רשימת תורים");
    }

    XLSX.writeFile(
      workbook,
      `דוח_סטטיסטיקה_עסקית_${startDate}-${endDate}.xlsx`
    );
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
