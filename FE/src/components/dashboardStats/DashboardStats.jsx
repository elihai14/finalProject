import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import classes from './dashboardStats.module.css'; // 👈 ייבוא ה-CSS מודול החדש

const monthNames = {
  1: 'ינו', 2: 'פבר', 3: 'מרץ', 4: 'אפר', 5: 'מאי', 6: 'יוני',
  7: 'יולי', 8: 'אוג', 9: 'ספט', 10: 'אוק', 11: 'נוב', 12: 'דצ'
};

function DashboardStats({ userStatus }) {
  const [chartData, setChartData] = useState([]);
  const [repeatPercentage, setRepeatPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/appointments/analytics')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        const formattedData = data.map(item => ({
          name: monthNames[item.month_num] || item.month_num,
          customers: item.total_customers,
          revenue: item.total_revenue
        }));
        setChartData(formattedData);

        if (userStatus === 'מנהל') {
          return fetch('http://localhost:5000/appointments/analytics/repeat-customers')
            .then(res => res.json())
            .then(repeatData => {
              setRepeatPercentage(repeatData.repeatPercentage);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
      });
  }, [userStatus]);

  if (loading) return <div className={classes.loading_text}>טוען נתונים סטטיסטיים...</div>;

  return (
    <div className={classes.stats_container}>
      
      {/* מלבן 1: כמות לקוחות חודשית */}
      <div className={classes.stat_card}>
        <h3>כמות לקוחות חודשית</h3>
        <div className={classes.chart_wrapper}>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #38bdf8', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Bar dataKey="customers" fill="#38bdf8" barSize={25} radius={[4, 4, 0, 0]} /> {/* 👈 צבע כחול בהיר מעוגל קלות */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* מלבן 2: כמות הכנסות חודשית */}
      <div className={classes.stat_card}>
        <h3>הכנסות חודשיות</h3>
        <div className={classes.chart_wrapper}>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                formatter={(value) => `₪${value}`} 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0ea5e9', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#0ea5e9' }}
              />
              <Bar dataKey="revenue" fill="#0ea5e9" barSize={25} radius={[4, 4, 0, 0]} /> {/* 👈 כחול ניאון מהמם */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* מלבן 3: לקוחות חוזרים - מוצג למנהל */}
      {userStatus === 'מנהל' && (
        <div className={classes.stat_card}>
          <h3>לקוחות חוזרים</h3>
          <div className={classes.percentage_wrapper}>
            <span className={classes.percentage_number}>{repeatPercentage}%</span>
            <p>מכלל הלקוחות שביקרו במספרה</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardStats;