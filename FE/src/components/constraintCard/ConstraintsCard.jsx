import classes from "./constraintsCard.module.css";
export default function ConstraintCard({ cons, onCancel }) {
  return (
    <div>
      <div>
        <span>{cons.date}</span>
        <span>{cons.startTime}</span>
        <span>{cons.endTime}</span>
        {onCancel && (
          <button className={classes.cancel_btn} onClick={onCancel}>
            ביטול אילוץ
          </button>
        )}
      </div>
    </div>
  );
}
