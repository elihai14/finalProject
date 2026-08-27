// ייבוא הוקים מ-React
import React, { useState, useEffect } from "react";
// ייבוא קומפוננטות ורכיבים מ-Chart.js להצגת דיאגרמת עמודות
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./busyDays.module.css";

// רישום רכיבי Chart.js הנדרשים לדיאגרמה
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// קומפוננטה להצגת דיאגרמת עמודות של הימים העמוסים ביותר בתורים
function BusyDays({ setDaysRank, startDate, endDate }) {
// ניהול משתנה ה-State לאחסון נתוני הימים העמוסים
  const [busyDays, setBusyDays] = useState([]);

// טעינת הנתונים מהשרת בכל שינוי של טווח התאריכים
  useEffect(() => {
    const fetchData = async () => {
      try {
// שליפת נתוני עומסים לפי ימים מהשרת
        const response = await fetch(
          `http://localhost:5000/appointments/busy-days?startDate=${startDate}&endDate=${endDate}`
        );
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        const arr = Array.isArray(data) ? data : [];
// עדכון ה-State והעברת הנתונים לרכיב האב
        setBusyDays(arr);
        setDaysRank(arr);
      } catch (err) {
        console.error("שגיאה במשיכת נתונים:", err);
      }
    };

    fetchData();
  }, [startDate, endDate]);

// הגדרת הנתונים שיוצגו בגרף העמודות
  const chartData = {
    labels: busyDays.map((day) => day.day_name),
    datasets: [
      {
        label: 'כמות תורים',
        // data: busyDays.map((_, index) => index + 1),
        data: busyDays.map((day) => day.total_appointments),
        backgroundColor: '#dfb76c',
        borderColor: '#dfb76c',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

// הגדרות עיצוב והתנהגות של הגרף
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#a1a1aa',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  };

  return (
    <div className={classes.container}>
      <h3>דירוג עומס בימים</h3>
      <div className={classes.chartContainer}>
{/* הצגת הגרף במידה וקיימים נתונים, אחרת הצגת הודעת מתאימה */}
        {busyDays.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p className={classes.noData}>אין נתונים להצגה</p>
        )}
      </div>
    </div>
  );
}

export default BusyDays;