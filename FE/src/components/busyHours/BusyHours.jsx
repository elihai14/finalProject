import React, { useState, useEffect } from 'react';
import classes from './busyHours.module.css';

function BusyHours() {
  const [hoursData, setHoursData] = useState({});
  const [businessHours, setBusinessHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. הגדרת שעות פעילות (זהו המערך הסטטי לשעות)
        const generated = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
        setBusinessHours(generated);

        // 2. משיכת נתוני עומס
        const loadRes = await fetch("http://localhost:5000/appointments/busy-hours");
        if (!loadRes.ok) throw new Error("שגיאה במשיכת נתוני עומס");
        
        const loadDataArray = await loadRes.json(); 
        
        // 3. יצירת מפת עומסים
        const dataMap = {};
        loadDataArray.forEach(item => {
           // מוודא שהשעה בפורמט HH:00
           const timeKey = item.appointment_time.substring(0, 5); 
           dataMap[timeKey] = item.total_count;
        });

        console.log("נתוני עומס מוכנים:", dataMap);
        setHoursData(dataMap);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLoadClass = (count) => {
    // לפי הנתונים שראינו ב-Console (8, 5, 2), אלו הרמות:
    if (count >= 8) return classes.highLoad;    // אדום
    if (count >= 5) return classes.mediumLoad;  // צהוב
    return classes.lowLoad;                     // ירוק
  };

  if (loading) return <div>טוען נתונים...</div>;
  if (error) return <div style={{color: 'red'}}>שגיאה: {error}</div>;

  return (
    <div className={classes.container}>
      <h3>דירוג עומס ממוצע (חודש {new Date().toLocaleString('he-IL', { month: 'long' })})</h3>
      <div className={classes.hoursGrid}>
        {businessHours.map((hour) => {
          const count = hoursData[hour] || 0;
          return (
            <div key={hour} className={`${classes.hourCard} ${getLoadClass(count)}`}>
              <div className={classes.timeLabel}>{hour}</div>
              <div className={classes.countLabel}>{count} תורים</div>
            </div>
          );
        })}
      </div>
      
      <div className={classes.legend_container}>
        <div className={classes.legend_item}><span className={`${classes.legend_dot} ${classes.red}`}></span> עמוס (8+)</div>
        <div className={classes.legend_item}><span className={`${classes.legend_dot} ${classes.yellow}`}></span> בינוני (5+)</div>
        <div className={classes.legend_item}><span className={`${classes.legend_dot} ${classes.green}`}></span> לא עמוס</div>
      </div>
    </div>
  );
}

export default BusyHours;