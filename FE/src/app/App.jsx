import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import classes from "./app.module.css";
/**
 * Main SIte component
 * @returns
 */
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RegisterForm from "../components/registerForm/RegisterForm";
import NewAppForm from "../components/newAppForm/NewAppForm";
import AppList from "../components/appList/AppList";
import LoginForm from "../components/loginForm/LoginForm";
import AppCard from "../components/appCard/AppCard";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <nav>
        {/* משתמשים ב-Link במקום ב-<a> כדי למנוע ריענון של הדף */}
        <Link to="/login">התחברות</Link> |
        <Link to="/users/register">הרשמה</Link>
      </nav>

      <Routes>
        {/* כאן מגדירים איזה נתיב מציג איזו קומפוננטה */}
        <Route path="/users/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />

        <Route path="/" element={<NewAppForm />} />
        <Route path="/admin-dashboard" element={<AppList />} />
        <Route path="/client-dashboard" element={<AppList />} />
        <Route path="/barber-dashboard" element={<NewAppForm />} />
      </Routes>
      <Footer prog="Elihai & Daniel" year="2026" />
    </BrowserRouter>
  );
}

export default App;
