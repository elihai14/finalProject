import React, { useState, useEffect } from "react";
import AppCard from "../appCard/AppCard";
import classes from "./appList.module.css";
import AppointmentsFilter from "../appointmentsFilter/AppointmentsFilter";
import {
  fetchAppointments,
  fetchUser,
  fetchFilterOptions,
  handleCancelAppointment
} from "../../../js/mainFunctionView";

export default function AppList({ refresh }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [user, setUser] = useState({})
  const [reloadApps, setReloadApps] = useState(true); 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    service: "",
    user_name: "",
    barber_name: "",
  });

  fetchUser(setUser);
  // 1. פונקציה להבאת תורים (הפונקציה המרכזית)
  const getApps = async (customFilters) => {
    fetchAppointments(
      customFilters,
      setIsLoading,
      setError,
      user,
      setAppointments
    );
  };


  // טעינת וטעינת אפשרויות פעם אחת
  useEffect(() => {
    fetchFilterOptions(user, setServices, setBarbers, setCustomers);
  }, [refresh, user.mail_address, user.status]);




  useEffect(() => {
    getApps(filters);
  }, [filters, reloadApps]);

  return (
    <div className={classes.appList}>
      <AppointmentsFilter
        filters={filters}
        setFilters={setFilters}
        services={services}
        barbers={barbers}
        customers={customers}
        userStatus={user.status}
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
