import fs from "fs";

const path = "src/app/pages/sales/consignments/components/ConsignmentQuotationPanel.jsx";
let src = fs.readFileSync(path, "utf8");

src = src.replace(
  'import QuotationQuotationFieldLabel from "@/app/pages/sales/consignments/components/quotation/QuotationQuotationFieldLabel";',
  'import QuotationFieldLabel from "@/app/pages/sales/consignments/components/quotation/QuotationFieldLabel";'
);

src = src.replace(/QuotationQuotationFieldLabel/g, "QuotationFieldLabel");

// Remove duplicate inline helpers (keep formatKgLabel onward)
src = src.replace(
  /function QuotationFieldLabel[\s\S]*?function StatusBadge[\s\S]*?}\n\nexport default/,
  "export default"
);

src = src.replace(
  /const quotation-locked-field =[\s\S]*?;\n\n/,
  ""
);

src = src.replace(/className=\{quotation-locked-field\}/g, 'className="quotation-locked-field"');

src = src.replace(
  '<p className="font-semibold text-ink leading-snug">',
  '<p className={styles.summaryValue}>'
);

src = src.replace(
  'className="px-4 py-3 text-right font-mono text-xs text-ink"',
  'className={`${styles.feesCell} ${styles.feesCellRight}`}'
);

src = src.replace(
  'className="px-4 py-3 text-center text-xs text-muted"',
  'className={`${styles.feesCell} ${styles.feesCellCenter}`}'
);

src = src.replace(
  'className="px-4 py-3 text-right font-semibold text-ink"',
  'className={`${styles.feesCell} ${styles.feesCellRight}`}'
);

src = src.replace(
  'className="px-4 py-3 text-right font-mono text-xs text-ink whitespace-nowrap"',
  'className={`${styles.feesCell} ${styles.feesCellRight}`}'
);

src = src.replace(
  'className="px-4 py-3 text-right font-semibold"',
  'className={`${styles.feesCell} ${styles.feesCellRight}`}'
);

fs.writeFileSync(path, src);
console.log("Fixed ConsignmentQuotationPanel.jsx");
