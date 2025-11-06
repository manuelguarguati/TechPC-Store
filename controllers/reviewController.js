// ------------------------------------------------------------
// 📦 Controlador de Reseñas (Review Controller)
// ------------------------------------------------------------
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

const reviewController = {
  // 🟢 Crear reseña
  create: async (req, res) => {
    try {
      const { productId, calificacion, comentario } = req.body;
      const usuario = req.session.user;

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Debes iniciar sesión para dejar una reseña.'
        });
      }

      if (!productId || !calificacion || !comentario) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios.'
        });
      }

      const producto = await Product.findByPk(productId);
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado.'
        });
      }

      const existingReview = await Review.findOne({
        where: { userId: usuario.id, productId }
      });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Ya calificaste este producto.'
        });
      }

      const nuevaReview = await Review.create({
        userId: usuario.id,
        productId,
        calificacion: parseInt(calificacion),
        comentario
      });

      res.json({
        success: true,
        message: 'Reseña enviada con éxito.',
        review: nuevaReview
      });
    } catch (error) {
      console.error('❌ Error al crear reseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error al guardar la reseña.'
      });
    }
  },

  // 🟡 Listar reseñas de un producto
  list: async (req, res) => {
    try {
      const { productId } = req.params;
      const usuario = req.session.user;

      const reviews = await Review.findAll({
        where: { productId },
        include: [{ model: User, attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        reviews,
        userId: usuario ? usuario.id : null
      });
    } catch (error) {
      console.error('❌ Error al obtener reseñas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reseñas.'
      });
    }
  },

  // 🟠 Editar reseña
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { calificacion, comentario } = req.body;
      const usuario = req.session.user;

      const review = await Review.findByPk(id);
      if (!review) return res.status(404).json({ success: false, message: 'Reseña no encontrada' });

      if (review.userId !== usuario.id)
        return res.status(403).json({ success: false, message: 'No puedes editar esta reseña' });

      await review.update({ calificacion, comentario });
      res.json({ success: true, message: 'Reseña actualizada correctamente' });
    } catch (error) {
      console.error('❌ Error al editar reseña:', error);
      res.status(500).json({ success: false, message: 'Error interno al editar reseña' });
    }
  },

  // 🔴 Eliminar reseña
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = req.session.user;

      const review = await Review.findByPk(id);
      if (!review) return res.status(404).json({ success: false, message: 'Reseña no encontrada' });

      if (review.userId !== usuario.id)
        return res.status(403).json({ success: false, message: 'No puedes eliminar esta reseña' });

      await review.destroy();
      res.json({ success: true, message: 'Reseña eliminada correctamente' });
    } catch (error) {
      console.error('❌ Error al eliminar reseña:', error);
      res.status(500).json({ success: false, message: 'Error interno al eliminar reseña' });
    }
  }
};

module.exports = reviewController;
