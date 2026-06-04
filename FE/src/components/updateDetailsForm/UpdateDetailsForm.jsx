import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import classes from "./updateDetailsForm.module.css";
import {handleUpdate} from '../../../js/mainFunctionView'

export default function UpdateDetailsForm({ onClose }) 
{
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    
    return (
      <div className={classes.overlay}>
        <div className={classes.popup}>
          <h2 className={classes.title}>עדכון פרטים</h2>

          {/* הצגת שגיאה מהבקאנד */}
          {error && <p className={classes.errorMessage}>{error}</p>}

          <form
            onSubmit={(e) =>
              handleUpdate(e, setIsLoading, setError, onClose, phone, email)
            }
            className={classes.form}
          >
            {/* שם מלא */}
            <input
              type="text"
              placeholder="שם מלא"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={classes.input}
            />

            {/* מס' טלפון */}
            <input
              type="tel"
              placeholder="מס' טלפון"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={classes.input}
            />

            {/* כתובת מייל */}
            <input
              type="email"
              placeholder="כתובת מייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={classes.input}
            />

            {/* כפתור */}
            <button
              type="submit"
              className={classes.button}
              disabled={isLoading}
            >
              {isLoading ? "מעדכן..." : "שמור שינויים"}
            </button>

            <button
              type="button"
              className={classes.cancelButton}
              onClick={onClose}
            >
              ביטול
            </button>
          </form>
        </div>
      </div>
    );
}