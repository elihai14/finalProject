import classes from "./newAppForm.module.css";

export default function NewAppForm() {
  return (
      <div
        className={classes.container}
        id="addApp-form"
      >
        <form id="appointmentForm" className={classes.main_form}>
          <div className={classes.form_group}>
            <label htmlFor="serviceSelect">בחר שירות</label>
            <select
              name="serviceSelect"
              id="serviceSelect"
              className={classes.form_input}
              required
            >
              <option value="">טוען נתונים...</option>
            </select>
          </div>

          <div className={classes.form_group}>
            <label htmlFor="dateInput">בחר תאריך</label>
            <input
              type="date"
              id="dateInput"
              className={classes.form_input}
              min="2026-10-01"
              required
            />
          </div>

          <button type="submit" className={classes.btn_submit}>
            קבע תור
          </button>
        </form>
      </div>
  );
}
