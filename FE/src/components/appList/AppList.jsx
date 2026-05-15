import React, { useState, useEffect } from 'react';
import AppCard from '../appCard/AppCard';
import NewAppForm from '../newAppForm/NewAppForm'; 
import classes from './appList.module.css';
import DashboardStats from '../dashboardStats/DashboardStats';  

export default function AppList() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- להדביק כאן ---
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    service: '',
    clientMail: ''
  });

  const fetchAppointments = async () => {
    setIsLoading(true);
    const requestBody = { ...filters }; 
    if (userStatus === 'ספר') requestBody.barberMail = userEmail;
    else if (userStatus === 'לקוח') requestBody.clientMail = userEmail;

    try {
      const response = await fetch(`http://localhost:5000/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      setAppointments(response.ok ? data : []);
    } catch (err) { setError("שגיאה"); }
    finally { setIsLoading(false); }
  };


  const userStatus = localStorage.getItem("userStatus"); 
  const userEmail = localStorage.getItem("userEmail");

  // const fetchAppointments = async () => {
  //   if (!userEmail) return;

  //   setIsLoading(true);
  //   setError("");

  //   const requestBody = {};
  //   if (userStatus === 'ספר') {
  //     requestBody.barber_mail_address = userEmail;
  //   } else if (userStatus === 'לקוח') {
  //     requestBody.client_mail_address = userEmail;
  //   }

  //   try {
  //     const response = await fetch(`http://localhost:5000/appointments`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(requestBody)
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       setAppointments(data);
  //     } else {
  //       setError(data.message || "לא נמצאו תורים במערכת");
  //     }
  //   } catch (err) {
  //     setError("שגיאת תקשורת עם השרת");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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

  // רינדור התורים בצורה חכמה ואחידה דרך ה-AppCard המעוצב!
  let arr = appointments.map((app) => {
    const appDate = app.appointment_date ? app.appointment_date.split('T')[0] : '';
    
    let formattedApp = {
      id: app.id,
      date: appDate,
      time: app.time,
      serviceName: app.service_name,
    };

    // התאמת הנתונים לפי סוג המשתמש כדי שלא יתבלגן
    if (userStatus === 'מנהל') {
      formattedApp.barberName = `ספר: ${app.barberName}`;
      formattedApp.clientEmail = app.customerName;
    } else if (userStatus === 'ספר') {
      formattedApp.clientEmail = app.customerName;
    } else if (userStatus === 'לקוח') {
      formattedApp.barberName = app.barberName;
      formattedApp.price = app.price ? `₪${app.price}` : "₪180";
    }

    return (
      <AppCard 
        key={app.id || app.appointment_id} 
        app={formattedApp} 
        onCancel={() => handleCancelAppointment(app.id)} 
      />
    );
  });

  return (
    <div className={classes.appList}>
      
      {/* 1. מציג את הגרפים לספר ומנהל בחלק העליון של הדף */}
      {(userStatus === 'ספר' || userStatus === 'מנהל') && (
        <DashboardStats userStatus={userStatus} />
      )}

      {(userStatus === 'ספר' || userStatus === 'מנהל') && (
        <div className={classes.filterBar}>
          <input type="date" onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
          <input type="date" onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
          <select onChange={(e) => setFilters({...filters, service: e.target.value})}>
            <option value="">כל השירותים</option>
            <option value="תספורת גבר">תספורת גבר</option>
            <option value="זקן">זקן</option>
          </select>
          <button onClick={fetchAppointments}>סנן</button>
        </div>
      )}

      {/* 2. מציג את טופס קביעת התור רק אם זה לקוח */}
      {userStatus === 'לקוח' && <NewAppForm />}

      {successMessage && <div className={classes.success_message}>{successMessage}</div>}
      {error && <div className={classes.error_message}>{error}</div>}

      {/* 3. רשימת התורים שנקבעו תופיע תמיד למטה */}
      <div className={classes.appointments_container}>
        {isLoading ? <div className={classes.loading_text}>טוען תורים...</div> : arr}
      </div>

    </div>
  );
}