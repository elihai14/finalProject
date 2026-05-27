import React, { useState, useEffect } from 'react';
import classes from './busyDays.module.css';

function BusyDays() {
  const [busyDays, setBusyDays] = useState([]);

//   useEffect(() => {
//     // השתמש ב-GET פשוט מול הראוטר המעודכן שלנו
//     fetch("http://localhost:5000/appointments/busy-days")
//       .then(res => res.json())
//       .then(data => {
//         setBusyDays(Array.isArray(data) ? data : []);
//       })
//       .catch(err => {
//         console.error("שגיאה במשיכת ימים עמוסים:", err);
//         setBusyDays([]); 
//       });
//   }, []);
        useEffect(() => {
    const fetchData = async () => {
        try {
        const response = await fetch("http://localhost:5000/appointments/busy-days");
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        setBusyDays(Array.isArray(data) ? data : []);
        } catch (err) {
        console.error("שגיאה במשיכת נתונים:", err);
        }
    };

    fetchData();
    }, []);

  return (
    <div className={classes.container}>
      <h3>ימים עמוסים בחודש {new Date().toLocaleString('he-IL', { month: 'long' })}</h3>
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