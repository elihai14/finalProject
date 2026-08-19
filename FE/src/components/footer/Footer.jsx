

import classes from'./footer.module.css'


/**
 * footer component
 * @returns footer jsx
 */
export default 
function Footer(props) {



  const { prog, year} = props;


  return (
    <footer className={classes.footer}>
      <p>
        &copy; {year} by {prog}
      </p>

    </footer>
  );
}
