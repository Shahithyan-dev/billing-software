export type PrintPaperSize = '58mm' | '80mm' | '100mm' | 'A4';

export interface InvoiceData {
  businessName: string;
  address?: string;
  phone?: string;
  gstin?: string;
  invoiceNo: string;
  date: string;
  items: Array<{ name: string; qty: number; price: number; total: number }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

const generateThermalCSS = (width: string) => `
  @page { margin: 0; size: auto; }
  body { 
    margin: 0; 
    padding: 2mm; 
    font-family: monospace; 
    width: ${width}; 
    font-size: 12px;
    color: black;
  }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .font-bold { font-weight: bold; }
  .divider { border-bottom: 1px dashed #000; margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 2px 0; }
  th.num, td.num { text-align: right; }
`;

const generateA4CSS = () => `
  @page { margin: 10mm; size: A4; }
  body { 
    margin: 0; 
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
    width: 100%; 
    font-size: 14px;
    color: #333;
  }
  .container { max-width: 800px; margin: auto; padding: 20px; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .font-bold { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
  th { background-color: #f9fafb; font-weight: bold; }
  th.num, td.num { text-align: right; }
  .totals { width: 300px; margin-left: auto; }
  .totals table { border: none; }
  .totals th, .totals td { border: none; padding: 5px 10px; }
  .totals .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; }
`;

const generateHTML = (data: InvoiceData, size: PrintPaperSize) => {
  if (size === 'A4') {
    return `
      <html>
        <head><style>${generateA4CSS()}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <h1 style="margin:0;color:#1e3a8a;">${data.businessName}</h1>
                ${data.address ? `<p style="margin:2px 0;color:#666;">${data.address}</p>` : ''}
                ${data.phone ? `<p style="margin:2px 0;color:#666;">Ph: ${data.phone}</p>` : ''}
                ${data.gstin ? `<p style="margin:2px 0;color:#666;">GSTIN: ${data.gstin}</p>` : ''}
              </div>
              <div class="text-right">
                <h2 style="margin:0;color:#666;">TAX INVOICE</h2>
                <p style="margin:2px 0;"><strong>No:</strong> ${data.invoiceNo}</p>
                <p style="margin:2px 0;"><strong>Date:</strong> ${data.date}</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="num">Qty</th>
                  <th class="num">Price</th>
                  <th class="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(i => `
                  <tr>
                    <td>${i.name}</td>
                    <td class="num">${i.qty}</td>
                    <td class="num">₹${i.price.toFixed(2)}</td>
                    <td class="num">₹${i.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <table>
                <tr>
                  <td>Subtotal:</td>
                  <td class="num">₹${data.subtotal.toFixed(2)}</td>
                </tr>
                ${data.discount > 0 ? `<tr><td>Discount:</td><td class="num">-₹${data.discount.toFixed(2)}</td></tr>` : ''}
                ${data.tax > 0 ? `<tr><td>Tax:</td><td class="num">₹${data.tax.toFixed(2)}</td></tr>` : ''}
                <tr class="grand-total">
                  <td>Total:</td>
                  <td class="num">₹${data.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div class="text-center" style="margin-top: 50px; color: #888; font-size: 12px;">
              Thank you for your business!
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Thermal Printers (58mm, 80mm, 100mm)
  const width = size === '58mm' ? '52mm' : size === '80mm' ? '72mm' : '96mm';
  return `
    <html>
      <head><style>${generateThermalCSS(width)}</style></head>
      <body>
        <div class="text-center font-bold" style="font-size: 16px;">${data.businessName}</div>
        ${data.address ? `<div class="text-center">${data.address}</div>` : ''}
        ${data.phone ? `<div class="text-center">Ph: ${data.phone}</div>` : ''}
        ${data.gstin ? `<div class="text-center">GSTIN: ${data.gstin}</div>` : ''}
        
        <div class="divider"></div>
        <div>No: ${data.invoiceNo}</div>
        <div>Date: ${data.date}</div>
        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="num">Qty</th>
              <th class="num">Amt</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(i => `
              <tr>
                <td>${i.name}</td>
                <td class="num">${i.qty}</td>
                <td class="num">${i.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <table style="width: 100%;">
          <tr><td>Subtotal</td><td class="num">${data.subtotal.toFixed(2)}</td></tr>
          ${data.discount > 0 ? `<tr><td>Discount</td><td class="num">-${data.discount.toFixed(2)}</td></tr>` : ''}
          ${data.tax > 0 ? `<tr><td>Tax</td><td class="num">${data.tax.toFixed(2)}</td></tr>` : ''}
          <tr><td class="font-bold" style="font-size:14px;">Total</td><td class="num font-bold" style="font-size:14px;">${data.total.toFixed(2)}</td></tr>
        </table>
        
        <div class="divider"></div>
        <div class="text-center">Thank you! Visit Again.</div>
      </body>
    </html>
  `;
};

export const printInvoice = (data: InvoiceData) => {
  const size = (localStorage.getItem('zyncobill_print_size') as PrintPaperSize) || '80mm';
  
  const html = generateHTML(data, size);
  
  // Create an invisible iframe to print from
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    
    // Wait for styles/images to load then print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  }
};
