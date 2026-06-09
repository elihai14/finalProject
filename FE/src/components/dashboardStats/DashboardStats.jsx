import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import classes from "./dashboardStats.module.css";
import BusyHours from "../busyHours/BusyHours";
import BusyDays from "../busyDays/BusyDays";
import StatisticsExport from "../statisticExport/StatisticsExport";

const monthNames = {
  1: "ינו",
  2: "פבר",
  3: "מרץ",
  4: "אפר",
  5: "מאי",
  6: "יוני",
  7: "יולי",
  8: "אוג",
  9: "ספט",
  10: "אוק",
  11: "נוב",
  12: "דצ",
};

function DashboardStats({ appointments, userStatus, totalRevenue }) {
  const [chartData, setChartData] = useState([]);
  const [repeatPercentage, setRepeatPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashDates, setDashDates] = useState({ startDate: "", endDate: "" });
  const [daysRank, setDaysRank] = useState([]);
  const [hoursRank, setHoursRank] = useState([]);



  // --- פורמט תאריכים בטוח ומניעת קריסות (ללא ISOString הרגיש) ---
  const today = new Date().toLocaleDateString("fr-CA"); // מחזיר YYYY-MM-DD מקומי

  // חישוב חודש קדימה בטוח: מבוסס על ה-startDate אם קיים, אחרת על היום
  const getPrevMonthSafe = () => {
    const base = dashDates.startDate
      ? new Date(dashDates.startDate.replace(/-/g, "/"))
      : new Date();

    if (isNaN(base.getTime())) return today; // הגנה ממצבי קצה של אינפוט ריק

    base.setMonth(base.getMonth() - 1);
    return base.toLocaleDateString("fr-CA");
  };

  const prevMonth = getPrevMonthSafe();

  useEffect(() => {
    setLoading(true);

    // חישוב ברירת מחדל: 3 חודשים אחורה אם לא הוכנס תאריך
    let finalEndDate = dashDates.endDate || today;
    let finalStartDate = dashDates.startDate;

    if (!finalStartDate) {
      const date = new Date();
      date.setMonth(date.getMonth() - 2); // שני חודשים אחורה
      finalStartDate = date.toLocaleDateString("fr-CA");
    }

    fetch("http://localhost:5000/appointments/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate:dashDates.startDate || prevMonth,
        endDate:dashDates.endDate || today
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setChartData(
          data
        );

        if (userStatus === "מנהל") {
          return fetch(
            "http://localhost:5000/appointments/analytics/repeat-customers",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                startDate:dashDates.startDate || prevMonth,
                endDate:dashDates.endDate || today
              }),
            }
          ).then((res) => res.json());
        }
      })
      .then((repeatData) => {
        if (repeatData) setRepeatPercentage(repeatData.repeatPercentage || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("שגיאה בטעינת הנתונים:", err);
        setLoading(false);
      });
  }, [userStatus, dashDates, today ]);

  if (loading) return <div className={classes.loading_text}>טוען...</div>;

  // עיבוד בטוח של ימי העומס ללא לולאות מסורבלות
  const daysArr = (daysRank || []).map((item, i) => ({
    rank: i + 1,
    day: item.day_name,
    appointments: parseInt(item.total_appointments, 10) || 0,
  }));

  // --- חילוץ וסיכום נתונים עבור ה-Excel מתוך מערך ה-chartData ---
  const totalRevenueSum = chartData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalCustomersSum = chartData.reduce(
    (sum, item) => sum + item.customers,
    0
  );

  const statsData = {
    monthlyRevenue: chartData[0].total_revenue || 0,
    monthlyCustomers: totalCustomersSum,
    returningCustomersPercent: repeatPercentage,
    busyDays: daysArr,
    busyHours: [
      { rank: 1, hour: hoursRank[0], load: "גבוה מאוד" },
      { rank: 2, hour: hoursRank[1], load: "גבוה" },
      { rank: 3, hour: hoursRank[2], load: "בינוני" },
    ],
  };

  return (
    <div className={classes.dashboard_wrapper}>
      <div className={classes.dashFilterBar}>
        {(userStatus === "מנהל" || userStatus === "ספר") && (
          <div className={classes.action_bar_wrapper}>
            <div className={classes.export_btn_container}>
              <StatisticsExport statsData={statsData} startDate={dashDates.startDate || prevMonth} endDate={dashDates.endDate|| today}/>
            </div>
          </div>
        )}
        <div className={classes.dashFilterGroup}>
          <label>עד תאריך:</label>
          <input
            type="date"
            value={dashDates.endDate}
            onChange={(e) => {
              e.preventDefault(); // מניעת רענון דפדפן לא רצוי
              setDashDates((prev) => ({ ...prev, endDate: e.target.value }));
            }}
          />
        </div>
        <div className={classes.dashFilterGroup}>
          <label>מתאריך:</label>
          <input
            type="date"
            value={dashDates.startDate}
            onChange={(e) => {
              e.preventDefault(); // מניעת רענון דפדפן לא רצוי
              setDashDates((prev) => ({ ...prev, startDate: e.target.value }));
            }}
          />
        </div>
      </div>

      <div className={classes.dashboard_layout}>
        {userStatus === "מנהל" && (
          <div className={classes.busy_column}>
            <div className={classes.stat_card}>
              <h3>לקוחות חוזרים</h3>
              <div className={classes.percentage_wrapper}>
                <span className={classes.number}>{repeatPercentage}%</span>
                <p>מכלל הלקוחות שביקרו במספרה</p>
              </div>
            </div>
            <div className={classes.stat_card} style={{ marginTop: "24px" }}>
              <BusyDays
                setDaysRank={setDaysRank}
                startDate={dashDates.startDate || prevMonth}
                endDate={dashDates.endDate || today}
              />
            </div>
          </div>
        )}

        <div className={classes.stats_grid}>
          <div className={classes.stat_card}>
            <h3>הכנסות חודשיות</h3>
            <div className={classes.chart_wrapper}>
              <span className={classes.number}>
                {chartData[0].total_revenue || 0}
              </span>
            </div>
          </div>

          <div className={classes.stat_card}>
            <h3>כמות לקוחות חודשית</h3>
            <div className={classes.chart_wrapper}>
              <span className={classes.number}>
                {chartData[0].total_customers || 0}
              </span>
            </div>
          </div>

          {userStatus === "מנהל" && (
            <div className={classes.stat_card} style={{ gridColumn: "span 2" }}>
              {/* שליחת התאריכים המעודכנים לקומפוננטת העומס */}
              <BusyHours
                startDate={dashDates.startDate || prevMonth}
                endDate={dashDates.endDate || today}
                setHoursRank={setHoursRank}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
