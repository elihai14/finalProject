import { useState } from "react";
import classes from "./userCard.module.css";
import { handleUpdateStatus } from "../../../js/mainFunctionView";


export default function userCard({ user , refresh , setRefresh }) {
  const [selectedStatus, setSelectedStatus] = useState(user.status);
  return (
    
    <div className={classes.user_card}>
      <div className={classes.time_section}>
        <span className={classes.name}>{user.user_name}</span>
        <span className={classes.mail}>{user.mail_address}</span>
        <span className={classes.mail}>{user.mail}</span>
        <select
          className={classes.status_select}
          onChange={(e) => setSelectedStatus(e.target.value)}
          value={selectedStatus}
        >
          <option value="לקוח">לקוח</option>
          <option value="ספר">ספר</option>
          <option value="מנהל">מנהל</option>
        </select>
      </div>

      <div className={classes.details_section}>
        {
          <button
            className={classes.update_status_btn}
            onClick={() =>
              handleUpdateStatus(user.mail_address, user.status, selectedStatus, refresh , setRefresh )
            }
          >
            עדכן סטטוס
          </button>
        }
      </div>
    </div>
  );
}
