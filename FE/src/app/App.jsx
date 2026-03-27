
import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';
import Main from '../components/main/Main';

import classes from './app.module.css'


/**
 * Main SIte component
 * @returns 
 */
export default function App() {
  return (
    <div className={classes.app}>

      <Header />

      <Main />

      <Footer prog="Elihai & Daniel" year="2026" />
    </div>
  );
}
