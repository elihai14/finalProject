import React, { useState, useEffect } from "react";
import AvailabilityCard from "../availabilityCard/AvailabilityCard";
import classes from "./availabilityList.module.css";
import {
  fetchAvailability,
  handleCancelConstraint,
} from "../../../js/mainFunctionView";

export default function AvailabilityList({ refresh }) {
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchAvailability(setIsLoading, setAvailability, setError, filters);
  }, [refresh]);

  const cancleCons = async (id) => {
    handleCancelConstraint(
      id,
      setError,
      setSuccessMessage,
      setAvailability,
      availability
    );
  };

  // רינדור התורים בצורה חכמה ואחידה דרך ה-AppCard המעוצב!
  let arr = availability.map((cons) => {
    const constDate = cons.date ? cons.date.split("T")[0] : "";

    let formattedCons = {
      id: cons.constraint_code,
      date: constDate,
      startTime: cons.start_time.slice(0, 5),
      endTime: cons.end_time.slice(0, 5),
    };

    return (
      <AvailabilityCard
        key={cons.constraint_code}
        cons={formattedCons}
        onCancel={() => cancleCons(cons.constraint_code)}
      />
    );
  });

  return (
    <div>
      <div className={classes.filterBar}>
  
        <div className={classes.dateWrapper}>
          <div>
            <input
              id="endDate"
              min={filters.startDate ? filters.startDate : ""}
              value={filters.endDate}
              type="date"
              onChange={(e) => {
                
                const updatedValue = e.target.value;
                const updatedFilters = { ...filters, endDate: updatedValue };

                setFilters(updatedFilters); // מעדכן את המסך
                fetchAvailability(
                  setIsLoading,
                  setAvailability,
                  setError,
                  updatedFilters
                ); // שולח את המידע המעודכן לשרת
              }}
            />
            <label htmlFor="endDate" style={{ fontSize: "14px" }}>
              {" "}
              :עד{" "}
            </label>
          </div>

          <div>
            <input
              id="startDate"
              type="date"
              onChange={(e) => {
                const updatedValue = e.target.value;
                const updatedFilters = { ...filters, startDate: updatedValue, endDate:updatedValue };

                setFilters(updatedFilters); // מעדכן את המסך
                fetchAvailability(
                  setIsLoading,
                  setAvailability,
                  setError,
                  updatedFilters
                ); // שולח את המידע המעודכן לשרת
              }}
            />
            <label htmlFor="startDate" style={{ fontSize: "14px" }}>
              {" "}
              :מ
            </label>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className={classes.success_message}>{successMessage}</div>
      )}
      {error && <div className={classes.error_message}>{error}</div>}

      <div className={classes.appointments_container}>
        {isLoading ? (
          <div className={classes.loading_text}>טוען אילוצים...</div>
        ) : (
          arr
        )}
      </div>
    </div>
  );
}
