const Product = require('../models/Product');
const { Op } = require('sequelize');

const searchController = {
  buscar: async (req, res) => {
    const q = req.query.q?.trim();
    if (!q) return res.redirect('/home');

    try {
      const productos = await Product.findAll({
        where: {
          name: { [Op.like]: `%${q}%` } // busca coincidencias parciales
        }
      });

      res.render('search-results', {
        titulo: `Resultados para "${q}"`,
        usuario: req.session.user || null,
        productos,
        query: q
      });
    } catch (err) {
      console.error('💥 Error en búsqueda:', err);
      res.status(500).send('Error al realizar la búsqueda');
    }
  }
};

module.exports = searchController;
