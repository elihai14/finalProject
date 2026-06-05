import React, { useState, useEffect } from "react";
import ConstraintCard from "../constraintCard/ConstraintsCard";
import classes from "./constraintsList.module.css";
import { fetchConstraints,handleCancelConstraint } from "../../../js/mainFunctionView";

export default function ConstraintList({ refresh }) {
  const [constraints, setConstraints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchConstraints(setIsLoading, setConstraints, setError);
  }, [refresh]);
const cancleCons = async (id) => {
  handleCancelConstraint(
    id,
    setError,
    setSuccessMessage,
    setConstraints,
    constraints
  );
}

  // רינדור התורים בצורה חכמה ואחידה דרך ה-AppCard המעוצב!
  let arr = constraints.map((cons) => {
    const constDate = cons.date ? cons.date.split("T")[0] : "";

    let formattedCons = {
      id: cons.constraint_code,
      date: constDate,
      startTime: cons.start_time.slice(0, 5),
      endTime: cons.end_time.slice(0, 5),
    };

    return (
      <ConstraintCard
        key={cons.constraint_code}
        cons={formattedCons}
        onCancel={() => cancleCons(cons.constraint_code)}
      />
    );
  });

  return (
    <div>
      <div className={classes.filterBar}>
        {/* ילד 1: הכפתור */}
        <button className={classes.filterButton} onClick={fetchConstraints}>
          סנן
        </button>

        {/* ילד 2: חבילת התאריכים */}
        <div className={classes.dateWrapper}>
          <input
            type="date"
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
          <input
            type="date"
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>
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
