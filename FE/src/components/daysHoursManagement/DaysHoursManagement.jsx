// ייבוא פונקציית שליפת הנתונים מהקובץ המרכזי
import { getDays } from "../../../js/mainFunctionView";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./daysHoursManagement.module.css";
// ייבוא קומפוננטת כרטיס יום להצגת השעות
import DayCard from "../dayCard/DayCard";
// ייבוא הוקים מ-React
import { useEffect, useState } from "react";

// קומפוננטת ניהול שעות וימי הפעילות של העסק
export default function DaysHoursManagement() {
// ניהול משתני State עבור רשימת הימים וטריגר לרענון הנתונים
  const [days, setDays] = useState([]);
  const [refresh, setRefresh] = useState(false);

// טעינת שעות הפעילות מהשרת בעת ענידת הקומפוננטה ובכל שינוי של refresh
  useEffect(() => {
    const fetchDaysData = async () => {
      try {
        const data = await getDays();
        setDays(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("שגיאה בטעינת הימים:", error);
        setDays([]);
      }
    };

    fetchDaysData();
  }, [refresh]);

  return (
    <div className={classes.container}>
{/* כותרת העמוד */}
      <h3 className={classes.title}>שעות פעילות</h3>

{/* גריד להצגת כרטיסי הימים והשעות */}
      <div className={classes.grid}>
        {!days || days.length === 0 ? (
/* הודעה במקרה שאין נתונים או שיש שגיאה */
          <p className={classes.empty}>שגיאה בטעינת השעות</p>
        ) : (
/* מיפוי הימים והצגת קומפוננטת DayCard עבור כל יום */
          days.map((d) => (
            <DayCard key={d.day} dayDetails={d} setRefresh={setRefresh} />
          ))
        )}
      </div>
    </div>
  );
}