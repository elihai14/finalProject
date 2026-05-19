import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import classes from "./app.module.css";
import {Routes, Route, useLocation } from 'react-router-dom';
import { useState } from "react";
import { useEffect } from "react";
import NewAppForm from "../components/newAppForm/NewAppForm";
import AppList from "../components/appList/AppList";
import LoginForm from "../components/loginForm/LoginForm";
import RegisterForm from "../components/registerForm/RegisterForm";
import DashboardStats from "../components/dashboardStats/DashboardStats";
import Navbar from "../components/navBar/NavBar";
import ServicesManagement from "../components/servicesManagement/ServicesManagement";
import ServiceList from "../components/serviceList/ServiceList";


function App() {

  const [user , setUser] = useState("");
  const location = useLocation();

  useEffect(() => {
      // פונקציה אסינכרונית למשיכת הנתונים
      const fetchUserName = async () => {
        try {
          const response = await fetch("http://localhost:5000/users/current",
            {credentials: 'include',
              method: "POST"
            }
          );
          const data = await response.json();
          if (!response.ok) {
            console.log(data , "data");
            
            setUser("");
          } else {
            const nameString = String(data.user_name);
            
            setUser(nameString); // שמירת הנתונים ב-State
          }
        } catch (error) {
          console.error("שגיאה", error);
        }
      };
  
      fetchUserName();
    }, [location.pathname]);
    const [refreshAppointments, setRefreshAppointments] = useState(0);

    const triggerRefresh = () => {
      setRefreshAppointments((prev) => prev + 1);
    };

  return (
    <div>
      <Header /> 

      <Navbar user={user} setUser={setUser}/>

      <Routes>
        <Route path="/" element={<LoginForm /> } />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* שלושת הדאשבורדים מציגים את AppList הדינמית שמתאימה את עצמה לפי הסטטוס בעברית */}
        <Route path="/admin-dashboard" element={<AppList />} />
        <Route path="/manage-services" element={<div>
                                                  <ServicesManagement /> <ServiceList />
                                                </div>}/>

  
          <Route path="/client-dashboard"
          element={
            <div>
              <NewAppForm onSuccess = {triggerRefresh }/>
              <AppList refresh = {refreshAppointments}/>
            </div>
          }
        />
        <Route path="/barber-dashboard" element={<NewAppForm />} />
      </Routes>

      <Footer prog="Elihai & Daniel" year="2026" />
  </div>
  );
}

export default App;
