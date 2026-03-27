import classes from "./appCard.module.css";

export default function AppCard({app}) {
  return (
    <div className={classes.appointment_card}>
      <div className={classes.time_section}>
        <span className={classes.date}>{app.date}</span>
        <span className={classes.time}>{app.time}</span>
        <span className={classes.barberName}>{app.barberName}</span>
      </div>

      <div className={classes.details_section}>
        <h3 className={classes.service_name}>{app.serviceName}</h3>
        <h3 className={classes.price}>{app.price}</h3>
      </div>
    </div>
  );
}
