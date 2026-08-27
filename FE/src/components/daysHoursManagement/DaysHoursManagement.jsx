import { getDays } from "../../../js/mainFunctionView";
import classes from "./daysHoursManagement.module.css";
import DayCard from "../dayCard/DayCard";
import { useEffect, useState } from "react";

export default function DaysHoursManagement() {
  const [days, setDays] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchDaysData = async () => {
      try {
        const data = await getDays();
        setDays(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("שגיאה בטעינת הימים:", error);
        setDays([]);
      }
    };

    fetchDaysData();
  }, [refresh]);

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>שעות פעילות</h3>

      <div className={classes.grid}>
        {!days || days.length === 0 ? (
          <p className={classes.empty}>שגיאה בטעינת השעות</p>
        ) : (
          days.map((d) => (
            <DayCard key={d.day} dayDetails={d} setRefresh={setRefresh} />
          ))
        )}
      </div>
    </div>
  );
}
