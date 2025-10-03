const { generarFactura } = require('../helpers/pdfGenerator');

exports.crearPedido = async (req, res) => {
  try {
    // aquí simulo un pedido
    const pedido = {
      id: 123,
      userId: req.body.userId,
      createdAt: new Date(),
      total: 2500
    };

    const productos = [
      { cantidad: 1, name: "Laptop Gamer", precio: 2000 },
      { cantidad: 1, name: "Mouse", precio: 500 }
    ];

    // Generar PDF
    const archivo = generarFactura(pedido, productos);

    res.json({ mensaje: "Pedido creado", pdf: archivo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
