const PDFDocument = require('pdfkit');
const fs = require('fs');

function generarFactura(pedido, productos) {
  const doc = new PDFDocument();
  const filename = `factura_${pedido.id}.pdf`;
  doc.pipe(fs.createWriteStream(filename));

  doc.fontSize(20).text("Factura de Compra", { align: 'center' });
  doc.moveDown();

  doc.text(`Pedido N°: ${pedido.id}`);
  doc.text(`Usuario: ${pedido.userId}`);
  doc.text(`Fecha: ${pedido.createdAt}`);
  doc.moveDown();

  productos.forEach(p => {
    doc.text(`${p.cantidad} x ${p.name} - $${p.precio}`);
  });

  doc.moveDown();
  doc.text(`Total: $${pedido.total}`, { align: 'right' });

  doc.end();

  return filename; // devuelve la ruta del archivo generado
}

module.exports = { generarFactura };
