import React, { useState, useEffect } from 'react';
import AppCard from '../appCard/AppCard';
import classes from './appList.module.css';
import AppointmentsFilter from '../appointmentsFilter/AppointmentsFilter';
import Swal from 'sweetalert2';

export default function AppList({ refresh }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    service: "",
    user_name: "",
    barber_name: ""
  });

  const userStatus = localStorage.getItem("userStatus");
  const userEmail = localStorage.getItem("userEmail");

  // 1. פונקציה להבאת תורים (הפונקציה המרכזית)
  const fetchAppointments = async (customFilters = filters) => {
    setIsLoading(true);
    setError("");

    const requestBody = { ...customFilters };
    if (userStatus === "ספר") requestBody.barber_mail  = userEmail;
    else if (userStatus === "לקוח") requestBody.clientMail = userEmail;

    try {
      const response = await fetch("http://localhost:5000/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      setAppointments(response.ok ? data : []);
    } catch (err) {
      setError("שגיאה בטעינת הנתונים");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. טעינת אופציות סינון (פעם אחת בלבד!)
  const fetchFilterOptions = async () => {
    try {
      const requestBody = {};
      if (userStatus === "ספר") requestBody.barber_mail  = userEmail;
      else if (userStatus === "לקוח") requestBody.clientMail = userEmail;

      const response = await fetch("http://localhost:5000/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (response.ok) {
        setServices([...new Set(data.map(app => app.service_name).filter(Boolean))]);
        setBarbers(
          data
            .map(app => ({
              user_name: app.barberName,
              mail_address: app.barber_mail_address
            }))
            .filter(
              (barber, index, self) =>
                barber.mail_address &&
                index === self.findIndex(
                  b => b.mail_address === barber.mail_address
                )
            )
        );
        setCustomers([...new Set(data.map(app => app.customerName).filter(Boolean))]);
      }
    } catch (err) {
      console.error("Filter options error:", err);
    }
  };

  // טעינת תורים ראשונית וטעינת אפשרויות פעם אחת
  useEffect(() => {
    fetchAppointments(filters);
    fetchFilterOptions();
  }, [refresh, userEmail, userStatus]);

  // פונקציית ביטול תור
  const handleCancelAppointment = async (id) => {
    const result = await Swal.fire({
      title: 'האם לבטל את התור?',
      icon: 'question',
      showCancelButton:true,
      confirmButtonColor:'#dfb76c',
      cancelButtonColor:'#ef4444',
      confirmButtonText:'כן, בטל תור',
      cancelButtonText:'לא, חזור',
      background:'#1a1a1a',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/appointments/cancel/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
          await Swal.fire({ 
            title: 'בוצע!',
            text:'התור בוטל בהצלחה.',
            icon: 'success',
            background:'#1a1a1a',
            color: '#fff',
            confirmButtonColor:'#dfb76c' });
          fetchAppointments(filters); // רענון רשימה
        } else {
          Swal.fire('שגיאה', 'לא הצלחנו לבטל את התור.', 'error');
        }
      } catch (err) {
        Swal.fire('שגיאה', 'תקלה בשרת.', 'error');
      }
    }
  };

  return (
    <div className={classes.appList}>
      <AppointmentsFilter
        filters={filters}
        setFilters={setFilters}
        onSearch={() => fetchAppointments(filters)}
        services={services}
        barbers={barbers}
        customers={customers}
        userStatus={userStatus}
      />

      {error && <div className={classes.error_message}>{error}</div>}

      <div className={classes.appointments_container}>
        {isLoading ? (
          <div className={classes.loading_text}>טוען תורים...</div>
        ) : (
          appointments.map((app) => (
            <AppCard
              key={app.appointment_id}
              app={{
                id: app.appointment_id,
                date: app.appointment_date ? app.appointment_date.split("T")[0] : "לא צוין",
                time: app.appointment_time ? app.appointment_time.substring(0, 5) : "",
                barberName: app.barberName,
                customerName: app.customerName,
                serviceName: app.service_name,
                price: app.price ? `₪${app.price}` : null
              }}
              onCancel={() => handleCancelAppointment(app.appointment_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}