import React, { useState, useEffect } from 'react';
import AppCard from '../appCard/AppCard';
import classes from './appList.module.css';
import DashboardStats from '../dashboardStats/DashboardStats';  
import AppointmentsFilter from '../appointmentsFilter/AppointmentsFilter';
import Swal from 'sweetalert2'; 

export default function AppList({ refresh }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [barbers, setBarbers] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    service: "",
    user_name: "",
    barber_name: ""
  });

  const userStatus = localStorage.getItem("userStatus");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchAppointments();
  }, [refresh, userEmail, userStatus]);

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
        // עדכון דינמי של כל הרשימות (שירותים, ספרים ולקוחות) בכל טעינה
        setServices([...new Set(data.map((app) => app.service_name).filter(Boolean))]);
        setBarbers([...new Set(data.map((app) => app.barberName).filter(Boolean))]);
        setCustomers([...new Set(data.map((app) => app.customerName).filter(Boolean))]);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      setError("שגיאה בטעינת הנתונים");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    // 1. הודעת אישור לפני הביטול
    const result = await Swal.fire({
      title: 'האם לבטל את התור?',
      text: "פעולה זו תבטל את התור ולא ניתן יהיה לשחזרו.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dfb76c', // הצבע שמשתלב אצלך
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'כן, בטל תור',
      cancelButtonText: 'לא, חזור',
      background: '#1a1a1a', // תואם לעיצוב הכהה שלך
      color: '#fff'
    });

    // 2. אם המשתמש לחץ על "כן"
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/appointments/cancel/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          // הצלחה - הודעה יפה
          Swal.fire({
            title: 'בוצע!',
            text: 'התור בוטל בהצלחה.',
            icon: 'success',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#dfb76c'
          });
          
          // רענון הרשימה אחרי הביטול
          fetchAppointments();
        } else {
          Swal.fire('שגיאה', 'לא הצלחנו לבטל את התור.', 'error');
        }
      } catch (err) {
        Swal.fire('שגיאה', 'יש תקלה בשרת, נסה שוב מאוחר יותר.', 'error');
      }
    }
  };

  let arr = appointments.map((app) => {
    const cardData = {
      id: app.appointment_id,
      date: app.appointment_date ? app.appointment_date.split("T")[0] : "לא צוין",
      time: app.appointment_time ? app.appointment_time.substring(0, 5) : "",
      barberName: app.barberName,
      customerName: app.customerName, 
      serviceName: app.service_name,
      price: app.price ? `₪${app.price}` : null
    };

    return (
      <AppCard 
        key={app.appointment_id} 
        app={cardData} 
        onCancel={() => handleCancelAppointment(app.appointment_id)} 
      />
    );
  });

  return (
    <div className={classes.appList}>
      <AppointmentsFilter 
        filters={filters} 
        setFilters={setFilters} 
        onSearch={fetchAppointments} 
        services={services}
        barbers={barbers}
        customers={customers}
        userStatus={userStatus}
      />

      {successMessage && <div className={classes.success_message}>{successMessage}</div>}
      {error && <div className={classes.error_message}>{error}</div>}

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