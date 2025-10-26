const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const Pedido = require('./Pedido');
const PedidoDetalle = require('./PedidoDetalle');
const Favorito = require('./Favorito');
const Categoria = require('./Categoria');
const Pregunta = require('./Pregunta');
const Review = require('./Review');
const Envio = require('./Envio');
const Direccion = require('./Direccion');
const Reputacion = require('./Reputacion');

// Usuario -> Productos
User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });

// Carrito
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

// Pedidos
User.hasMany(Pedido, { foreignKey: 'userId' });
Pedido.belongsTo(User, { foreignKey: 'userId' });

// Pedido Detalles (lineas de compra)
Pedido.hasMany(PedidoDetalle, { foreignKey: 'pedidoId' });
PedidoDetalle.belongsTo(Pedido, { foreignKey: 'pedidoId' });

Product.hasMany(PedidoDetalle, { foreignKey: 'productId' });
PedidoDetalle.belongsTo(Product, { foreignKey: 'productId' });

// Categorias
Categoria.hasMany(Product, { foreignKey: 'categoriaId' });
Product.belongsTo(Categoria, { foreignKey: 'categoriaId' });

// Favoritos
User.hasMany(Favorito, { foreignKey: 'userId' });
Favorito.belongsTo(User, { foreignKey: 'userId' });
Favorito.belongsTo(Product, { foreignKey: 'productId' });

// Preguntas
User.hasMany(Pregunta, { foreignKey: 'userId' });
Pregunta.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Pregunta, { foreignKey: 'productId' });
Pregunta.belongsTo(Product, { foreignKey: 'productId' });

// Reviews
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Direcciones
User.hasMany(Direccion, { foreignKey: 'userId' });
Direccion.belongsTo(User, { foreignKey: 'userId' });

// Envío
Pedido.hasOne(Envio, { foreignKey: 'pedidoId' });
Envio.belongsTo(Pedido, { foreignKey: 'pedidoId' });

// Reputación
User.hasOne(Reputacion, { foreignKey: 'userId' });
Reputacion.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Product,
  Cart,
  Pedido,
  PedidoDetalle,
  Favorito,
  Categoria,
  Pregunta,
  Review,
  Envio,
  Direccion,
  Reputacion
};
