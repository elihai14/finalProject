import React, { useState, useEffect } from "react";
import classes from "./busyHours.module.css";

// קומפוננטה להצגת מפת עומסים לפי שעות פעילות
function BusyHours({ startDate, endDate, setHoursRank }) {
  const [hoursData, setHoursData] = useState({});
  const [businessHours, setBusinessHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:5000/appointments/busy-hours?startDate=${startDate}&endDate=${endDate}`
        );
        if (!res.ok) throw new Error("שגיאה במשיכת נתוני עומס");

        const data = await res.json();

        const startHour = parseInt(data.min_start.split(":")[0], 10);
        const endHour = parseInt(data.max_end.split(":")[0], 10);

        const generated = [];
        for (let i = startHour; i < endHour; i++) {
          generated.push(`${i < 10 ? "0" + i : i}:00`);
        }
        setBusinessHours(generated);

        const map = {};
        (data.appointments || []).forEach((item) => {
          map[item.hour] = Number(item.total) || 0;
        });
        setHoursData(map);

        // מיון כל שעות הפעילות לפי כמות התורים בפועל מהגבוה לנמוך
        const ranked = generated
          .map((hourStr) => {
            const hourKey = parseInt(hourStr.split(":")[0], 10);
            return {
              hour: hourStr,
              count: map[hourKey] || 0,
            };
          })
          .sort((a, b) => b.count - a.count);

        if (setHoursRank) {
          setHoursRank(ranked);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate, setHoursRank]);

  const getLoadClass = (count) => {
    if (count >= 8) return classes.highLoad;
    if (count >= 5) return classes.mediumLoad;
    return classes.lowLoad;
  };

  if (loading) return <div>טוען נתונים...</div>;
  if (error) return <div style={{ color: "red" }}>שגיאה: {error}</div>;

  return (
    <div className={classes.container}>
      <h3>דירוג עומס ממוצע </h3>
      <div className={classes.hoursGrid}>
        {businessHours.map((hour) => {
          const hourKey = parseInt(hour.split(":")[0], 10);
          const count = hoursData[hourKey] || 0;
          return (
            <div
              key={hour}
              className={`${classes.hourCard} ${getLoadClass(count)}`}
            >
              <div className={classes.timeLabel}>{hour}</div>
              <div className={classes.countLabel}>{count} תורים</div>
            </div>
          );
        })}
      </div>

      <div className={classes.legend_container}>
        <div className={classes.legend_item}>
          <span className={`${classes.legend_dot} ${classes.red}`}></span> עמוס
          (8+)
        </div>
        <div className={classes.legend_item}>
          <span className={`${classes.legend_dot} ${classes.yellow}`}></span>{" "}
          בינוני (5+)
        </div>
        <div className={classes.legend_item}>
          <span className={`${classes.legend_dot} ${classes.green}`}></span> לא
          עמוס
        </div>
      </div>
    </div>
  );
}

export default BusyHours;
