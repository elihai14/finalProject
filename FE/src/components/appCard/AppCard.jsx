import classes from "./appCard.module.css";

export default function AppCard({ app, onCancel }) {
    const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentTimeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  const isFutureAppointment = 
    app.date > todayStr || 
    (app.date === todayStr && app.time > currentTimeStr);
  return (
    <div className={classes.appointment_card}>
      
      {/* 1. תאריך ושעה - התאריך עכשיו ראשון מימין */}
      <div className={classes.time_section}>
        <span className={classes.date}>{app.date}</span>
        <span className={classes.time}>{app.time}</span>
      </div>

      {/* 2. פרטי ספר ולקוח */}
      <div className={classes.info_section}>
        <span className={classes.barberName}>✂️ {app.barberName}</span>
        <span className={classes.clientName}>👤 לקוח: {app.customerName}</span>
      </div>

      {/* 3. שירות, מחיר וכפתור */}
      <div className={classes.details_section}>
        <h3 className={classes.service_name}>{app.serviceName}</h3>
        {app.price && <span className={classes.price}>{app.price}</span>}
        {isFutureAppointment&&onCancel && (
          <button className={classes.cancel_btn} onClick={onCancel}>
            ביטול
          </button>
        )}
      </div>
    </div>
  );
}