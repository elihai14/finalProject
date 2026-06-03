import React, { useState, useEffect } from "react";
import ConstraintCard from "../constraintCard/ConstraintsCard";
import classes from "./constraintsList.module.css";

export default function ConstraintList({ refresh }) {
  const [constraints, setConstraints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchConstraints();
  }, [refresh]);

  const fetchConstraints = async () => {
    setIsLoading(true);
    // const requestBody = { ...filters };
    try {
      const response = await fetch(`http://localhost:5000/constraints`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials:"include"
        // body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (response.ok) {
        setConstraints(data);
        
      } else {
        setConstraints([]);
      }
    } catch (err) {
      setError("שגיאה");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConstraint = async (id) => {
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/constraints/remove-constraint/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        }
      );
      console.log("Status:", response.status, "ID sent:", id);
      if (response.ok) {
        setSuccessMessage("התור בוטל בהצלחה!");
        setConstraints(
          constraints.filter((cons) => cons.constraint_code !== id)
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setError("לא ניתן לבטל את התור כרגע");
      }
    } catch (err) {
      setError("שגיאת תקשורת בביטול התור");
    }
  };

  // רינדור התורים בצורה חכמה ואחידה דרך ה-AppCard המעוצב!
  let arr = constraints.map((cons) => {
    const constDate = cons.date ? cons.date.split("T")[0] : "";

    let formattedCons = {
      id: cons.constraint_code,
      date: constDate,
      startTime: cons.start_time.slice(0,5),
      endTime: cons.end_time.slice(0,5),
    };

    return (
      <ConstraintCard
        key={cons.constraint_code}
        cons={formattedCons}
        onCancel={() => handleCancelConstraint(cons.constraint_code)}
      />
    );
  });

  return (
    <div>
      <div className={classes.filterBar}>

        <button onClick={fetchConstraints}>סנן</button>

        <input
          type="date"
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          min={filters.startDate}
        />
        <input
          type="date"
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
      </div>

      {successMessage && (
        <div className={classes.success_message}>{successMessage}</div>
      )}
      {error && <div className={classes.error_message}>{error}</div>}

      <div className={classes.appointments_container}>
        {isLoading ? (
          <div className={classes.loading_text}>טוען תורים...</div>
        ) : (
          arr
        )}
      </div>
    </div>
  );
}
