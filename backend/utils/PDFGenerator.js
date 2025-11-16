const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create receipts directory if it doesn't exist
const receiptsDir = path.join(__dirname, '../receipts');
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
}

exports.generateOrderReceiptPDF = async (order, user) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const fileName = `receipt_${order._id}_${Date.now()}.pdf`;
            const filePath = path.join(receiptsDir, fileName);
            
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Colors
            const primaryColor = '#2E7D32'; // Green
            const secondaryColor = '#4CAF50'; // Light green
            const accentColor = '#FF6B35'; // Orange accent
            const textColor = '#333333';
            const lightGray = '#F5F5F5';

            // Header with logo and company info
            doc.rect(0, 0, doc.page.width, 100)
               .fill(primaryColor);
            
            doc.fontSize(24).font('Helvetica-Bold')
               .fillColor('white')
               .text('GARDENIA', 50, 30);
            
            doc.fontSize(10).font('Helvetica')
               .fillColor('white')
               .text('Plant Nursery & Garden Supplies', 50, 60);
            
            doc.fontSize(8).font('Helvetica-Oblique')
               .fillColor('white')
               .text('Bringing Nature to Your Doorstep', 50, 75);

            // Receipt Title
            doc.fontSize(18).font('Helvetica-Bold')
               .fillColor(textColor)
               .text('ORDER RECEIPT', doc.page.width - 200, 120, { align: 'right' });

            // Order ID and Date
            doc.fontSize(10).font('Helvetica')
               .fillColor('#666')
               .text(`Receipt #: ${order._id.toString().substring(0, 8).toUpperCase()}`, 50, 120)
               .text(`Date: ${new Date(order.createdAt).toLocaleString('en-PH')}`, 50, 135);

            // Two-column layout
            const col1 = 50;
            const col2 = 300;
            let yPosition = 170;

            // Order Details Section
            doc.rect(col1, yPosition, doc.page.width - 100, 20)
               .fill(lightGray);
            
            doc.fontSize(12).font('Helvetica-Bold')
               .fillColor(primaryColor)
               .text('ORDER DETAILS', col1 + 10, yPosition + 5);
            
            yPosition += 30;

            doc.fontSize(10).font('Helvetica')
               .fillColor(textColor)
               .text(`Status:`, col1, yPosition)
               .font('Helvetica-Bold')
               .text(order.orderStatus, col1 + 40, yPosition);
            
            yPosition += 20;

            // Customer Information Section
            doc.rect(col2, 170, doc.page.width - col2 - 50, 20)
               .fill(lightGray);
            
            doc.fontSize(12).font('Helvetica-Bold')
               .fillColor(primaryColor)
               .text('CUSTOMER INFORMATION', col2 + 10, 175);
            
            let customerY = 200;
            
            doc.fontSize(10).font('Helvetica')
               .fillColor(textColor)
               .text(`Name: ${user.name}`, col2, customerY)
               .text(`Email: ${user.email}`, col2, customerY + 15);
            
            if (user.address) {
                const addressLines = [
                    `${user.address.street || ''}`,
                    `${user.address.barangay || ''}`,
                    `${user.address.city || ''}, ${user.address.zipcode || ''}`
                ].filter(line => line.trim());
                
                addressLines.forEach((line, index) => {
                    doc.text(`Address: ${line}`, col2, customerY + 30 + (index * 15));
                });
                customerY += addressLines.length * 15;
            }
            
            doc.text(`Phone: ${user.contact || 'Not provided'}`, col2, customerY + 45);

            // Order Items Table Header
            yPosition = Math.max(yPosition, customerY + 70);
            
            doc.rect(col1, yPosition, doc.page.width - 100, 20)
               .fill(secondaryColor);
            
            doc.fontSize(11).font('Helvetica-Bold')
               .fillColor('white')
               .text('PRODUCT', col1 + 15, yPosition + 5)
               .text('QTY', 350, yPosition + 5)
               .text('PRICE', 400, yPosition + 5)
               .text('TOTAL', 470, yPosition + 5);
            
            yPosition += 25;

            // Order Items
            doc.fontSize(10).font('Helvetica');
            order.orderItems.forEach((item, index) => {
                if (yPosition > 650) {
                    doc.addPage();
                    yPosition = 50;
                    // Add table header on new page
                    doc.rect(col1, yPosition, doc.page.width - 100, 20)
                       .fill(secondaryColor);
                    doc.fontSize(11).font('Helvetica-Bold')
                       .fillColor('white')
                       .text('PRODUCT', col1 + 15, yPosition + 5)
                       .text('QTY', 350, yPosition + 5)
                       .text('PRICE', 400, yPosition + 5)
                       .text('TOTAL', 470, yPosition + 5);
                    yPosition += 25;
                }

                // Alternate row colors
                if (index % 2 === 0) {
                    doc.rect(col1, yPosition, doc.page.width - 100, 20)
                       .fill('#FAFAFA');
                }

                doc.fillColor(textColor)
                   .text(item.name, col1 + 10, yPosition + 5, { width: 250 })
                   .text(item.quantity.toString(), 350, yPosition + 5)
                   .text(formatCurrency(item.price), 400, yPosition + 5)
                   .text(formatCurrency(item.price * item.quantity), 470, yPosition + 5);
                
                yPosition += 20;
            });

            // Totals Section
            yPosition += 20;
            
            doc.rect(col1, yPosition, doc.page.width - 100, 1)
               .fill('#DDD');
            
            yPosition += 15;

            doc.fontSize(11).font('Helvetica')
               .fillColor(textColor)
               .text('Subtotal:', 400, yPosition)
               .text(formatCurrency(order.itemsPrice), 470, yPosition);
            
            yPosition += 20;

            doc.text('Tax (10%):', 400, yPosition)
               .text(formatCurrency(order.taxPrice), 470, yPosition);
            
            yPosition += 20;

            doc.text('Shipping:', 400, yPosition)
               .text(formatCurrency(order.shippingPrice), 470, yPosition);
            
            yPosition += 25;

            doc.rect(400, yPosition, 120, 1)
               .fill(primaryColor);
            
            yPosition += 10;

            doc.fontSize(14).font('Helvetica-Bold')
               .fillColor(accentColor)
               .text('GRAND TOTAL:', 400, yPosition)
               .text(formatCurrency(order.totalPrice), 470, yPosition);
            
            yPosition += 40;

            // Footer
            doc.rect(0, doc.page.height - 80, doc.page.width, 80)
               .fill(lightGray);
            
            doc.fontSize(9).font('Helvetica-Oblique')
               .fillColor('#666')
               .text('Thank you for choosing Gardenia! We appreciate your business.', 50, doc.page.height - 60)
               .text('For any inquiries, please contact: support@gardenia.com | +63 912 345 6789', 50, doc.page.height - 45)
               .text(`Receipt generated on: ${new Date().toLocaleString('en-PH')}`, 50, doc.page.height - 30)
               .text('© 2024 Gardenia. All rights reserved.', doc.page.width - 200, doc.page.height - 30, { align: 'right' });

            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

// Helper function to format currency
function formatCurrency(amount) {
    return `₱${amount.toFixed(2)}`;
}

// Clean up old receipts (optional - can be called periodically)
exports.cleanupOldReceipts = (maxAgeHours = 24) => {
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    
    fs.readdir(receiptsDir, (err, files) => {
        if (err) return;
        
        files.forEach(file => {
            const filePath = path.join(receiptsDir, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && (now - stats.mtimeMs) > maxAge) {
                    fs.unlink(filePath, () => {});
                }
            });
        });
    });
};