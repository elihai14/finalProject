import { createPortal } from "react-dom";
import classes from "./barberDetailsPopup.module.css";

export default function BarberDetailsPopup({
  barberName,
  barberPhone,
  barberServices,
  isLoading,
  onClose,
}) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const popup = (
    <div className={classes.overlay} onClick={handleOverlayClick}>
      <div className={classes.popup} onClick={(e) => e.stopPropagation()}>
        <button className={classes.close_btn} onClick={onClose} type="button">
          ✕
        </button>

        <h2>פרטי הספר</h2>

        {isLoading ? (
          <div className={classes.loading}>טוען פרטים...</div>
        ) : (
          <>
            <div className={classes.info_item}>
              <span className={classes.label}>שם מלא:</span>

              <span className={classes.value}>{barberName || "לא צוין"}</span>
            </div>

            <div className={classes.info_item}>
              <span className={classes.label}>טלפון:</span>

              <span className={classes.value}>{barberPhone || "לא צוין"}</span>
            </div>

            <div className={classes.services_section}>
              <span className={classes.label}>שירותים שהוא מבצע:</span>

              {barberServices?.length > 0 ? (
                <ul className={classes.services_list}>
                  {barberServices.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              ) : (
                <p className={classes.no_services}>לא נמצאו שירותים</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(popup, document.body);
}
