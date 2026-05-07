import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import classes from "./app.module.css";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import NewAppForm from "../components/newAppForm/NewAppForm";
import AppList from "../components/appList/AppList";
import LoginForm from "../components/loginForm/LoginForm";
import RegisterForm from "../components/registerForm/RegisterForm";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <nav>
        <Link to="/">התחברות</Link> | <Link to="/register">הרשמה</Link>
      </nav>

      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* שלושת הדאשבורדים מציגים את AppList הדינמית שמתאימה את עצמה לפי הסטטוס בעברית */}
        <Route path="/admin-dashboard" element={<AppList />} />
        <Route
          path="/client-dashboard"
          element={
            <div>
              <NewAppForm />
              <AppList />
            </div>
          }
        />
        <Route path="/barber-dashboard" element={<NewAppForm />} />

      </Routes>
      
      <Footer prog="Elihai & Daniel" year="2026" />
    </BrowserRouter>
  );
}

export default App;