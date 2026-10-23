import { calculateDocumentTotals } from '../../services/billingService.js';
import { readableDate } from '../../utils/formatters.js';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);

export default function BillingPrintDocument({ kind, document }) {
  const isQuotation = kind === 'quotation';
  const title = isQuotation ? 'Quotation' : 'Invoice';
  const totals = calculateDocumentTotals(document.items);

  return <article className="billing-print-document billing-print-reference">
    <header className="billing-reference-header">
      <div className="billing-reference-recipient">
        <h1>{title}</h1>
        <section>
          <strong>Bill to:</strong>
          <b>{document.customerName}</b>
          {document.companyName && <span>{document.companyName}</span>}
          {document.address && <span>{document.address}</span>}
          {document.customerGstin && <span>GSTIN: {document.customerGstin}</span>}
        </section>
      </div>
      <div className="billing-reference-company">
        <div className="billing-reference-company-details">
          <div>
            <strong>RSR GROUPS</strong>
            <span>GSTIN: Not configured (demo)</span>
            <span>Company address not configured (demo)</span>
          </div>
          <img className="billing-reference-brand" src="/rsr-groups-logo.png" alt="RSR GROUPS" />
        </div>
        <div className="billing-reference-document-meta">
          <strong>{isQuotation ? 'Quotation No:' : 'Invoice No:'} {document.documentNo}</strong>
          <span>Date: {readableDate(document.date)}</span>
          <span>{isQuotation ? 'Valid until:' : 'Due date:'} {readableDate(isQuotation ? document.validUntil : document.dueDate)}</span>
        </div>
      </div>
    </header>

    <div className="billing-print-table-wrap">
      <table className="billing-print-table billing-reference-table">
        <thead><tr><th>Item</th><th>Description</th><th>Quantity</th><th>Unit Price (Rs.)</th><th>Total Price (Rs.)</th></tr></thead>
        <tbody>{totals.lines.map((line, index) => <tr key={line.id}>
          <td>{index + 1}</td><td>{line.description}</td><td>{line.quantity} {line.unit}</td><td>{money(line.rate)}</td><td>{money(line.taxable)}</td>
        </tr>)}</tbody>
        <tfoot>
          <tr><td colSpan="4">Subtotal</td><td>{money(totals.subtotal)}</td></tr>
          {totals.discountTotal > 0 && <tr><td colSpan="4">Discount</td><td>− {money(totals.discountTotal)}</td></tr>}
          <tr><td colSpan="4">Taxable value</td><td>{money(totals.taxableTotal)}</td></tr>
          <tr><td colSpan="4">Tax total</td><td>{money(totals.taxTotal)}</td></tr>
          <tr className="billing-reference-grand-total"><td colSpan="4">Grand total</td><td>{money(totals.grandTotal)}</td></tr>
          {!isQuotation && <tr><td colSpan="4">Amount paid · {document.paymentStatus || 'Unpaid'}</td><td>{money(document.paidAmount)}</td></tr>}
        </tfoot>
      </table>
    </div>

    <section className="billing-reference-words"><strong>In words:</strong> {amountInWords(totals.grandTotal)}</section>
    <section className="billing-reference-bank">
      <div><strong>Bank details:</strong><span>Not configured (demo)</span></div>
      <strong>For RSR GROUPS</strong>
    </section>
    <div className="billing-reference-thanks">Thank you</div>
    {document.notes && <section className="billing-reference-notes"><strong>Notes</strong><p>{document.notes}</p></section>}
    <section className="billing-reference-terms"><strong>Terms and Conditions</strong><p>{document.terms || 'No additional terms have been specified.'}</p></section>
    <footer className="billing-reference-disclaimer">Demo document · Verify company and customer details before use.</footer>
  </article>;
}

function amountInWords(value) {
  const paiseTotal = Math.round(Math.abs(Number(value) || 0) * 100);
  const rupees = Math.floor(paiseTotal / 100);
  const paise = paiseTotal % 100;
  const rupeeWords = `${numberInWords(rupees)} ${rupees === 1 ? 'Rupee' : 'Rupees'}`;
  return `${rupeeWords}${paise ? ` and ${numberInWords(paise)} ${paise === 1 ? 'Paisa' : 'Paise'}` : ''} only`;
}

function numberInWords(value) {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const underThousand = (number) => {
    const parts = [];
    if (number >= 100) parts.push(`${units[Math.floor(number / 100)]} Hundred`);
    const remainder = number % 100;
    if (remainder >= 10 && remainder < 20) parts.push(teens[remainder - 10]);
    else if (remainder >= 20) parts.push(tens[Math.floor(remainder / 10)], units[remainder % 10]);
    else if (remainder > 0) parts.push(units[remainder]);
    return parts.filter(Boolean).join(' ');
  };

  if (value === 0) return 'Zero';
  if (value >= 10000000) return `${numberInWords(Math.floor(value / 10000000))} Crore${value % 10000000 ? ` ${numberInWords(value % 10000000)}` : ''}`;
  if (value >= 100000) return `${underThousand(Math.floor(value / 100000))} Lakh${value % 100000 ? ` ${numberInWords(value % 100000)}` : ''}`;
  if (value >= 1000) return `${underThousand(Math.floor(value / 1000))} Thousand${value % 1000 ? ` ${numberInWords(value % 1000)}` : ''}`;
  return underThousand(value);
}
