import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Readable } from 'stream';

const generatePDFInvoice = (sale) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
            doc.fontSize(12).text('7 Super City Retail System', { align: 'center' });
            doc.fontSize(10).text('Professional Retail Management', { align: 'center' });

            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Invoice Details
            doc.fontSize(11).font('Helvetica-Bold').text('Invoice Information:', 50, doc.y);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Invoice Number: ${sale.invoiceNumber}`, 50);
            doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`, 50);
            doc.text(`Time: ${new Date(sale.createdAt).toLocaleTimeString()}`, 50);

            doc.moveDown(0.5);

            // Customer Details
            doc.fontSize(11).font('Helvetica-Bold').text('Customer Information:', 50);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${sale.customerName}`, 50);
            if (sale.loyaltyPoints !== undefined) {
                doc.text(`Loyalty Points Earned: ${sale.pointsEarned}`, 50);
            }

            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Items Table Header
            doc.fontSize(10).font('Helvetica-Bold');
            const tableY = doc.y;
            const col1 = 50;
            const col2 = 250;
            const col3 = 350;
            const col4 = 450;

            doc.text('Product', col1, tableY);
            doc.text('Qty', col2, tableY);
            doc.text('Unit Price', col3, tableY);
            doc.text('Total', col4, tableY);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.font('Helvetica').fontSize(9);

            const items = sale.items || [];
            for (const item of items) {
                doc.moveDown(0.3);
                doc.text(item.productName.substring(0, 30), col1, doc.y, { width: 150 });
                doc.text(String(item.quantity), col2, doc.y - doc.heightOfString('test'));
                doc.text(`$${item.unitPrice.toFixed(2)}`, col3, doc.y - doc.heightOfString('test'));
                doc.text(`$${item.total.toFixed(2)}`, col4, doc.y - doc.heightOfString('test'));
            }

            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Summary Section - Right Aligned
            const summaryX = 350;
            doc.fontSize(10).font('Helvetica');
            doc.text(`Subtotal:`, summaryX, doc.y);
            doc.text(`$${sale.subtotal.toFixed(2)}`, 450, doc.y - 10);

            doc.moveDown(0.3);
            if (sale.discountAmount > 0) {
                doc.text(`Discount:`, summaryX);
                doc.text(`-$${sale.discountAmount.toFixed(2)}`, 450, doc.y - 10);
                doc.moveDown(0.3);
            }

            doc.text(`Tax (10%):`, summaryX);
            doc.text(`$${sale.tax.toFixed(2)}`, 450, doc.y - 10);

            doc.moveDown(0.3);
            doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();

            doc.font('Helvetica-Bold').fontSize(12);
            doc.moveDown(0.3);
            doc.text(`Grand Total:`, summaryX);
            doc.text(`$${sale.grandTotal.toFixed(2)}`, 450, doc.y - 15);

            doc.moveDown(1.5);
            doc.font('Helvetica').fontSize(10);
            doc.text(`Payment Method: ${sale.paymentMethod}`, 50);

            doc.moveDown(1);
            doc.fontSize(8).text('Thank you for your business!', { align: 'center' });
            doc.text('Issued by: 7 Super City Retail System', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

const generateExcelReport = async (sales, filters = {}) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Set column widths
    worksheet.columns = [
        { header: 'Invoice Number', key: 'invoiceNumber', width: 15 },
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Customer Name', key: 'customerName', width: 20 },
        { header: 'Items Count', key: 'itemsCount', width: 12 },
        { header: 'Subtotal', key: 'subtotal', width: 12 },
        { header: 'Discount', key: 'discountAmount', width: 12 },
        { header: 'Tax', key: 'tax', width: 12 },
        { header: 'Grand Total', key: 'grandTotal', width: 12 },
        { header: 'Profit', key: 'totalProfit', width: 12 },
        { header: 'Payment Method', key: 'paymentMethod', width: 15 },
        { header: 'Points Earned', key: 'pointsEarned', width: 12 },
    ];

    // Add filter info
    const filterRow = worksheet.addRow([]);
    filterRow.getCell(1).value = `Report Generated: ${new Date().toLocaleDateString()}`;
    filterRow.font = { italic: true };

    if (filters.startDate || filters.endDate) {
        const filterRow2 = worksheet.addRow([]);
        let dateRange = 'Date Range: ';
        if (filters.startDate) dateRange += new Date(filters.startDate).toLocaleDateString();
        if (filters.endDate) dateRange += ' to ' + new Date(filters.endDate).toLocaleDateString();
        filterRow2.getCell(1).value = dateRange;
        filterRow2.font = { italic: true };
    }

    worksheet.addRow([]);

    // Add data rows
    for (const sale of sales) {
        worksheet.addRow({
            invoiceNumber: sale.invoiceNumber,
            date: new Date(sale.createdAt).toLocaleDateString(),
            customerName: sale.customerName,
            itemsCount: (sale.items || []).length,
            subtotal: sale.subtotal,
            discountAmount: sale.discountAmount || 0,
            tax: sale.tax || 0,
            grandTotal: sale.grandTotal,
            totalProfit: sale.totalProfit || 0,
            paymentMethod: sale.paymentMethod,
            pointsEarned: sale.pointsEarned || 0,
        });
    }

    // Format header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };

    // Format currency columns
    worksheet.columns.forEach((col) => {
        if (['subtotal', 'discountAmount', 'tax', 'grandTotal', 'totalProfit'].includes(col.key)) {
            worksheet.getColumn(col.key).numFmt = '$#,##0.00';
        }
    });

    // Add summary section
    const summaryStartRow = sales.length + 5;
    worksheet.getRow(summaryStartRow).getCell(1).value = 'SUMMARY';
    worksheet.getRow(summaryStartRow).font = { bold: true, size: 12 };

    const totalSubtotal = sales.reduce((sum, s) => sum + (s.subtotal || 0), 0);
    const totalDiscount = sales.reduce((sum, s) => sum + (s.discountAmount || 0), 0);
    const totalTax = sales.reduce((sum, s) => sum + (s.tax || 0), 0);
    const totalGrandTotal = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalProfit = sales.reduce((sum, s) => sum + (s.totalProfit || 0), 0);
    const totalPoints = sales.reduce((sum, s) => sum + (s.pointsEarned || 0), 0);

    worksheet.getRow(summaryStartRow + 1).getCell(1).value = 'Total Sales';
    worksheet.getRow(summaryStartRow + 1).getCell(5).value = totalSubtotal;
    worksheet.getRow(summaryStartRow + 1).getCell(5).numFmt = '$#,##0.00';

    worksheet.getRow(summaryStartRow + 2).getCell(1).value = 'Total Discount';
    worksheet.getRow(summaryStartRow + 2).getCell(5).value = totalDiscount;
    worksheet.getRow(summaryStartRow + 2).getCell(5).numFmt = '$#,##0.00';

    worksheet.getRow(summaryStartRow + 3).getCell(1).value = 'Total Tax';
    worksheet.getRow(summaryStartRow + 3).getCell(5).value = totalTax;
    worksheet.getRow(summaryStartRow + 3).getCell(5).numFmt = '$#,##0.00';

    worksheet.getRow(summaryStartRow + 4).getCell(1).value = 'Total Revenue';
    worksheet.getRow(summaryStartRow + 4).getCell(5).value = totalGrandTotal;
    worksheet.getRow(summaryStartRow + 4).getCell(5).numFmt = '$#,##0.00';
    worksheet.getRow(summaryStartRow + 4).font = { bold: true };

    worksheet.getRow(summaryStartRow + 5).getCell(1).value = 'Total Profit';
    worksheet.getRow(summaryStartRow + 5).getCell(5).value = totalProfit;
    worksheet.getRow(summaryStartRow + 5).getCell(5).numFmt = '$#,##0.00';
    worksheet.getRow(summaryStartRow + 5).font = { bold: true };

    worksheet.getRow(summaryStartRow + 6).getCell(1).value = 'Total Loyalty Points';
    worksheet.getRow(summaryStartRow + 6).getCell(5).value = totalPoints;

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

const generateDetailedExcelReport = async (sales) => {
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 20 },
    ];

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalProfit = sales.reduce((sum, s) => sum + (s.totalProfit || 0), 0);
    const avgTransaction = totalRevenue / totalSales;
    const totalDiscount = sales.reduce((sum, s) => sum + (s.discountAmount || 0), 0);

    summarySheet.addRow({ metric: 'Total Transactions', value: totalSales });
    summarySheet.addRow({ metric: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` });
    summarySheet.addRow({ metric: 'Total Profit', value: `$${totalProfit.toFixed(2)}` });
    summarySheet.addRow({ metric: 'Average Transaction', value: `$${avgTransaction.toFixed(2)}` });
    summarySheet.addRow({ metric: 'Total Discounts', value: `$${totalDiscount.toFixed(2)}` });
    summarySheet.addRow({ metric: 'Profit Margin', value: `${((totalProfit / totalRevenue) * 100).toFixed(2)}%` });

    // Sheet 2: Detailed Sales
    const detailedSheet = workbook.addWorksheet('Detailed Sales');
    detailedSheet.columns = [
        { header: 'Invoice Number', key: 'invoiceNumber', width: 15 },
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Customer Name', key: 'customerName', width: 20 },
        { header: 'Items', key: 'items', width: 30 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Unit Price', key: 'unitPrice', width: 12 },
        { header: 'Item Total', key: 'itemTotal', width: 12 },
        { header: 'Grand Total', key: 'grandTotal', width: 12 },
        { header: 'Payment', key: 'paymentMethod', width: 12 },
    ];

    for (const sale of sales) {
        for (const item of sale.items || []) {
            detailedSheet.addRow({
                invoiceNumber: sale.invoiceNumber,
                date: new Date(sale.createdAt).toLocaleDateString(),
                customerName: sale.customerName,
                items: item.productName,
                quantity: item.quantity,
                unitPrice: `$${item.unitPrice.toFixed(2)}`,
                itemTotal: `$${item.total.toFixed(2)}`,
                grandTotal: sale.grandTotal,
                paymentMethod: sale.paymentMethod,
            });
        }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

export { generatePDFInvoice, generateExcelReport, generateDetailedExcelReport };
