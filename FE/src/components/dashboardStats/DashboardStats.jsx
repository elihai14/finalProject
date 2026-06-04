// import React, { useState, useEffect } from 'react';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer
// } from 'recharts';
// import classes from './dashboardStats.module.css';
// import BusyHours from '../busyHours/BusyHours';
// import BusyDays from '../busyDays/BusyDays';

// const monthNames = {
//   1: 'ינו', 2: 'פבר', 3: 'מרץ', 4: 'אפר', 5: 'מאי', 6: 'יוני', 7: 'יולי', 8: 'אוג', 9: 'ספט',
//   10: 'אוק', 11: 'נוב', 12: 'דצ'
// };

// function DashboardStats({ userStatus }) {
//   const [chartData, setChartData] = useState([]);
//   const [repeatPercentage, setRepeatPercentage] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const [dashDates, setDashDates] = useState({
//     startDate: '',
//     endDate: ''
//   });

//   useEffect(() => {
//     setLoading(true);

//     fetch('http://localhost:5000/appointments/analytics', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         startDate: dashDates.startDate,
//         endDate: dashDates.endDate
//       })
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setChartData(
//           data.map((item) => ({
//             name: monthNames[item.month_num] || item.month_num,
//             customers: item.total_customers,
//             revenue: item.total_revenue
//           }))
//         );

//         if (userStatus === 'מנהל') {
//           fetch(
//             'http://localhost:5000/appointments/analytics/repeat-customers',
//             {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 startDate: dashDates.startDate,
//                 endDate: dashDates.endDate
//               })
//             }
//           )
//             .then((res) => res.json())
//             .then((repeatData) => {
//               setRepeatPercentage(
//                 repeatData.repeatPercentage || 0
//               );
//               setLoading(false);
//             });
//         } else {
//           setLoading(false);
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         setLoading(false);
//       });
//   }, [userStatus, dashDates]);

//   if (loading) {
//     return (
//       <div className={classes.loading_text}>
//         טוען...
//       </div>
//     );
//   }

//   return (
//     <div className={classes.dashboard_wrapper}>
//       <div className={classes.dashFilterBar}>
//         <div className={classes.dashFilterGroup}>
//           <label>מתאריך:</label>
//           <input
//             type="date"
//             value={dashDates.startDate}
//             onChange={(e) =>
//               setDashDates({
//                 ...dashDates,
//                 startDate: e.target.value
//               })
//             }
//           />
//         </div>

//         <div className={classes.dashFilterGroup}>
//           <label>עד תאריך:</label>
//           <input
//             type="date"
//             value={dashDates.endDate}
//             onChange={(e) =>
//               setDashDates({
//                 ...dashDates,
//                 endDate: e.target.value
//               })
//             }
//           />
//         </div>
//       </div>

//       <div className={classes.dashboard_layout}>

//         {/* צד ימין - מאוחד: לקוחות חוזרים + ימים עמוסים */}
//         {userStatus === 'מנהל' && (
//           <div className={classes.busy_column}>
//             <div className={classes.stat_card}>
//               <h3>לקוחות חוזרים</h3>
//               <div className={classes.percentage_wrapper}>
//                 <span className={classes.percentage_number}>
//                   {repeatPercentage}%
//                 </span>
//                 <p>מכלל הלקוחות שביקרו במספרה</p>
//               </div>
//             </div>
//             {/* BusyDays מתווסף כאן באותה עמודה */}
//             <div className={classes.stat_card} style={{ marginTop: '24px' }}>
//               <BusyDays />
//             </div>


//           </div>
//         )}

//         {/* צד שמאל - גרפים + BusyHours */}
//         <div className={classes.stats_grid}>
//           <div className={classes.stat_card}>
//             <h3>הכנסות חודשיות</h3>
//             <div className={classes.chart_wrapper}>
//               <ResponsiveContainer width="100%" height={150}>
//                 <BarChart data={chartData}>
//                   <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
//                   <YAxis hide />
//                   <Tooltip formatter={(value) => `₪${value}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0ea5e9', borderRadius: '8px' }} />
//                   <Bar dataKey="revenue" fill="#0ea5e9" barSize={25} radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           <div className={classes.stat_card}>
//             <h3>כמות לקוחות חודשית</h3>
//             <div className={classes.chart_wrapper}>
//               <ResponsiveContainer width="100%" height={150}>
//                 <BarChart data={chartData}>
//                   <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
//                   <YAxis hide />
//                   <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #38bdf8', borderRadius: '8px' }} />
//                   <Bar dataKey="customers" fill="#38bdf8" barSize={25} radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {userStatus === 'מנהל' && (
//             <div className={classes.stat_card} style={{ gridColumn: 'span 2' }}>
//               <BusyHours />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DashboardStats;

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import classes from './dashboardStats.module.css';
import BusyHours from '../busyHours/BusyHours';
import BusyDays from '../busyDays/BusyDays';
import StatisticsExport from '../statisticExport/StatisticsExport';

const monthNames = {
  1: 'ינו', 2: 'פבר', 3: 'מרץ', 4: 'אפר', 5: 'מאי', 6: 'יוני', 7: 'יולי', 8: 'אוג', 9: 'ספט',
  10: 'אוק', 11: 'נוב', 12: 'דצ'
};

function DashboardStats({ userStatus }) {
  const [chartData, setChartData] = useState([]);
  const [repeatPercentage, setRepeatPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashDates, setDashDates] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    setLoading(true);

    // חישוב ברירת מחדל: 3 חודשים אחורה אם לא הוכנס תאריך
    let finalStartDate = dashDates.startDate;
    let finalEndDate = dashDates.endDate;

    if (!finalEndDate) {
      finalEndDate = new Date().toISOString().split('T')[0];
    }
    if (!finalStartDate) {
      const date = new Date();
      date.setMonth(date.getMonth() - 2); // שני חודשים אחורה מהחודש הנוכחי = טווח של 3 חודשים
      finalStartDate = date.toISOString().split('T')[0];
    }

    fetch('http://localhost:5000/appointments/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: finalStartDate, endDate: finalEndDate })
    })
      .then((res) => res.json())
      .then((data) => {
        setChartData(
          (data || []).map((item) => ({
            name: monthNames[item.month_num] || item.month_num,
            customers: item.total_customers,
            revenue: item.total_revenue
          }))
        );

        if (userStatus === 'מנהל') {
          return fetch('http://localhost:5000/appointments/analytics/repeat-customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: finalStartDate, endDate: finalEndDate })
          }).then((res) => res.json());
        }
      })
      .then((repeatData) => {
        if (repeatData) setRepeatPercentage(repeatData.repeatPercentage || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [userStatus, dashDates]);

  if (loading) return <div className={classes.loading_text}>טוען...</div>;

  return (
    <div className={classes.dashboard_wrapper}>
      
      <div className={classes.dashFilterBar}>
        <div className={classes.dashFilterGroup}>
          <label>מתאריך:</label>
          <input type="date" value={dashDates.startDate} onChange={(e) => setDashDates({...dashDates, startDate: e.target.value})} />
        </div>
        <div className={classes.dashFilterGroup}>
          <label>עד תאריך:</label>
          <input type="date" value={dashDates.endDate} onChange={(e) => setDashDates({...dashDates, endDate: e.target.value})} />
        </div>
        {(userStatus === 'מנהל' || userStatus === 'ספר') && (
          <div className={classes.action_bar_wrapper}>
            <div className={classes.export_btn_container}>
              <StatisticsExport />
            </div>
          </div>
      )}
      </div>
      
      <div className={classes.dashboard_layout}>
        {userStatus === 'מנהל' && (
          <div className={classes.busy_column}>
            <div className={classes.stat_card}>
              <h3>לקוחות חוזרים</h3>
              <div className={classes.percentage_wrapper}>
                <span className={classes.percentage_number}>{repeatPercentage}%</span>
                <p>מכלל הלקוחות שביקרו במספרה</p>
              </div>
            </div>
            <div className={classes.stat_card} style={{ marginTop: '24px' }}>
              <BusyDays />
            </div>
          </div>
        )}

        <div className={classes.stats_grid}>
          <div className={classes.stat_card}>
            <h3>הכנסות חודשיות</h3>
            <div className={classes.chart_wrapper}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(value) => `₪${value}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0ea5e9', borderRadius: '8px' }} />
                  <Bar dataKey="revenue" fill="#0ea5e9" barSize={25} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={classes.stat_card}>
            <h3>כמות לקוחות חודשית</h3>
            <div className={classes.chart_wrapper}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #38bdf8', borderRadius: '8px' }} />
                  <Bar dataKey="customers" fill="#38bdf8" barSize={25} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {userStatus === 'מנהל' && (
            <div className={classes.stat_card} style={{ gridColumn: 'span 2' }}>
              <BusyHours />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;