import { useState } from "react";
import { getHoursArr } from "../../../js/mainFunctionView";
import classes from "./dayCard.module.css";

export default function DayCard({ dayDetails, setRefresh }) {
  const hours = getHoursArr("00:00", "23:59");
  const [endHours, setEndHours] = useState([]);
  const [editForm, setEditForm] = useState({
    newStart: dayDetails.start,
    newEnd: dayDetails.end,
  });
  const [isEditing, setIsEditing] = useState(false);

  function handleChangeStart(e) {
    const selectedStart = e.target.value;
    const [h, m] = selectedStart.split(":");
    const newHours = (parseInt(h, 10) + 1) % 24;
    const formattedHours = String(newHours).padStart(2, "0");
    const nextHour = `${formattedHours}:${m}`;
    const availableEndHours = getHoursArr(nextHour, "23:59");

    setEditForm((prev) => ({
      ...prev,
      newStart: selectedStart,
      newEnd: availableEndHours.includes(prev.newEnd)
        ? prev.newEnd
        : availableEndHours[0] || selectedStart,
    }));
    setEndHours(availableEndHours);
  }

  const startEditing = () => {
    setEditForm({
      newStart: dayDetails.start,
      newEnd: dayDetails.end,
    });
    setEndHours(getHoursArr(dayDetails.start || "00:00", "23:59"));
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:5000/daysHours/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          day: dayDetails.day,
          newStart: editForm.newStart,
          newEnd: editForm.newEnd,
        }),
      });
      if (res.ok) {
        setRefresh((prev) => !prev);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update hours:", err);
    }
  };

  return (
    <div className={classes.card}>
      <div className={classes.info}>
        <h4>{dayDetails.day}</h4>
      </div>

      <div className={classes.center}>
        {!isEditing ? (
          <div className={classes.timeDisplay}>
            <span>{dayDetails.start}</span>
            <span>-</span>
            <span>{dayDetails.end}</span>
          </div>
        ) : (
          <div className={classes.editBox}>
            <select value={editForm.newStart} onChange={handleChangeStart}>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span>-</span>
            <select
              value={editForm.newEnd}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, newEnd: e.target.value }))
              }
            >
              {endHours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={classes.actions}>
        {!isEditing ? (
          <button className={classes.editBtn} onClick={startEditing}>
            ערוך
          </button>
        ) : (
          <>
            <button className={classes.saveBtn} onClick={handleUpdate}>
              שמור
            </button>
            <button
              className={classes.cancelBtn}
              onClick={() => setIsEditing(false)}
            >
              ביטול
            </button>
          </>
        )}
      </div>
    </div>
  );
}
