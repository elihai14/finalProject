// ייבוא הוקים מ-React
import { useState } from "react";
// ייבוא פונקציית עזר ליצירת מערך שעות
import { getHoursArr } from "../../../js/mainFunctionView";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./dayCard.module.css";

// קומפוננטת כרטיס יום להצגה ועריכה של שעות פתיחה וסגירה
export default function DayCard({ dayDetails, setRefresh }) {
// יצירת רשימת כל השעות האפשריות ביממה
  const hours = getHoursArr("00:00", "23:59");
// ניהול משתני State עבור שעות סיום זמינות, נתוני הטופס ומצב עריכה
  const [endHours, setEndHours] = useState([]);
  const [editForm, setEditForm] = useState({
    newStart: dayDetails.start,
    newEnd: dayDetails.end,
  });
  const [isEditing, setIsEditing] = useState(false);

// טיפול בשינוי שעת ההתחלה ועדכון שעות הסיום האפשריות בהתאם
  function handleChangeStart(e) {
    const selectedStart = e.target.value;
    const [h, m] = selectedStart.split(":");
    const newHours = (parseInt(h, 10) + 1) % 24;
    const formattedHours = String(newHours).padStart(2, "0");
    const nextHour = `${formattedHours}:${m}`;
    const availableEndHours = getHoursArr(nextHour, "23:59");

    setEditForm((prev) => ({
      ...prev,
      newStart: selectedStart,
      newEnd: availableEndHours.includes(prev.newEnd)
        ? prev.newEnd
        : availableEndHours[0] || selectedStart,
    }));
    setEndHours(availableEndHours);
  }

// מעבר למצב עריכה וטעינת שעות ההתחלה והסיום הנוכחיות
  const startEditing = () => {
    setEditForm({
      newStart: dayDetails.start,
      newEnd: dayDetails.end,
  });
    setEndHours(getHoursArr(dayDetails.start || "00:00", "23:59"));
    setIsEditing(true);
  };

// שליחת השעות המעודכנות לשרת ורענון הנתונים
  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:5000/daysHours/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          day: dayDetails.day,
          newStart: editForm.newStart,
          newEnd: editForm.newEnd,
        }),
      });
      if (res.ok) {
        setRefresh((prev) => !prev);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update hours:", err);
    }
  };

  return (
    <div className={classes.card}>
{/* הצגת שם היום */}
      <div className={classes.info}>
        <h4>{dayDetails.day}</h4>
      </div>

{/* אזור הצגה או עריכה של השעות */}
      <div className={classes.center}>
        {!isEditing ? (
/* תצוגת שעות רגילה */
          <div className={classes.timeDisplay}>
            <span>{dayDetails.start}</span>
            <span>-</span>
            <span>{dayDetails.end}</span>
          </div>
        ) : (
/* תיבות לבחירת שעת התחלה וסיום */
          <div className={classes.editBox}>
            <select value={editForm.newStart} onChange={handleChangeStart}>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span>-</span>
            <select
              value={editForm.newEnd}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, newEnd: e.target.value }))
              }
            >
              {endHours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

{/* כפתורי פעולה: עריכה / שמירה וביטול */}
      <div className={classes.actions}>
        {!isEditing ? (
          <button className={classes.editBtn} onClick={startEditing}>
            ערוך
          </button>
        ) : (
          <>
            <button className={classes.saveBtn} onClick={handleUpdate}>
              שמור
            </button>
            <button
              className={classes.cancelBtn}
              onClick={() => setIsEditing(false)}
            >
              ביטול
            </button>
          </>
        )}
      </div>
    </div>
  );
}