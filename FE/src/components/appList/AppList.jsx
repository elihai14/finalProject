import React, { useState, useEffect } from "react";
import AppCard from "../appCard/AppCard";
import classes from "./appList.module.css";
import AppointmentsFilter from "../appointmentsFilter/AppointmentsFilter";
import {
  fetchAppointments,
  fetchUser,
  fetchFilterOptions,
  handleCancelAppointment,
} from "../../../js/mainFunctionView";

export default function AppList({ refresh, setReloadApps, reloadApps }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [user, setUser] = useState(null); // שינוי ל-null כדי לדעת מתי המשתמש עוד לא נטען

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. תאריך ההתחלה - היום
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // 2. תאריך הסיום - חודש קדימה
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().split("T")[0];

  // 3. הגדרת הסטייט עם שני התאריכים בדיפולט
  const [filters, setFilters] = useState({
    startDate: todayStr,
    endDate: nextMonthStr, // 👈 הוספת תאריך סיום דיפולטי
  });

  // תיקון 1: הבאת המשתמש בתוך useEffect שירוץ רק פעם אחת בטעינה
  useEffect(() => {
    fetchUser(setUser);
  }, []);

  // 1. פונקציה להבאת תורים
  const getApps = async (customFilters) => {
    // אם המשתמש עדיין לא נטען, אל תשלח בקשה לשרת
    if (!user || !user.mail_address) return;

    fetchAppointments(
      customFilters,
      setIsLoading,
      setError,
      user,
      setAppointments
    );
  };

  // טעינת אפשרויות פילטר (רץ רק כשהמשתמש קיים ומשתנה)
  useEffect(() => {
    if (user && user.mail_address) {
      fetchFilterOptions(user, setServices, setBarbers, setCustomers);
    }
  }, [refresh, user?.mail_address, user?.status]);

  // טעינת התורים (רץ כשהפילטרים משתנים, או כשיש reload, או כשהמשתמש סוף סוף נטען)
  useEffect(() => {
    getApps(filters);
  }, [filters, reloadApps, user]); // הוספנו את user כתרחשות משפיעה

  return (
    <div className={classes.appList}>
      <AppointmentsFilter
        filters={filters}
        setFilters={setFilters}
        services={services}
        barbers={barbers}
        customers={customers}
        userStatus={user?.status}
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
                date: app.appointment_date
                  ? app.appointment_date.split("T")[0]
                  : "לא צוין",
                time: app.appointment_time
                  ? app.appointment_time.substring(0, 5)
                  : "",
                barberName: app.barberName,
                customerName: app.customerName,
                serviceName: app.service_name,
                price: app.price ? `₪${app.price}` : null,
              }}
              onCancel={() =>
                handleCancelAppointment(
                  app.appointment_id,
                  getApps,
                  filters,
                  setReloadApps
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
