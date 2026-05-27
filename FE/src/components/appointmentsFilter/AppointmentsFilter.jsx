import React from 'react';
import classes from './appointmentsFilter.module.css';

export default function AppointmentsFilter({ filters, setFilters, onSearch, services, barbers, customers, userStatus }) {
  return (
    <div className={classes.filterBar}>
      <input 
        type="date" 
        value={filters.startDate}
        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} 
      />
      <input 
        type="date" 
        value={filters.endDate}
        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} 
        min={filters.startDate} 
      />
      
      {/* סלקטור שירותים */}
      <select 
        value={filters.service}
        onChange={(e) => setFilters({ ...filters, service: e.target.value })}
      >
        <option value="">כל השירותים</option>
        {services.map((service_name, index) => (
          <option key={index} value={service_name}>{service_name}</option>
        ))}
      </select>

      {/* סלקטור לקוחות (למנהל או לספר) */}
      {(userStatus === "מנהל" || userStatus === "ספר") && (
        <select 
          value={filters.user_name}
          onChange={(e) => setFilters({ ...filters, user_name: e.target.value })}
        >
          <option value="">כל הלקוחות</option>
          {customers.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>
      )}

      {/* סלקטור ספרים (למנהל או ללקוח) */}
      {(userStatus === "מנהל" || userStatus === "לקוח") && (
        <select 
          value={filters.barber_name}
          onChange={(e) => setFilters({ ...filters, barber_name: e.target.value })}
        >
          <option value="">כל הספרים</option>
          {barbers.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>
      )}
      
      <button onClick={onSearch}>סנן</button>
    </div>
  );
}