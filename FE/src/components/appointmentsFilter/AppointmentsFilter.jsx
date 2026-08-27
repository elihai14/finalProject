// ייבוא ספריית React
import React from "react";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./appointmentsFilter.module.css";

// קומפוננטת סרגל סינון תורים לפי תאריכים, שירותים, לקוחות וספרים
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
{/* שדה לבחירת תאריך התחלה - עדכון תאריך ההתחלה והסיום במקביל */}
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

{/* שדה לבחירת תאריך סיום - לא מאפשר בחירת תאריך מוקדם מתאריך ההתחלה */}
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
{/* תפריט נגלל לסינון לפי שירות מסוים */}
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
{/* תפריט נגלל לסינון לפי לקוח - מוצג רק למנהל או לספר */}
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
{/* תפריט נגלל לסינון לפי ספר - מוצג רק למנהל או ללקוח */}
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