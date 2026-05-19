import React, { useState, useEffect } from 'react';
import AppCard from '../appCard/AppCard';
import NewAppForm from '../newAppForm/NewAppForm'; 
import classes from './appList.module.css';
import DashboardStats from '../dashboardStats/DashboardStats';  

export default function AppList({ refresh }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- להדביק כאן ---
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    service: "",
    user_name: "",
  });

  useEffect(() => {
    fetchAppointments();
  }, [refresh]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    const requestBody = { ...filters };
    if (userStatus === "ספר") requestBody.barberMail = userEmail;
    else if (userStatus === "לקוח") requestBody.clientMail = userEmail;

    try {
      const response = await fetch(`http://localhost:5000/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (response.ok) {
        setAppointments(data);
        if (services.length === 0) {
          const unique = [...new Set(data.map((app) => app.service_name))];
          setServices(unique);
        }
      } else {
        setAppointments([]);
      }
    } catch (err) {
      setError("שגיאה");
    } finally {
      setIsLoading(false);
    }
  };

  const userStatus = localStorage.getItem("userStatus");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchAppointments();
  }, [userEmail, userStatus]);

  const handleCancelAppointment = async (id) => {
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/appointments/cancel/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Status:", response.status, "ID sent:", id);
      if (response.ok) {
        setSuccessMessage("התור בוטל בהצלחה!");
        setAppointments(
          appointments.filter((app) => app.appointment_id !== id)
        );

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

  // רינדור התורים בצורה חכמה ואחידה דרך ה-AppCard המעוצב!
  let arr = appointments.map((app) => {
    const appDate = app.appointment_date
      ? app.appointment_date.split("T")[0]
      : "";

    let formattedApp = {
      id: app.appointment_id,
      date: appDate,
      time: app.time,
      serviceName: app.service_name,
    };

    // התאמת הנתונים לפי סוג המשתמש כדי שלא יתבלגן
    if (userStatus === "מנהל") {
      formattedApp.barberName = `ספר: ${app.barberName}`;
      formattedApp.clientEmail = app.customerName;
    } else if (userStatus === "ספר") {
      formattedApp.clientEmail = app.customerName;
    } else if (userStatus === "לקוח") {
      formattedApp.barberName = app.barberName;
      formattedApp.price = app.price ? `₪${app.price}` : "₪180";
    }

    return (
      <AppCard
        key={app.appointment_id}
        app={formattedApp}
        onCancel={() => handleCancelAppointment(app.appointment_id)}
      />
    );
  });

  return (
    <div className={classes.appList}>
      {/* 1. מציג את הגרפים לספר ומנהל בחלק העליון של הדף */}
      {(userStatus === "ספר" || userStatus === "מנהל") && (
        <DashboardStats userStatus={userStatus} />
      )}

      
        <div className={classes.filterBar}>
          <input
              type="date"
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          <input
            type="date"
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            min={filters.startDate}
          />
          <select
            onChange={(e) =>
              setFilters({ ...filters, service: e.target.value })
            }
          >
            <option value="">כל השירותים</option>
            {services.map((service_name, index) => (
              <option key={index} value={service_name}>
                {service_name}
              </option>
            ))}
          </select>
            {
              (userStatus === "מנהל" || userStatus === "ספר") &&
                  <input
                type="text"
                placeholder="שם הלקוח..."
                className={classes.filterInput}
                onChange={(e) =>
                  setFilters({ ...filters, user_name: e.target.value })
                }
              />
            }

          {(userStatus === "מנהל" || userStatus === "לקוח") &&
            <input
            type="text"
            placeholder="שם ספר..."
            className={classes.filterInput}
            onChange={(e) =>
              setFilters({ ...filters, user_name: e.target.value })
            }
          />
          }
          
          <button onClick={fetchAppointments}>סנן</button>
        </div>
      



      {successMessage && (
        <div className={classes.success_message}>{successMessage}</div>
      )}
      {error && <div className={classes.error_message}>{error}</div>}

      {/* 3. רשימת התורים שנקבעו תופיע תמיד למטה */}
      <div className={classes.appointments_container}>
        {isLoading ? (
          <div className={classes.loading_text}>טוען תורים...</div>
        ) : (
          arr
        )}
      </div>
    </div>
  );
}