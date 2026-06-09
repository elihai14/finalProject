import React, { useState, useEffect } from "react";
import classes from "./busyDays.module.css";

function BusyDays({ setDaysRank, startDate, endDate }) {
  const [busyDays, setBusyDays] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/appointments/busy-days?startDate=${startDate}&endDate=${endDate}`
        );
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        const arr = Array.isArray(data) ? data : [];
        setBusyDays(arr);
        setDaysRank(arr);
      } catch (err) {
        console.error("שגיאה במשיכת נתונים:", err);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return (
    <div className={classes.container}>
      <h3>דירוג עומס בימים </h3>
      <div className={classes.list}>
        {busyDays.map((day, index) => (
          <div key={day.day_name} className={classes.item}>
            <span className={classes.rank}>{index + 1}</span>
            <span className={classes.dayName}>{day.day_name}</span>
            {/* השורה של ה-count נמחקה */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusyDays;
