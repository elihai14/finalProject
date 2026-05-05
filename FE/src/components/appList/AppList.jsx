import React, { useState, useEffect } from 'react';
import AppCard from '../appCard/AppCard';
import NewAppForm from '../newAppForm/NewAppForm'; // ייבוא טופס קביעת התור
import classes from './appList.module.css';

export default function AppList() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // שליפת הסטטוס והמייל מה-localStorage (הערכים מגיעים בעברית מה-DB)
  const userStatus = localStorage.getItem("userStatus"); 
  const userEmail = localStorage.getItem("userEmail");

  const fetchAppointments = async () => {
    if (!userEmail) return;

    setIsLoading(true);
    setError("");

    const requestBody = {};
    if (userStatus === 'ספר') {
      requestBody.barberMail = userEmail;
    } else if (userStatus === 'לקוח') {
      requestBody.clientMail = userEmail;
    }
    // אם המשתמש הוא "מנהל" - הבקשה נשארת ריקה והשרת מחזיר הכל

    try {
      const response = await fetch(`http://localhost:5000/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        setAppointments(data);
      } else {
        setError(data.message || "לא נמצאו תורים במערכת");
      }
    } catch (err) {
      setError("שגיאת תקשורת עם השרת");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userEmail, userStatus]);

  const handleCancelAppointment = async (id) => {
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`http://localhost:5000/appointments/cancel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        setSuccessMessage("התור בוטל בהצלחה!");
        setAppointments(appointments.filter(app => app.id !== id));

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);

      } else {
        setError("לא ניתן לבטל את התור כרגע");
      }
    } catch (err) {
      setError("שגיאת תקשורת בביטול התור");
    }
  };

  let arr = appointments.map((app) => {
    // 1. תצוגה עבור מנהל
    if (userStatus === 'מנהל') {
      return (
        <div key={app.id} className={classes.appointment_card}>
          <div className={classes.time_section}>
            <span className={classes.date}>{app.appointment_date ? app.appointment_date.split('T')[0] : ''}</span>
            <span className={classes.time}>{app.time}</span>
            <span className={classes.barberName}>ספר: {app.barber_mail_address}</span>
            <span className={classes.clientName}>לקוח: {app.client_mail_address}</span>
          </div>

          <div className={classes.details_section}>
            <h3 className={classes.service_name}>{app.service_name}</h3>
            <button className={classes.cancel_btn} onClick={() => handleCancelAppointment(app.id)}>
              ביטול תור
            </button>
          </div>
        </div>
      );
    }
    // 2. תצוגה עבור ספר
    else if (userStatus === 'ספר') {
      return (
        <div key={app.id} className={classes.appointment_card}>
          <div className={classes.time_section}>
            <span className={classes.date}>{app.appointment_date ? app.appointment_date.split('T')[0] : ''}</span>
            <span className={classes.time}>{app.time}</span>
            <span className={classes.barberName}>לקוח: {app.client_mail_address}</span>
          </div>

          <div className={classes.details_section}>
            <h3 className={classes.service_name}>{app.service_name}</h3>
            <button className={classes.cancel_btn} onClick={() => handleCancelAppointment(app.id)}>
              ביטול תור
            </button>
          </div>
        </div>
      );
    } 
    // 3. תצוגה עבור לקוח
    else {
      const formattedApp = {
        id: app.id,
        serviceName: app.service_name,
        barberName: app.barber_mail_address,
        date: app.appointment_date ? app.appointment_date.split('T')[0] : '',
        time: app.time,
        price: app.price || "₪70"
      };
      return <AppCard key={app.id} app={formattedApp} />;
    }
  });

  return (
    <div className={classes.appList}>
      {/* הצגת טופס קביעת התור בראש העמוד רק אם המשתמש הוא לקוח */}
      {userStatus === 'לקוח' && <NewAppForm />}

      {successMessage && <div className={classes.success_message}>{successMessage}</div>}
      {error && <div className={classes.error_message}>{error}</div>}

      {isLoading ? <div>טוען תורים...</div> : arr}
    </div>
  );
}