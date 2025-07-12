import { PDFDocument } from 'pdf-lib';

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
}

export async function removePDFPassword(file: File, password: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { password });
  return await pdf.save();
}

export async function generateInvoicePDF(invoiceData: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.276, 841.89]); // A4 size
  
  const fontSize = 12;
  const font = await pdfDoc.embedFont('Helvetica');
  const boldFont = await pdfDoc.embedFont('Helvetica-Bold');
  
  let yPosition = 800;
  
  // Invoice header
  page.drawText('INVOICE', {
    x: 50,
    y: yPosition,
    size: 24,
    font: boldFont
  });
  
  yPosition -= 30;
  
  // Invoice details
  page.drawText(`Invoice Number: ${invoiceData.invoiceNumber}`, {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: font
  });
  
  page.drawText(`Date: ${invoiceData.date}`, {
    x: 300,
    y: yPosition,
    size: fontSize,
    font: font
  });
  
  yPosition -= 20;
  
  if (invoiceData.dueDate) {
    page.drawText(`Due Date: ${invoiceData.dueDate}`, {
      x: 300,
      y: yPosition,
      size: fontSize,
      font: font
    });
  }
  
  yPosition -= 40;
  
  // From section
  page.drawText('From:', {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });
  
  yPosition -= 20;
  
  if (invoiceData.senderName) {
    page.drawText(invoiceData.senderName, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font
    });
    yPosition -= 15;
  }
  
  if (invoiceData.senderAddress) {
    const addressLines = invoiceData.senderAddress.split('\n');
    addressLines.forEach((line: string) => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font
      });
      yPosition -= 15;
    });
  }
  
  if (invoiceData.senderEmail) {
    page.drawText(invoiceData.senderEmail, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font
    });
    yPosition -= 15;
  }
  
  // To section
  yPosition -= 20;
  page.drawText('To:', {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });
  
  yPosition -= 20;
  
  if (invoiceData.clientName) {
    page.drawText(invoiceData.clientName, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font
    });
    yPosition -= 15;
  }
  
  if (invoiceData.clientAddress) {
    const addressLines = invoiceData.clientAddress.split('\n');
    addressLines.forEach((line: string) => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font
      });
      yPosition -= 15;
    });
  }
  
  if (invoiceData.clientEmail) {
    page.drawText(invoiceData.clientEmail, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font
    });
    yPosition -= 15;
  }
  
  // Items table
  yPosition -= 30;
  
  page.drawText('Description', {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });
  
  page.drawText('Qty', {
    x: 300,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });
  
  page.drawText('Price', {
    x: 350,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });
  
  page.drawText('Total', {
    x: 450,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });
  
  yPosition -= 20;
  
  // Draw line
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 1
  });
  
  yPosition -= 20;
  
  // Items
  let subtotal = 0;
  invoiceData.items.forEach((item: any) => {
    const itemTotal = item.quantity * item.price;
    subtotal += itemTotal;
    
    page.drawText(item.description, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font
    });
    
    page.drawText(item.quantity.toString(), {
      x: 300,
      y: yPosition,
      size: fontSize,
      font: font
    });
    
    page.drawText(`$${item.price.toFixed(2)}`, {
      x: 350,
      y: yPosition,
      size: fontSize,
      font: font
    });
    
    page.drawText(`$${itemTotal.toFixed(2)}`, {
      x: 450,
      y: yPosition,
      size: fontSize,
      font: font
    });
    
    yPosition -= 20;
  });
  
  // Totals
  yPosition -= 20;
  
  const tax = subtotal * (invoiceData.taxRate / 100);
  const total = subtotal + tax;
  
  page.drawText(`Subtotal: $${subtotal.toFixed(2)}`, {
    x: 400,
    y: yPosition,
    size: fontSize,
    font: font
  });
  
  yPosition -= 20;
  
  page.drawText(`Tax (${invoiceData.taxRate}%): $${tax.toFixed(2)}`, {
    x: 400,
    y: yPosition,
    size: fontSize,
    font: font
  });
  
  yPosition -= 20;
  
  page.drawText(`Total: $${total.toFixed(2)}`, {
    x: 400,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });
  
  // Notes
  if (invoiceData.notes) {
    yPosition -= 40;
    page.drawText('Notes:', {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: boldFont
    });
    
    yPosition -= 20;
    
    const noteLines = invoiceData.notes.split('\n');
    noteLines.forEach((line: string) => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font
      });
      yPosition -= 15;
    });
  }
  
  return await pdfDoc.save();
}
