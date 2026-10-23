const day = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const billingSeed = {
  quotations: [
    {
      id: 'QUO-DEMO-0001',
      documentNo: 'QUO-DEMO-0001',
      date: day(-3),
      validUntil: day(27),
      customerName: 'Demo Customer One',
      companyName: 'Fictional customer for demonstration',
      email: '',
      phone: '',
      address: 'Customer address placeholder',
      status: 'Draft',
      items: [
        { id: 'QITEM-1', description: 'Office supplies (demo)', quantity: 10, unit: 'units', rate: 1250, discountPct: 0, taxPct: 18 },
        { id: 'QITEM-2', description: 'Delivery service (demo)', quantity: 1, unit: 'service', rate: 500, discountPct: 0, taxPct: 18 },
      ],
      notes: 'Fictional sample quotation.',
      terms: '',
      convertedInvoiceId: '',
    },
  ],
  invoices: [
    {
      id: 'INV-DEMO-0001',
      documentNo: 'INV-DEMO-0001',
      date: day(-5),
      dueDate: day(25),
      customerName: 'Demo Customer Two',
      companyName: 'Fictional customer for demonstration',
      email: '',
      phone: '',
      address: 'Customer address placeholder',
      paymentStatus: 'Unpaid',
      paidAmount: 0,
      items: [
        { id: 'IITEM-1', description: 'Maintenance service (demo)', quantity: 2, unit: 'visits', rate: 3500, discountPct: 0, taxPct: 18 },
      ],
      notes: 'Fictional sample invoice. No payment has been recorded.',
      terms: '',
      sourceQuotationId: '',
    },
  ],
};
