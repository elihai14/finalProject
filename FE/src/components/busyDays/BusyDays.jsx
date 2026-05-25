import React, { useState, useEffect } from 'react';
import classes from './busyDays.module.css';

function BusyDays() {
  const [busyDays, setBusyDays] = useState([]);

  useEffect(() => {
  fetch("http://localhost:5000/appointments/busy-days", {
    method: "POST", // חשוב: POST כדי לשלוח תאריכים
    credentials: "include", // חשוב: כדי שהעוגיות יעברו
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      startDate: '2026-05-01', // או הדינמי שתרצה
      endDate: '2026-05-31' 
    })
  })
    .then(res => res.json())
    .then(data => {
      // כאן אנחנו מוודאים שזה תמיד מערך, גם אם השרת החזיר שגיאה
      setBusyDays(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      console.error("שגיאה:", err);
      setBusyDays([]); 
    });
}, []);

  return (
    <div className={classes.container}>
      <h3>ימים עמוסים ביותר</h3>
      <div className={classes.list}>
        {busyDays.map((day, index) => (
          <div key={day.day_name} className={classes.item}>
            <span className={classes.rank}>{index + 1}</span>
            <span className={classes.dayName}>{day.day_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusyDays;