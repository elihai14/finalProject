import { useState } from "react";
import classes from "./appCard.module.css";
import BarberDetailsPopup from "../barberDetailsPopup/BarberDetailsPopup";
import { fetchBarberDetails } from "../../../js/mainFunctionView";

export default function AppCard({ app, onCancel }) {
  const [showPopUp, setShowPopUp] = useState(false);
  const [barberDetails, setBarberDetails] = useState(null);

  const handleShowBarber = async () => {
    const details = await fetchBarberDetails(app.barberMailAddress);

    console.log(details);

    setBarberDetails(details);
    setShowPopUp(true);
  };

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentTimeStr = `${String(today.getHours()).padStart(2, "0")}:${String(
    today.getMinutes()
  ).padStart(2, "0")}`;

  const isFutureAppointment =
    app.date > todayStr || (app.date === todayStr && app.time > currentTimeStr);

  return (
    <div className={classes.appointment_card}>
      <div className={classes.time_section}>
        <span className={classes.date}>{app.date}</span>
        <span className={classes.time}>{app.time}</span>
      </div>

      <div className={classes.info_section}>
        <span className={classes.barberName} onClick={handleShowBarber}>
          ✂️ {app.barberName}
        </span>

        <span className={classes.clientName}>👤 לקוח: {app.customerName}</span>
      </div>

      <div className={classes.details_section}>
        <h3 className={classes.service_name}>{app.serviceName}</h3>

        {app.price && <span className={classes.price}>{app.price}</span>}

        {isFutureAppointment && onCancel && (
          <button className={classes.cancel_btn} onClick={onCancel}>
            ביטול
          </button>
        )}
      </div>

      {showPopUp && (
        <BarberDetailsPopup
          barberName={barberDetails?.barberName}
          barberPhone={barberDetails?.phone}
          barberServices={barberDetails?.services}
          onClose={() => setShowPopUp(false)}
        />
      )}
    </div>
  );
}
