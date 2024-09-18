const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Order = require('../models/orderSchema');

// Generate invoice route
const downloadInvoice = async (req, res) => {
  const orderId = req.params.orderId;
console.log("object",req.params.orderId)
console.log(orderId)
  try {
    const order = await Order.findById(orderId).populate('products.product_id');

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Create a PDF document
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../invoices/invoice_${order.orderid}.pdf`);

    // Pipe the document to a file
    doc.pipe(fs.createWriteStream(filePath));

    // Add content to PDF
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.text(`Order ID: ${order.orderid}`, { align: 'left' });
    doc.text(`User ID: ${order.userid}`, { align: 'left' });
    doc.text(`Total Price: ₹${order.totalPrice}`, { align: 'left' });

    // Add product details
    order.products.forEach((item, index) => {
      doc.text(`Product ${index + 1}: ${item.product_id.name} (Qty: ${item.quantity})`, { align: 'left' });
    });

    // End the document
    doc.end();

    // Return the PDF file as a download
    res.download(filePath);
  } catch (err) {
    res.status(500).send('Error generating invoice');
  }
};

module.exports = { downloadInvoice };
