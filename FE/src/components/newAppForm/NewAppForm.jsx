import classes from "./newAppForm.module.css";
import { getHoursSelect } from "../../../js/mainFunctionView";
import { useState, useEffect } from "react";

export default function NewAppForm() {
  const [barbers, setBarbers] = useState([]); // מצב לשמירת רשימת הספרים
  const [loading, setLoading] = useState(true);
  const [selectedBarber, setSelectedBarber] = useState(""); // הספר שנבחר
  const [services, setServices] = useState([]); // שירותי הספר שנבחר
  const [loadingServices, setLoadingServices] = useState(false);
  const [constraints, setConstraints] = useState([]); // ימי העבודה של הספר הנבחר
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [hours, setHours] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // פונקציה אסינכרונית למשיכת הנתונים
    const fetchBarbers = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/ספר");
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
          setLoading(false);
        } else {
          setBarbers(data); // שמירת הנתונים ב-State
          setLoading(false);
        }
      } catch (error) {
        console.error("שגיאה בטעינת הספרים:", error);
      }
    };

    fetchBarbers();
  }, []);

  // פונקציה שנייה: הבאת שירותים לפי הספר שנבחר (רצה בכל פעם ש-selectedBarber משתנה)
  useEffect(() => {
    if (!selectedBarber) {
      setServices([]); // אם לא נבחר ספר, נקה את רשימת השירותים
      return;
    }

    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        // שים לב: כאן אתה שולח את המייל של הספר כפרמטר ל-API שלך
        const response = await fetch(`http://localhost:5000/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barberMail: selectedBarber }),
        });
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("שגיאה בטעינת שירותים:", error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [selectedBarber]);
  useEffect(() => {
    if (!selectedBarber || !selectedService || !selectedDate) return;

    const fetchHours = async () => {
      const result = await getHoursSelect(
        selectedBarber,
        selectedDate,
        selectedService
      );

      setHours(result);
    };

    fetchHours();
  }, [selectedBarber, selectedService, selectedDate]);

  return (
    <div className={classes.container} id="addApp-form">
      <form id="appointmentForm" className={classes.main_form}>
        <div className={classes.form_group}>
          <label htmlFor="barberSelect">בחר ספר</label>
          <select
            name="barberSelect"
            id="barberSelect"
            className={classes.form_input}
            onChange={(e) => setSelectedBarber(e.target.value)} // מעדכן את ה-State
            required
          >
            <option value="">
              {loading
                ? "טוען נתונים..."
                : barbers.length === 0
                ? "אין ספרים עדיין"
                : "-- בחר ספר --"}
            </option>
            {barbers.map((e) => (
              <option key={e.mail_address} value={e.mail_address}>
                {e.user_name}
              </option>
            ))}
          </select>
        </div>
        <div className={classes.form_group}>
          <label htmlFor="serviceSelect">בחר שירות</label>
          <select
            name="serviceSelect"
            id="serviceSelect"
            className={classes.form_input}
            disabled={!selectedBarber}
            onChange={(e) => setSelectedService(e.target.value)}
            required
          >
            <option value="">
              {!selectedBarber
                ? "בחר ספר קודם"
                : loadingServices
                ? "טוען נתונים..."
                : services.length === 0
                ? "אין שירותים עדיין"
                : "-- בחר שירות --"}
            </option>
            {services.map((e) => (
              <option key={e.service_name} value={e.service_name}>
                {e.service_name}
              </option>
            ))}
          </select>
        </div>
        <div className={classes.form_group}>
          <label htmlFor="dateInput">בחר תאריך</label>
          <input
            type="date"
            id="dateInput"
            className={classes.form_input}
            disabled={!selectedBarber && !selectedService}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today}
            required
          />
        </div>

        <div className={classes.form_group}>
          <label htmlFor="hourSelect">בחר שעה</label>
          <select
            id="hourSelect"
            className={classes.form_input}
            disabled={!selectedBarber && !selectedService && !selectedDate}
            required
          >
            <option value="">
              {hours.length === 0 ? "אין שעות זמינות" : "-- בחר שעה --"}
            </option>

            {hours.map((h, i) => (
              <option key={i} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={classes.btn_submit}>
          קבע תור
        </button>
      </form>
    </div>
  );
}
