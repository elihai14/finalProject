

import classes from './header.module.css'
import Navbar from '../navBar/NavBar';

/**
 * Header component code
 * @returns Header JSX
 */
export default function Header() {
  const title = '';
  return (
    <header className={classes.header}>
      <h1> {title}</h1>
    </header>
  );
}