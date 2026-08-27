// ייבוא הוק של React לניהול State
import { useState } from "react";
// ייבוא קובץ העיצוב
import classes from "./addAvailabilityForm.module.css";
// ייבוא פונקציות עזר לשליפת שעות והוספת אילוצים
import { getHoursArr } from "../../../js/mainFunctionView";
import { loadStartHours } from "../../../js/mainFunctionView";
import { handleAddConstraint } from "../../../js/mainFunctionView";

// קומפוננטת טופס הוספת אילוצי זמינות / שעות עבודה
export default function AddAvailabilityForm({setRefresh}) {
// חישוב התאריך של היום בפורמט YYYY-MM-DD לקביעת מינימום בבחר התאריך
  const today = new Date().toISOString().split("T")[0];
// ניהול משתני ה-סטייט עבור תאריכים, שעות התחלה, שעות סיום ומערכי השעות האפשריים
  const [selectedDate, setSelectedDate] = useState("");
  const [hours, setHours] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndtTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [endHours, setEndHours] = useState([]);
// מערך ימות השבוע להמרת האינדקס שמחזיר ()getDay לשם היום בעברית
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  // פונקצייה טוענת רשימת שעות לפי תאריך שנבחר 
  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value); // הפונקציה המקורית שמעדכנת את הסטייט
    if (value) {
// חילוץ אינדקס היום בשבוע ושליפת שעות ההתחלה האפשריות לאותו יום
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
// חישוב מערך שעות הסיום האפשריות החל משעת ההתחלה שנבחרה
    setEndHours(getHoursArr(start, endTime));
  };

  // פונקצייה שמטפלת בהוספת האילוץ 
  const addCons = async(e)=>{
// קריאה לפונקציית העזר שמבצעת את קריאת ה-API להוספת האילוץ ומאפסת את הטופס
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

{/* טופס הוספת זמינות */}
      <form onSubmit={(e) => addCons(e)} className={classes.form}>
        <label htmlFor="dateInput">בחר תאריך</label>
{/* שדה בחירת תאריך עם חסימה לתאריכים שכבר עברו */}
        <input
          type="date"
          id="dateInput"
          className={classes.form_input}
          onChange={handleDateChange}
          min={today}
          required
        />
{/* שדה בחירת שעת התחלה - עד לבחירת תאריך */}
        <select
          className={classes.select}
          onChange={handleStartTimeChange}
          disabled={!selectedDate}
        >
          <option value="">
            { "-- בחר שעה --"}
          </option>

{/* מיפוי שעות ההתחלה האפשריות לאפשרויות בחירה */}
          {hours.map((h, i) => (
            <option key={i} value={h}>
              {h}
            </option>
          ))}
        </select>

{/* שדה בחירת שעת סיום - עד לבחירת שעת התחלה */}
        <select
          className={classes.select}
          onChange={(e) => setSelectedEndTime(e.target.value)}
          disabled={!startTime}
        >
          <option value="">
            { "-- בחר שעה --"}
          </option>

{/* מיפוי שעות הסיום המדולגות (ללא שעת ההתחלה עצמה) */}
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