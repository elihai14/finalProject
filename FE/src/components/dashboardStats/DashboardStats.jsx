import React, { useState, useEffect } from "react";
import classes from "./dashboardStats.module.css";
import BusyHours from "../busyHours/BusyHours";
import BusyDays from "../busyDays/BusyDays";
import StatisticsExport from "../statisticExport/StatisticsExport";
import { getStatisticData } from "../../../js/mainFunctionView";

function DashboardStats({ userStatus }) {
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
    getStatisticData(
      today,
      dashDates,
      prevMonth,
      setChartData,
      userStatus,
      setRepeatPercentage,
      setLoading
    );
  }, [userStatus, dashDates, today]);

  // if (loading) return <div className={classes.loading_text}>טוען...</div>;


  if (loading) {
    return (
      <div className={classes.error_message}>
        <span className={classes.error_icon}>⚠</span>
        <div>
          <h3>שגיאה בטעינת הנתונים</h3>
          <p>לא ניתן לטעון את נתוני הדשבורד כרגע. נסה לרענן את העמוד.</p>
        </div>
      </div>
    );
  }

  // עיבוד בטוח של ימי העומס ללא לולאות מסורבלות
  const daysArr = (daysRank || []).map((item, i) => ({
    rank: i + 1,
    day: item.day_name,
    appointments: parseInt(item.total_appointments, 10) || 0,
  }));

  const statsData = {
    monthlyRevenue: chartData[0].total_revenue || 0,
    monthlyCustomers: chartData[0].total_customers,
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
              <StatisticsExport
                statsData={statsData}
                startDate={dashDates.startDate || prevMonth}
                endDate={dashDates.endDate || today}
              />
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
            <h3>הכנסות תקופתיות</h3>
            <div className={classes.chart_wrapper}>
              <span className={classes.number}>
                {chartData[0].total_revenue || 0}
              </span>
            </div>
          </div>

          <div className={classes.stat_card}>
            <h3>כמות לקוחות תקופתית</h3>
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
