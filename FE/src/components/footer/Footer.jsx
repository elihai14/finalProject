
import classes from'./footer.module.css'


/**
 * footer component
 * @returns footer jsx
 */
export default 
function Footer(props) {


  // const year = props.year;
  // const text = props.text;
  // const propg = prog.text;

  const { prog, year} = props;


  return (
    <footer className={classes.footer}>
      <p>
        &copy; {year} by {prog}
      </p>

    </footer>
  );
}
