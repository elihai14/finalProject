import React from "react";
import classes from "./appointmentsFilter.module.css";

export default function AppointmentsFilter({
  filters,
  setFilters,
  services,
  barbers,
  customers,
  userStatus,
}) {
  return (
    <div className={classes.filterBar}>
      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => {
          setFilters((prev) => ({
            ...prev,
            startDate: e.target.value,
            endDate: e.target.value,
          }));
        }}
      />

      <input
        type="date"
        value={filters.endDate}
        min={filters.startDate}
        onChange={(e) => {
          setFilters((prev) => ({
            ...prev,
            endDate: e.target.value,
          }));
        }}
      />

      {/* שירותים */}
      <select
        value={filters.service}
        onChange={(e) => {
          setFilters((prev) => ({
            ...prev,
            service: e.target.value,
          }));
        }}
      >
        <option value="">כל השירותים</option>

        {services.map((service_name, index) => (
          <option key={index} value={service_name}>
            {service_name}
          </option>
        ))}
      </select>

      {/* לקוחות */}
      {(userStatus === "מנהל" || userStatus === "ספר") && (
        <select
          value={filters.user_name}
          onChange={(e) => {
            setFilters((prev) => ({
              ...prev,
              user_name: e.target.value,
            }));
          }}
        >
          <option value="">כל הלקוחות</option>

          {customers.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </select>
      )}

      {/* ספרים */}
      {(userStatus === "מנהל" || userStatus === "לקוח") && (
        <select
          value={filters.barber_mail}
          onChange={(e) => {
            setFilters((prev) => ({
              ...prev,
              barber_mail: e.target.value,
            }));
          }}
        >
          <option value="">כל הספרים</option>

          {barbers.map((barber, index) => (
            <option key={index} value={barber.mail_address}>
              {barber.user_name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
