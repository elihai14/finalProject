import { useState } from "react";
import classes from "./addAvailabilityForm.module.css";
import { getHoursArr } from "../../../js/mainFunctionView";
import { loadStartHours } from "../../../js/mainFunctionView";
import { handleAddConstraint } from "../../../js/mainFunctionView";

export default function AddAvailabilityForm({setRefresh}) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState("");
  const [hours, setHours] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndtTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [endHours, setEndHours] = useState([]);
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  // פונקצייה טוענת רשימת שעות לפי תאריך שנבחר 
  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value); // הפונקציה המקורית שמעדכנת את הסטייט
    if (value) {
      const dateObj = new Date(value);
      const dayIndex = dateObj.getDay();
      loadStartHours(days[dayIndex], setHours, setEndtTime);
    }
  };

  // פונקצייה שמעדכנת את שעת ההתחלה לערך שבחר 
  const handleStartTimeChange = (e) => {
    const value = e.target.value;
    setStartTime(value);
    loadEndHours(value);
  };

  // פונקצייה שמעדכנת את רשימת שעות הסיום 
  const loadEndHours = (start) => {
    setEndHours(getHoursArr(start, endTime));
  };

  // פונקצייה שמטפלת בהוספת האילוץ 
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
      <h3 className={classes.title}>הוספת זמינות</h3>

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
            { "-- בחר שעה --"}
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
            { "-- בחר שעה --"}
          </option>

          {endHours.slice(1).map((h, i) => (
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
