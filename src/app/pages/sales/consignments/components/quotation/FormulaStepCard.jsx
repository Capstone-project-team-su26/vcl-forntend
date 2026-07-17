import styles from "./FormulaStepCard.module.scss";

export default function FormulaStepCard({ index, title, formula, note, highlight = false }) {
  return (
    <div className={`${styles.card} ${highlight ? styles.highlight : ""}`}>
      <div className={styles.index}>{index}</div>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {formula ? (
          <div className={styles.formulaBox}>
            <p className={styles.formula}>{formula}</p>
          </div>
        ) : null}
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>
    </div>
  );
}
