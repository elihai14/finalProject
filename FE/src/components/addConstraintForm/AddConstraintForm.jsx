import { useState } from "react";
import classes from "./addConstraintForm.module.css";
import { getHoursArr } from "../../../js/mainFunctionView";
import { loadStartHours } from "../../../js/mainFunctionView";
import { handleAddConstraint } from "../../../js/mainFunctionView";

export default function AddConstraintForm({setRefresh}) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState("");
  const [hours, setHours] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndtTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [endHours, setEndHours] = useState([]);
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value); // הפונקציה המקורית שמעדכנת את הסטייט
    if (value) {
      const dateObj = new Date(value);
      const dayIndex = dateObj.getDay();
      loadStartHours(days[dayIndex], setHours, setEndtTime);
    }
  };

  const handleStartTimeChange = (e) => {
    const value = e.target.value;
    setStartTime(value);
    loadEndHours(value);
  };

  const loadEndHours = (start) => {
    setEndHours(getHoursArr(start, endTime));
  };

  const addCons = async(e)=>{
    handleAddConstraint(
      e,
      selectedDate,
      setSelectedDate,
      setHours,
      startTime,
      setStartTime,
      setEndtTime,
      selectedEndTime,
      setSelectedEndTime,
      setEndHours,
      setRefresh
    );
  }

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>הוספת אילוץ</h3>

      <form onSubmit={(e) => addCons(e)} className={classes.form}>
        <label htmlFor="dateInput">בחר תאריך</label>
        <input
          type="date"
          id="dateInput"
          className={classes.form_input}
          onChange={handleDateChange}
          min={today}
          required
        />
        <select
          className={classes.select}
          onChange={handleStartTimeChange}
          disabled={!selectedDate}
        >
          <option value="">
            {hours.length === 0
              ? "המספרה אינה פעילה בתאריך ביום זה "
              : "-- בחר שעה --"}
          </option>

          {hours.map((h, i) => (
            <option key={i} value={h}>
              {h}
            </option>
          ))}
        </select>

        <select
          className={classes.select}
          onChange={(e) => setSelectedEndTime(e.target.value)}
          disabled={!startTime}
        >
          <option value="">
            {hours.length === 0
              ? "המספרה אינה פעילה ביום זה "
              : "-- בחר שעה --"}
          </option>

          {endHours.map((h, i) => (
            <option key={i} value={h}>
              {h}
            </option>
          ))}
        </select>

        <button type="submit" className={classes.button}>
          הוספה +
        </button>
      </form>
    </div>
  );
}
