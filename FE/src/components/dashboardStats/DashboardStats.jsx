import React, { useState, useEffect, useMemo } from "react";
import classes from "./dashboardStats.module.css";
import BusyHours from "../busyHours/BusyHours";
import BusyDays from "../busyDays/BusyDays";
import StatisticsExport from "../statisticExport/StatisticsExport";
import {
  getStatisticData,
  fetchAppointments,
} from "../../../js/mainFunctionView";

function DashboardStats({ userStatus, user }) {
  const [apps, setApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState("");
  const [chartData, setChartData] = useState([]);
  const [repeatCount, setRepeatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashDates, setDashDates] = useState({ startDate: "", endDate: "" });
  const [daysRank, setDaysRank] = useState([]);
  const [hoursRank, setHoursRank] = useState([]);

  const today = useMemo(() => new Date().toLocaleDateString("fr-CA"), []);

  const getPrevMonthSafe = () => {
    const base = dashDates.startDate
      ? new Date(dashDates.startDate.replace(/-/g, "/"))
      : new Date();

    if (isNaN(base.getTime())) return today;

    base.setMonth(base.getMonth() - 1);
    return base.toLocaleDateString("fr-CA");
  };
  const prevMonth = getPrevMonthSafe();

  useEffect(() => {
    setDashDates({
      startDate: prevMonth,
      endDate: today,
    });
  }, [today]);

  useEffect(() => {
    if (!dashDates.startDate || !dashDates.endDate) return;

    fetchAppointments(
      {},
      setAppsLoading,
      setAppsError,
      user,
      setApps,
      dashDates.startDate,
      dashDates.endDate
    );
  }, [dashDates.startDate, dashDates.endDate, user]);

  useEffect(() => {
    getStatisticData(
      today,
      dashDates,
      prevMonth,
      setChartData,
      userStatus,
      setRepeatCount,
      setLoading
    );
  }, [userStatus, dashDates, today]);

  if (loading) {
    return (
      <div className={classes.error_message}>
        <span className={classes.error_icon}>⚠</span>
        <div>
          <h3>טוען נתונים...</h3>
          <p>אנא המתן בזמן טעינת נתוני הדשבורד.</p>
        </div>
      </div>
    );
  }

  const daysArr = (daysRank || [])
    .map((item) => ({
      day: item.day_name,
      appointments: parseInt(item.total_appointments, 10) || 0,
    }))
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 3)
    .map((item, i) => ({
      rank: i + 1,
      ...item,
    }));

  const sortedHours = [...(hoursRank || [])]
    .sort((a, b) => (b?.count || 0) - (a?.count || 0))
    .slice(0, 3);

  const statsData = {
    monthlyRevenue: chartData?.[0]?.total_revenue || 0,
    monthlyCustomers: chartData?.[0]?.total_customers || 0,
    returningCustomersPercent: repeatCount,
    busyDays: daysArr,
    busyHours: sortedHours.map((item, index) => ({
      rank: index + 1,
      hour: item?.hour || "",
      appointments: item?.count || 0,
      load: `${item?.count || 0} תורים`,
    })),
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
                appointments={apps}
                status = {userStatus}
              />
            </div>
          </div>
        )}

        <div className={classes.dashFilterGroup}>
          <label>עד תאריך:</label>
          <input
            type="date"
            value={dashDates.endDate}
            min={dashDates.startDate}
            onChange={(e) => {
              e.preventDefault();
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
              e.preventDefault();
              setDashDates((prev) => ({
                ...prev,
                startDate: e.target.value,
                endDate: e.target.value,
              }));
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
                <span className={classes.number}>{repeatCount}</span>
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
                {chartData?.[0]?.total_revenue || 0}
              </span>
            </div>
          </div>

          <div className={classes.stat_card}>
            <h3>כמות לקוחות תקופתית</h3>
            <div className={classes.chart_wrapper}>
              <span className={classes.number}>
                {chartData?.[0]?.total_customers || 0}
              </span>
            </div>
          </div>

          {userStatus === "מנהל" && (
            <div className={classes.stat_card} style={{ gridColumn: "span 2" }}>
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
