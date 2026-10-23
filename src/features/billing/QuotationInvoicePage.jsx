import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Toast from '../../components/common/Toast.jsx';
import { calculateDocumentTotals, convertQuotationToInvoice, loadBillingData, nextDocumentNumber, quotationStatus, saveBillingData } from '../../services/billingService.js';
import { readableDate } from '../../utils/formatters.js';
import BillingDocumentForm from './BillingDocumentForm.jsx';
import BillingPrintDocument from './BillingPrintDocument.jsx';
import './billing.css';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);
const clone = (value) => structuredClone(value);

export default function QuotationInvoicePage({ canWrite }) {
  const [data, setData] = useState(loadBillingData);
  const [section, setSection] = useState('quotations');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    try {
      saveBillingData(data);
    } catch (error) {
      console.error('Could not save quotation and invoice demo data.', error);
      setToast('Could not save billing changes in this browser.');
    }
  }, [data]);

  const isQuotation = section === 'quotations';
  const documents = data[section];
  const visibleDocuments = useMemo(() => documents.filter((document) => {
    const status = isQuotation ? quotationStatus(document) : invoiceStatus(document);
    const text = `${document.documentNo} ${document.customerName} ${document.companyName || ''}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (statusFilter === 'All statuses' || status === statusFilter);
  }), [documents, isQuotation, query, statusFilter]);
  const statuses = isQuotation ? ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'] : ['Unpaid', 'Partially Paid', 'Paid', 'Overdue'];

  const openCreate = () => setModal({ type: 'form', kind: section === 'quotations' ? 'quotation' : 'invoice', document: null });
  const openEdit = (document) => setModal({ type: 'form', kind: section === 'quotations' ? 'quotation' : 'invoice', document });
  const openView = (document) => setModal({ type: 'view', kind: section === 'quotations' ? 'quotation' : 'invoice', document });
  const closeModal = () => setModal(null);

  const saveDocument = (formValues) => {
    const kind = modal.kind;
    const key = kind === 'quotation' ? 'quotations' : 'invoices';
    const existing = modal.document;
    const document = {
      ...formValues,
      id: existing?.id || `${kind}-${Date.now()}`,
      documentNo: existing?.documentNo || formValues.documentNo || nextDocumentNumber(kind, data[key]),
    };
    setData((current) => ({
      ...current,
      [key]: existing
        ? current[key].map((item) => item.id === existing.id ? document : item)
        : [document, ...current[key]],
    }));
    setModal(null);
    setToast(`${kind === 'quotation' ? 'Quotation' : 'Invoice'} saved.`);
  };

  const confirmDelete = () => {
    if (!confirmation) return;
    setData((current) => ({
      ...current,
      [confirmation.kind === 'quotation' ? 'quotations' : 'invoices']: current[confirmation.kind === 'quotation' ? 'quotations' : 'invoices'].filter((item) => item.id !== confirmation.document.id),
    }));
    setToast(`${confirmation.kind === 'quotation' ? 'Quotation' : 'Invoice'} deleted.`);
    setConfirmation(null);
  };

  const convertQuotation = () => {
    if (!confirmation) return;
    const quotation = confirmation.document;
    if (quotation.convertedInvoiceId || ['Rejected', 'Expired'].includes(quotationStatus(quotation))) {
      setConfirmation(null);
      setToast('This quotation cannot be converted again.');
      return;
    }
    const invoice = convertQuotationToInvoice(quotation, data.invoices);
    setData((current) => ({
      ...current,
      invoices: [invoice, ...current.invoices],
      quotations: current.quotations.map((item) => item.id === quotation.id ? { ...item, convertedInvoiceId: invoice.id } : item),
    }));
    setConfirmation(null);
    setSection('invoices');
    setStatusFilter('All statuses');
    setQuery('');
    setToast(`Created ${invoice.documentNo} as Unpaid from the quotation.`);
  };

  const printDocument = (kind, document) => {
    setModal({ type: 'view', kind, document, printWhenReady: true });
    window.setTimeout(() => window.print(), 150);
  };

  const resetFilters = () => { setQuery(''); setStatusFilter('All statuses'); };

  return <>
    <PageTitle eyebrow="SALES DOCUMENTS" title="Quotation & Invoice" subtitle="Prepare quotations, track invoices and print customer documents." action={canWrite && <button className="btn primary" onClick={openCreate}>＋ New {isQuotation ? 'quotation' : 'invoice'}</button>} />
    <section className="billing-summary-grid">
      <div className="panel billing-summary-card"><span>Quotations</span><strong>{data.quotations.length}</strong><small>{data.quotations.filter((item) => quotationStatus(item) === 'Draft').length} drafts</small></div>
      <div className="panel billing-summary-card"><span>Invoices</span><strong>{data.invoices.length}</strong><small>{data.invoices.filter((item) => invoiceStatus(item) === 'Unpaid' || invoiceStatus(item) === 'Overdue').length} awaiting payment</small></div>
      <div className="panel billing-summary-card"><span>Outstanding amount</span><strong>{money(data.invoices.reduce((sum, invoice) => sum + Math.max(0, calculateDocumentTotals(invoice.items).grandTotal - Number(invoice.paidAmount || 0)), 0))}</strong><small>Demo tracking only</small></div>
    </section>
    <div className="billing-tabs" role="tablist" aria-label="Quotation and invoice sections">
      <button role="tab" aria-selected={isQuotation} className={isQuotation ? 'active' : ''} onClick={() => { setSection('quotations'); resetFilters(); }}>Quotations <span>{data.quotations.length}</span></button>
      <button role="tab" aria-selected={!isQuotation} className={!isQuotation ? 'active' : ''} onClick={() => { setSection('invoices'); resetFilters(); }}>Invoices <span>{data.invoices.length}</span></button>
    </div>
    <section className="panel table-panel billing-table-panel">
      <div className="table-toolbar">
        <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${isQuotation ? 'quotations' : 'invoices'}...`} />
        <div className="toolbar-controls"><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>
      </div>
      {visibleDocuments.length ? <DataTable headings={['DOCUMENT NO.', 'CUSTOMER', isQuotation ? 'QUOTE DATE' : 'INVOICE DATE', isQuotation ? 'VALID UNTIL' : 'DUE DATE', 'AMOUNT', isQuotation ? 'STATUS' : 'PAYMENT', 'ACTIONS']} className="billing-records-table">
        {visibleDocuments.map((document) => {
          const status = isQuotation ? quotationStatus(document) : invoiceStatus(document);
          const total = calculateDocumentTotals(document.items).grandTotal;
          return <tr key={document.id}>
            <td><strong>{document.documentNo}</strong>{document.sourceQuotationId && <small className="billing-table-subtext">From {document.sourceQuotationId}</small>}</td>
            <td><strong>{document.customerName}</strong>{document.companyName && <small className="billing-table-subtext">{document.companyName}</small>}</td>
            <td>{readableDate(document.date)}</td><td>{readableDate(isQuotation ? document.validUntil : document.dueDate)}</td>
            <td><strong>{money(total)}</strong></td><td><StatusBadge value={status} /></td>
            <td><div className="billing-row-actions">
              <button type="button" className="billing-action-view" title="View document" aria-label={`View ${document.documentNo}`} onClick={() => openView(document)}>View</button>
              {canWrite && <button type="button" className="billing-action-edit" title="Edit document" aria-label={`Edit ${document.documentNo}`} disabled={isQuotation && Boolean(document.convertedInvoiceId)} onClick={() => openEdit(document)}>Edit</button>}
              <button type="button" className="billing-action-print" title="Print document" aria-label={`Print ${document.documentNo}`} onClick={() => printDocument(section === 'quotations' ? 'quotation' : 'invoice', document)}>Print</button>
              {canWrite && isQuotation && <button type="button" className="billing-action-convert" title="Convert to invoice" aria-label={`Convert ${document.documentNo} to invoice`} disabled={Boolean(document.convertedInvoiceId) || ['Rejected', 'Expired'].includes(status)} onClick={() => setConfirmation({ type: 'convert', kind: 'quotation', document })}>{document.convertedInvoiceId ? 'Converted' : 'Convert'}</button>}
              {canWrite && <button type="button" className="danger" title="Delete document" aria-label={`Delete ${document.documentNo}`} onClick={() => setConfirmation({ type: 'delete', kind: isQuotation ? 'quotation' : 'invoice', document })}>Delete</button>}
            </div></td>
          </tr>;
        })}
      </DataTable> : <EmptyState title={query || statusFilter !== 'All statuses' ? 'No documents match' : `No ${isQuotation ? 'quotations' : 'invoices'} yet`} description={query || statusFilter !== 'All statuses' ? 'Adjust your search or status filter.' : `Create a ${isQuotation ? 'quotation' : 'invoice'} to get started.`} />}
      <div className="billing-table-footer">{visibleDocuments.length} {visibleDocuments.length === 1 ? 'record' : 'records'} · Changes stay in this browser</div>
    </section>
    <p className="fine-print">Demo module only. Company address and tax identity are not configured. Tax rates are entered per line and are not tax advice.</p>
    {modal?.type === 'form' && <BillingDocumentForm key={`${modal.kind}-${modal.document?.id || 'new'}`} kind={modal.kind} document={modal.document} onClose={closeModal} onSave={saveDocument} />}
    {modal?.type === 'view' && <div className="modal-backdrop billing-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
      <section className="dialog billing-view-dialog" role="dialog" aria-modal="true" aria-labelledby="billing-view-title">
        <div className="billing-view-actions"><h2 id="billing-view-title">{modal.kind === 'quotation' ? 'Quotation details' : 'Invoice details'}</h2><div><button className="btn secondary" onClick={() => window.print()}>Print / Save PDF</button><button className="modal-close" onClick={closeModal} aria-label="Close document">×</button></div></div>
        <BillingPrintDocument kind={modal.kind} document={modal.document} />
      </section>
    </div>}
    {confirmation?.type === 'delete' && <ConfirmDialog title={`Delete ${confirmation.kind}?`} description={`Delete ${confirmation.document.documentNo}? This action cannot be undone in this browser.`} confirmLabel="Delete document" onCancel={() => setConfirmation(null)} onConfirm={confirmDelete} />}
    {confirmation?.type === 'convert' && <ConfirmDialog title="Convert quotation to invoice?" description={`Create one unpaid invoice from ${confirmation.document.documentNo}? Customer and line items will be copied. The quotation will be marked as converted.`} confirmLabel="Create unpaid invoice" onCancel={() => setConfirmation(null)} onConfirm={convertQuotation} />}
    <Toast message={toast} onDismiss={() => setToast('')} />
  </>;
}

function invoiceStatus(invoice, today = new Date().toISOString().slice(0, 10)) {
  if (invoice.paymentStatus === 'Paid') return 'Paid';
  return invoice.dueDate && invoice.dueDate < today ? 'Overdue' : invoice.paymentStatus || 'Unpaid';
}
