// ייבוא הוקים וספריות של React
import React, { useState, useEffect } from "react";
// ייבוא קומפוננטת כרטיס חלון הזמינות
import AvailabilityCard from "../availabilityCard/AvailabilityCard";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./availabilityList.module.css";
// ייבוא פונקציות עזר לשליפת אילוצים/זמינות וביטול אילוץ
import {
  fetchAvailability,
  handleCancelConstraint,
} from "../../../js/mainFunctionView";

// קומפוננטה להצגת רשימת חלוני הזמינות והאילוצים של הספר
export default function AvailabilityList({ refresh }) {
// ניהול משתני State עבור הרשימה, טעינה, הודעות שגיאה/הצלחה ופילטר תאריכים
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

// טעינת רשימת חלוני הזמינות בכל שינוי ב-refresh
  useEffect(() => {
    fetchAvailability(setIsLoading, setAvailability, setError, filters);
  }, [refresh]);

// פונקציה לטיפול בביטול אילוץ/חלון זמן
  const cancleCons = async (id) => {
    handleCancelConstraint(
      id,
      setError,
      setSuccessMessage,
      setAvailability,
      availability
    );
  };

  // רינדור התורים בצורה חכמה ואחידה דרך ה-AppCard המעוצב!
// המרת נתוני האילוצים ממאגר הנתונים לרכיבי AvailabilityCard
  let arr = availability.map((cons) => {
    const constDate = cons.date ? cons.date.split("T")[0] : "";

    let formattedCons = {
      id: cons.constraint_code,
      date: constDate,
      startTime: cons.start_time.slice(0, 5),
      endTime: cons.end_time.slice(0, 5),
    };

    return (
      <AvailabilityCard
        key={cons.constraint_code}
        cons={formattedCons}
        onCancel={() => cancleCons(cons.constraint_code)}
      />
    );
  });

  return (
    <div>
{/* סרגל סינון לפי תאריכים (מתאריך / עד תאריך) */}
      <div className={classes.filterBar}>
  
        <div className={classes.dateWrapper}>
{/* שדה בחירת תאריך סיום */}
          <div>
            <input
              id="endDate"
              min={filters.startDate ? filters.startDate : ""}
              value={filters.endDate}
              type="date"
              onChange={(e) => {
                
                const updatedValue = e.target.value;
                const updatedFilters = { ...filters, endDate: updatedValue };

                setFilters(updatedFilters); // מעדכן את המסך
                fetchAvailability(
                  setIsLoading,
                  setAvailability,
                  setError,
                  updatedFilters
                ); // שולח את המידע המעודכן לשרת
              }}
            />
            <label htmlFor="endDate" style={{ fontSize: "14px" }}>
              {" "}
              :עד{" "}
            </label>
          </div>

{/* שדה בחירת תאריך התחלה */}
          <div>
            <input
              id="startDate"
              type="date"
              onChange={(e) => {
                const updatedValue = e.target.value;
                const updatedFilters = { ...filters, startDate: updatedValue, endDate:updatedValue };

                setFilters(updatedFilters); // מעדכן את המסך
                fetchAvailability(
                  setIsLoading,
                  setAvailability,
                  setError,
                  updatedFilters
                ); // שולח את המידע המעודכן לשרת
              }}
            />
            <label htmlFor="startDate" style={{ fontSize: "14px" }}>
              {" "}
              :מ
            </label>
          </div>
        </div>
      </div>

{/* הצגת הודעת הצלחה במידה וקיימת */}
      {successMessage && (
        <div className={classes.success_message}>{successMessage}</div>
      )}
{/* הצגת הודעת שגיאה במידה וקיימת */}
      {error && <div className={classes.error_message}>{error}</div>}

{/* אזור הצגת הכרטיסים */}
      <div className={classes.appointments_container}>
{/* הצגת הודעת טעינה או רשימת הכרטיסים */}
        {isLoading ? (
          <div className={classes.loading_text}>טוען אילוצים...</div>
        ) : (
          arr
        )}
      </div>
    </div>
  );
}