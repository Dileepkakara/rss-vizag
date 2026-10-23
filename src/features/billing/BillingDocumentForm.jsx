import { useState } from 'react';
import { calculateDocumentTotals } from '../../services/billingService.js';

const today = () => new Date().toISOString().slice(0, 10);
const offsetDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
const newLine = () => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, description: '', quantity: 1, unit: 'unit', rate: 0, discountPct: 0, taxPct: 0 });

export default function BillingDocumentForm({ kind, document, onClose, onSave }) {
  const isQuotation = kind === 'quotation';
  const [values, setValues] = useState(() => document || {
    documentNo: '',
    date: today(),
    [isQuotation ? 'validUntil' : 'dueDate']: offsetDate(30),
    customerName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    customerGstin: '',
    status: 'Draft',
    paymentStatus: 'Unpaid',
    paidAmount: 0,
    items: [newLine()],
    notes: '',
    terms: '',
  });
  const [errors, setErrors] = useState({});
  const totals = calculateDocumentTotals(values.items);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const updateLine = (id, key, value) => update('items', values.items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const validate = () => {
    const nextErrors = {};
    if (!values.customerName.trim()) nextErrors.customerName = 'Customer name is required.';
    if (!values.date) nextErrors.date = 'Document date is required.';
    const endDateKey = isQuotation ? 'validUntil' : 'dueDate';
    if (!values[endDateKey]) nextErrors[endDateKey] = isQuotation ? 'Validity date is required.' : 'Due date is required.';
    else if (values.date && values[endDateKey] < values.date) nextErrors[endDateKey] = isQuotation ? 'Validity date must be on or after the quotation date.' : 'Due date must be on or after the invoice date.';
    if (!values.items.length) nextErrors.items = 'Add at least one line item.';
    values.items.forEach((item, index) => {
      if (!item.description.trim()) nextErrors[`description-${index}`] = 'Description is required.';
      if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0) nextErrors[`quantity-${index}`] = 'Enter a quantity above zero.';
      if (!item.unit.trim()) nextErrors[`unit-${index}`] = 'Unit is required.';
      if (!Number.isFinite(Number(item.rate)) || Number(item.rate) < 0) nextErrors[`rate-${index}`] = 'Rate must be zero or higher.';
      if (!Number.isFinite(Number(item.discountPct)) || Number(item.discountPct) < 0 || Number(item.discountPct) > 100) nextErrors[`discountPct-${index}`] = 'Discount must be from 0 to 100%.';
      if (!Number.isFinite(Number(item.taxPct)) || Number(item.taxPct) < 0 || Number(item.taxPct) > 100) nextErrors[`taxPct-${index}`] = 'Tax must be from 0 to 100%.';
    });
    if (!isQuotation) {
      const paidAmount = Number(values.paidAmount);
      if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > totals.grandTotal) nextErrors.paidAmount = 'Paid amount must be between zero and the invoice total.';
      if (values.paymentStatus === 'Unpaid' && paidAmount !== 0) nextErrors.paidAmount = 'Set the paid amount to zero for an unpaid invoice.';
      if (values.paymentStatus === 'Partially Paid' && (paidAmount <= 0 || paidAmount >= totals.grandTotal)) nextErrors.paidAmount = 'A partially paid invoice needs a payment below the full total.';
      if (values.paymentStatus === 'Paid' && paidAmount !== totals.grandTotal) nextErrors.paidAmount = 'Enter the full invoice total when marking it paid.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event, statusOverride) => {
    event?.preventDefault();
    if (!validate()) return;
    onSave({ ...values, ...(isQuotation ? { status: statusOverride || values.status } : { paymentStatus: values.paymentStatus, paidAmount: Number(values.paidAmount) || 0 }) });
  };

  const input = (label, key, type = 'text', required = false) => <label className="form-field" key={key}>
    <span>{label}{required && <i> *</i>}</span>
    <input type={type} value={values[key] ?? ''} placeholder={fieldPlaceholder(key)} onChange={(event) => update(key, event.target.value)} />
    {errors[key] && <small className="field-error">{errors[key]}</small>}
  </label>;

  return <div className="modal-backdrop billing-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="dialog billing-form-dialog" role="dialog" aria-modal="true" aria-labelledby="billing-form-title">
      <header className="dialog-header"><div><div className="eyebrow">{document ? 'UPDATE DOCUMENT' : 'NEW DOCUMENT'}</div><h2 id="billing-form-title">{document ? `Edit ${isQuotation ? 'quotation' : 'invoice'}` : `Create ${isQuotation ? 'quotation' : 'invoice'}`}</h2></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">×</button></header>
      <form className="billing-reference-form" onSubmit={(event) => submit(event)}>
        <section className="billing-form-section billing-form-meta">
          <h3>1. {isQuotation ? 'QUOTATION DETAILS' : 'INVOICE DETAILS'}</h3>
          <div className="billing-form-meta-grid">
          <div className="form-field"><span>{isQuotation ? 'Quotation number' : 'Invoice number'}</span><strong>{values.documentNo || 'Generated when saved'}</strong></div>
          {input(isQuotation ? 'Quotation date' : 'Invoice date', 'date', 'date', true)}
          {input(isQuotation ? 'Valid until' : 'Due date', isQuotation ? 'validUntil' : 'dueDate', 'date', true)}
          </div>
        </section>
        <section className="billing-form-section"><h3>2. RECIPIENT DETAILS</h3><div className="form-grid billing-customer-grid">
          {input('Bill to', 'customerName', 'text', true)}
          {input('Address', 'address')}
          {input('Customer GSTIN', 'customerGstin')}
          {input('Company / organization', 'companyName')}
          {input('Email', 'email', 'email')}
          {input('Phone', 'phone', 'tel')}
        </div></section>
        {!isQuotation && <section className="billing-form-section"><h3>Payment tracking</h3><div className="form-grid">
          <label className="form-field"><span>Payment status</span><select value={values.paymentStatus || 'Unpaid'} onChange={(event) => update('paymentStatus', event.target.value)}>{['Unpaid', 'Partially Paid', 'Paid'].map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className="form-field"><span>Amount paid</span><input type="number" min="0" max={totals.grandTotal} step="0.01" value={values.paidAmount ?? 0} onChange={(event) => update('paidAmount', event.target.value)} />{errors.paidAmount && <small className="field-error">{errors.paidAmount}</small>}</label>
        </div></section>}
        <section className="billing-form-section"><div className="billing-section-heading"><h3>3. ITEMS</h3><button type="button" className="btn primary billing-add-line" onClick={() => update('items', [...values.items, newLine()])}>＋ Add</button></div>
          {errors.items && <p className="field-error">{errors.items}</p>}
          <div className="billing-line-list">{values.items.map((item, index) => <div className="billing-line-editor" key={item.id}>
            <div className="billing-line-top"><strong>Line {index + 1}</strong><button type="button" className="billing-remove-line" disabled={values.items.length === 1} onClick={() => update('items', values.items.filter((line) => line.id !== item.id))}>Remove</button></div>
            <label className="form-field billing-line-description"><span>Description *</span><input value={item.description} placeholder="Enter item or service description" onChange={(event) => updateLine(item.id, 'description', event.target.value)} />{errors[`description-${index}`] && <small className="field-error">{errors[`description-${index}`]}</small>}</label>
            <div className="billing-line-numbers">
              {[
                ['Quantity', 'quantity', '0.01', '0.01'],
                ['Unit', 'unit', undefined, undefined],
                ['Unit price (₹)', 'rate', '0', '0.01'],
                ['Discount %', 'discountPct', '0', '0.01'],
                ['Tax %', 'taxPct', '0', '0.01'],
              ].map(([label, key, min, step]) => <label className="form-field" key={key}><span>{label}{key === 'unit' ? ' *' : ''}</span><input type={key === 'unit' ? 'text' : 'number'} min={min} step={step} placeholder={key === 'quantity' ? 'Quantity' : key === 'unit' ? 'Unit' : key === 'rate' ? 'Unit price' : undefined} value={item[key] ?? 0} onChange={(event) => updateLine(item.id, key, event.target.value)} />{errors[`${key}-${index}`] && <small className="field-error">{errors[`${key}-${index}`]}</small>}</label>)}
            </div>
            <div className="billing-line-total">Line total <strong>{formatMoney(totals.lines[index]?.total || 0)}</strong></div>
          </div>)}</div>
        </section>
        {isQuotation && <label className="form-field billing-status-field"><span>Quotation status</span><select value={values.status || 'Draft'} onChange={(event) => update('status', event.target.value)}>{['Draft', 'Sent', 'Accepted', 'Rejected'].map((status) => <option key={status}>{status}</option>)}</select></label>}
        <section className="billing-form-section billing-tax-info"><h3>4. GST / TAX INFO</h3><div className="billing-form-tax-summary"><div><span>Subtotal</span><strong>{formatMoney(totals.subtotal)}</strong></div><div><span>Discount</span><strong>− {formatMoney(totals.discountTotal)}</strong></div><div><span>Taxable value</span><strong>{formatMoney(totals.taxableTotal)}</strong></div><div><span>Tax total</span><strong>{formatMoney(totals.taxTotal)}</strong></div><div className="billing-grand-total"><span>Grand total</span><strong>{formatMoney(totals.grandTotal)}</strong></div></div></section>
        <div className="form-grid billing-notes-grid">
          <label className="form-field"><span>Notes</span><textarea rows="2" value={values.notes || ''} onChange={(event) => update('notes', event.target.value)} /></label>
          <label className="form-field"><span>Terms and conditions (optional)</span><textarea rows="2" value={values.terms || ''} onChange={(event) => update('terms', event.target.value)} /></label>
        </div>
        <div className="modal-actions billing-form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          {isQuotation && <button type="button" className="btn secondary" onClick={(event) => submit(event, 'Draft')}>Save as draft</button>}
          <button type="submit" className="btn primary">{document ? 'Save changes' : isQuotation ? 'Save quotation' : 'Save invoice'}</button>
        </div>
      </form>
      <p className="dialog-disclaimer">Demo only · No payment or external filing is processed.</p>
    </section>
  </div>;
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);
}

function fieldPlaceholder(key) {
  return {
    customerName: 'Enter bill-to details',
    address: 'Enter customer address',
    customerGstin: 'Enter customer GSTIN',
    companyName: 'Company / organization',
    email: 'Email address',
    phone: 'Phone number',
  }[key] || '';
}
