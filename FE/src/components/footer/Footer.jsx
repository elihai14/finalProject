// ייבוא קובץ העיצוב (CSS Module)
import classes from'./footer.module.css'


/**
 * footer component
 * @returns footer jsx
 */
export default 
// קומפוננטת פוטר להצגת זכויות יוצרים בתחתית העמוד
function Footer(props) {

// חילוץ שם המפתח והשנה מתוך ה-props של הקומפוננטה
  const { prog, year} = props;


  return (
    <footer className={classes.footer}>
{/* הצגת טקסט זכויות היוצרים עם השנה ושם המפתח */}
      <p>
        &copy; {year} by {prog}
      </p>

    </footer>
  );
}