import classes from "./constraintsCard.module.css";

export default function ConstraintCard({ cons, onCancel }) {
  return (
    // הקלאס card ייתן את הרקע והגבולות
    <div className={classes.card}>

      {onCancel && (
        <button className={classes.cancel_btn} onClick={onCancel}>
          ביטול אילוץ
        </button>
      )}

      {/* ה-wrapper יסדר את הטקסט בשורה עם מרווחים */}
      <div className={classes.details_wrapper}>
        <span className={classes.time_box}>{cons.startTime} - {cons.endTime}</span>
                <span className={classes.date_box}>{cons.date}</span>

      </div>
    </div>
  );
}