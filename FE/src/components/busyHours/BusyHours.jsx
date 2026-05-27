// import React, { useState, useEffect } from 'react';
// import classes from './busyHours.module.css';

// function BusyHours() {
//   const [hoursData, setHoursData] = useState({});
//   const [businessHours, setBusinessHours] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         // 1. הגדרת שעות פעילות (זהו המערך הסטטי לשעות)
//         const generated = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
//         setBusinessHours(generated);

//         // 2. משיכת נתוני עומס
//         const loadRes = await fetch("http://localhost:5000/appointments/busy-hours");
//         if (!loadRes.ok) throw new Error("שגיאה במשיכת נתוני עומס");
        
//         const loadDataArray = await loadRes.json(); 
        
//         // 3. יצירת מפת עומסים
//         const dataMap = {};
//         loadDataArray.forEach(item => {
//            // מוודא שהשעה בפורמט HH:00
//            const timeKey = item.appointment_time.substring(0, 5); 
//            dataMap[timeKey] = item.total_count;
//         });

//         console.log("נתוני עומס מוכנים:", dataMap);
//         setHoursData(dataMap);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error loading data:", err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const getLoadClass = (count) => {
//     // לפי הנתונים שראינו ב-Console (8, 5, 2), אלו הרמות:
//     if (count >= 8) return classes.highLoad;    // אדום
//     if (count >= 5) return classes.mediumLoad;  // צהוב
//     return classes.lowLoad;                     // ירוק
//   };

//   if (loading) return <div>טוען נתונים...</div>;
//   if (error) return <div style={{color: 'red'}}>שגיאה: {error}</div>;

//   return (
//     <div className={classes.container}>
//       <h3>דירוג עומס ממוצע (חודש {new Date().toLocaleString('he-IL', { month: 'long' })})</h3>
//       <div className={classes.hoursGrid}>
//         {businessHours.map((hour) => {
//           const count = hoursData[hour] || 0;
//           return (
//             <div key={hour} className={`${classes.hourCard} ${getLoadClass(count)}`}>
//               <div className={classes.timeLabel}>{hour}</div>
//               <div className={classes.countLabel}>{count} תורים</div>
//             </div>
//           );
//         })}
//       </div>
      
//       <div className={classes.legend_container}>
//         <div className={classes.legend_item}><span className={`${classes.legend_dot} ${classes.red}`}></span> עמוס (8+)</div>
//         <div className={classes.legend_item}><span className={`${classes.legend_dot} ${classes.yellow}`}></span> בינוני (5+)</div>
//         <div className={classes.legend_item}><span className={`${classes.legend_dot} ${classes.green}`}></span> לא עמוס</div>
//       </div>
//     </div>
//   );
// }

// export default BusyHours;
import React, { useState, useEffect } from 'react';
import classes from './busyHours.module.css';

function BusyHours() {
  const [hoursData, setHoursData] = useState({});
  const [businessHours, setBusinessHours] = useState([]); // כאן נשמור את טווח השעות הדינמי
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/appointments/busy-hours");
        if (!res.ok) throw new Error("שגיאה במשיכת נתוני עומס");
        
        const data = await res.json(); 
        // data מכיל: { min_start, max_end, appointments: [{hour: 8, total: 2}, ...] }
        
        const startHour = parseInt(data.min_start.split(':')[0]);
        const endHour = parseInt(data.max_end.split(':')[0]);

        // 1. יצירת טווח שעות דינמי
        const generated = [];
        for (let i = startHour; i < endHour; i++) {
            generated.push(`${i < 10 ? '0' + i : i}:00`);
        }
        setBusinessHours(generated);

        // 2. המרה ממערך של אובייקטים למפה נוחה לחיפוש (כמו שהקוד שלך מצפה)
        const map = {};
        data.appointments.forEach(item => {
            map[item.hour] = item.total;
        });
        setHoursData(map);
        
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
    if (count >= 8) return classes.highLoad;
    if (count >= 5) return classes.mediumLoad;
    return classes.lowLoad;
  };

  if (loading) return <div>טוען נתונים...</div>;
  if (error) return <div style={{color: 'red'}}>שגיאה: {error}</div>;

  return (
    <div className={classes.container}>
      <h3>דירוג עומס ממוצע (חודש {new Date().toLocaleString('he-IL', { month: 'long' })})</h3>
      <div className={classes.hoursGrid}>
        {businessHours.map((hour) => {
          // חילוץ השעה כמספר לחיפוש ב-hourly_stats (למשל "09:00" -> 9)
          const hourKey = parseInt(hour.split(':')[0]);
          const count = hoursData[hourKey] || 0;
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