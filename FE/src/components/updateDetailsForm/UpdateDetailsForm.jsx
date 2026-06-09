import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. הוספנו useNavigate
import classes from "./updateDetailsForm.module.css";
import { handleUpdate } from '../../../js/mainFunctionView';

export default function UpdateDetailsForm() { // 2. הסרנו את onClose
    const navigate = useNavigate(); // 3. אתחול הניווט

    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      setName("");
      setPhone("");
        if (phone) {
          const isStartingCorrect = phone.startsWith("05");
          const isLengthCorrect = phone.length === 10;
          const isOnlyNumbers = !isNaN(phone);

          if (!isStartingCorrect || !isLengthCorrect || !isOnlyNumbers) {
              setError(". מס' טלפון לא תקין , עליו להתחיל ב05 ולהכיל 10 ספרות");
              return; // עוצר כאן! הבקשה לשרת לא תצא
          }
      }
        await handleUpdate(
            e, 
            setIsLoading, 
            setError, 
            phone, 
            name
        );
        
    };

    return (
      <div className={classes.pageContainer}>
        <div className={classes.formWrapper}>
          <h2 className={classes.title}>עדכון פרטים</h2>

          {error && <p className={classes.errorMessage}>{error}</p>}

          <form onSubmit={(e)=>handleSubmit(e)} className={classes.form}>

            <input
              type="tel"
              placeholder="מס' טלפון"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={classes.input}
            />
            <input
              type="text"
              placeholder="שם "
              value={name}
              minLength={2}
              onChange={(e) => setName(e.target.value)}
              className={classes.input}
            />

            <button type="submit" className={classes.button} disabled={isLoading}>
              {isLoading ? "מעדכן..." : "שמור שינויים"}
            </button>

          </form>
        </div>
      </div>
    );
}