import { billingSeed } from '../data/mockBilling.js';

export const BILLING_STORAGE_KEY = 'rsr-groups-quotation-invoice-demo-v1';

const cloneSeed = () => structuredClone(billingSeed);
const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const isDocumentList = (value) => Array.isArray(value)
  && value.every((document) => document && typeof document === 'object' && !Array.isArray(document)
    && typeof document.documentNo === 'string' && Array.isArray(document.items)
    && document.items.every((item) => item && typeof item === 'object' && !Array.isArray(item)));

export function loadBillingData() {
  try {
    const saved = localStorage.getItem(BILLING_STORAGE_KEY);
    if (!saved) return cloneSeed();
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') throw new TypeError('Billing storage must contain an object.');
    if ((parsed.quotations !== undefined && !isDocumentList(parsed.quotations))
      || (parsed.invoices !== undefined && !isDocumentList(parsed.invoices))) {
      throw new TypeError('Billing storage contains invalid document records.');
    }
    const seed = cloneSeed();
    return {
      quotations: parsed.quotations || seed.quotations,
      invoices: parsed.invoices || seed.invoices,
    };
  } catch (error) {
    console.warn('Could not load quotation and invoice demo data; using sample records.', error);
    return cloneSeed();
  }
}

export function saveBillingData(data) {
  localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(data));
}

export function calculateDocumentTotals(items = []) {
  const lines = items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discountPct = Number(item.discountPct) || 0;
    const taxPct = Number(item.taxPct) || 0;
    const gross = roundCurrency(quantity * rate);
    const discount = roundCurrency(gross * discountPct / 100);
    const taxable = roundCurrency(gross - discount);
    const tax = roundCurrency(taxable * taxPct / 100);
    return { ...item, gross, discount, taxable, tax, total: roundCurrency(taxable + tax) };
  });
  const subtotal = roundCurrency(lines.reduce((sum, item) => sum + item.gross, 0));
  const discountTotal = roundCurrency(lines.reduce((sum, item) => sum + item.discount, 0));
  const taxTotal = roundCurrency(lines.reduce((sum, item) => sum + item.tax, 0));
  return { lines, subtotal, discountTotal, taxableTotal: roundCurrency(subtotal - discountTotal), taxTotal, grandTotal: roundCurrency(subtotal - discountTotal + taxTotal) };
}

export function nextDocumentNumber(kind, records, year = new Date().getFullYear()) {
  const prefix = kind === 'quotation' ? 'QUO' : 'INV';
  const expression = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  const lastNumber = records.reduce((max, record) => {
    const match = expression.exec(record.documentNo || '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${year}-${String(lastNumber + 1).padStart(4, '0')}`;
}

export function quotationStatus(quotation, today = new Date().toISOString().slice(0, 10)) {
  if (!['Accepted', 'Rejected'].includes(quotation.status) && quotation.validUntil && quotation.validUntil < today) return 'Expired';
  return quotation.status || 'Draft';
}

export function convertQuotationToInvoice(quotation, invoices, today = new Date().toISOString().slice(0, 10)) {
  const dueDate = new Date(`${today}T00:00:00`);
  dueDate.setDate(dueDate.getDate() + 30);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    documentNo: nextDocumentNumber('invoice', invoices),
    sourceQuotationId: quotation.documentNo || quotation.id,
    date: today,
    dueDate: dueDate.toISOString().slice(0, 10),
    customerName: quotation.customerName,
    companyName: quotation.companyName || '',
    email: quotation.email || '',
    phone: quotation.phone || '',
    address: quotation.address || '',
    customerGstin: quotation.customerGstin || '',
    items: quotation.items.map((item) => ({ ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })),
    paymentStatus: 'Unpaid',
    paidAmount: 0,
    notes: quotation.notes || '',
    terms: quotation.terms || '',
  };
}
