// ייבוא קובץ העיצוב (CSS Module)
import classes from "./availabilityCard.module.css";

// קומפוננטה להצגת כרטיס חלון זמן פנוי/זמינות של ספר
export default function AvailabilityCard({ cons, onCancel }) {
  return (
    // הקלאס card ייתן את הרקע והגבולות
    <div className={classes.card}>

{/* הצגת כפתור הסרה במידה ונשלחה פונקציית ביטול */}
      {onCancel && (
        <button className={classes.cancel_btn} onClick={onCancel}>
          הסרת חלון זמן
        </button>
      )}

      {/* ה-wrapper יסדר את הטקסט בשורה עם מרווחים */}
      <div className={classes.details_wrapper}>
{/* הצגת טווח השעות והתאריך של חלון הזמינות */}
        <span className={classes.time_box}>{cons.startTime} - {cons.endTime}</span>
                <span className={classes.date_box}>{cons.date}</span>

      </div>
    </div>
  );
}