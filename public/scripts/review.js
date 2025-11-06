// 📦 review.js mejorado (editar usando el formulario)
document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main');
  const productId = main?.dataset?.id || document.getElementById('relacionados')?.dataset?.id;
  if (!productId) return;

  cargarResenas(productId);
  configurarEstrellas();
  manejarEnvioFormulario(productId);
});

let editandoId = null; // <-- variable global para saber si estás editando

// ==========================
// 🟡 Cargar reseñas del producto
// ==========================
async function cargarResenas(productId) {
  try {
    const res = await fetch(`/api/reviews/${productId}`);
    const data = await res.json();

    const cont = document.getElementById('reviews-container');
    const promedioDiv = document.getElementById('promedio');

    if (!data.reviews || data.reviews.length === 0) {
      cont.innerHTML = '<p>No hay reseñas todavía.</p>';
      promedioDiv.innerHTML = '';
      return;
    }

    const promedio = (
      data.reviews.reduce((a, r) => a + r.calificacion, 0) / data.reviews.length
    ).toFixed(1);

    promedioDiv.innerHTML = `
      <div class="promedio-stars">
        Promedio: ${'★'.repeat(Math.round(promedio))}${'☆'.repeat(5 - Math.round(promedio))} (${promedio}/5)
      </div>
    `;

    cont.innerHTML = data.reviews
      .map(
        (r) => `
      <div class="review" data-id="${r.id}">
        <strong>${r.User?.name || 'Usuario'}</strong>
        <p>${'★'.repeat(r.calificacion)}${'☆'.repeat(5 - r.calificacion)}</p>
        <p>${r.comentario}</p>
        ${data.userId === r.userId ? `
          <button class="edit-review">✏️ Editar</button>
          <button class="delete-review">🗑️ Eliminar</button>
        ` : ''}
      </div>
    `
      )
      .join('');
  } catch (err) {
    console.error('Error cargando reseñas:', err);
  }
}

// ==========================
// 🟢 Crear o actualizar reseña
// ==========================
function manejarEnvioFormulario(productId) {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const comentario = document.getElementById('comentario')?.value.trim();
    const calificacion = document.getElementById('calificacion')?.value;

    if (!calificacion || !comentario) {
      alert('Por favor completa todos los campos.');
      return;
    }

    try {
      const url = editandoId ? `/api/reviews/${editandoId}` : '/api/reviews';
      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, calificacion, comentario })
      });

      const data = await res.json();
      alert(data.message);

      if (data.success) {
        form.reset();
        document.querySelectorAll('.star').forEach((s) => s.classList.remove('active'));
        editandoId = null;
        form.querySelector('button[type="submit"]').textContent = 'Enviar reseña';
        cargarResenas(productId);
      }
    } catch (err) {
      console.error('Error al enviar reseña:', err);
    }
  });
}

// ==========================
// ⭐ Estrellas seleccionables
// ==========================
function configurarEstrellas() {
  const stars = document.querySelectorAll('.star');
  if (!stars.length) return;

  stars.forEach((star) => {
    star.addEventListener('click', (e) => {
      const value = e.target.dataset.value;
      document.getElementById('calificacion').value = value;
      stars.forEach((s) => s.classList.remove('active'));
      for (let i = 1; i <= value; i++) {
        document.querySelector(`.star[data-value="${i}"]`).classList.add('active');
      }
    });
  });
}

// ==========================
// ✏️ Editar / 🗑️ Eliminar reseña
// ==========================
document.addEventListener('click', async (e) => {
  // 🗑️ Eliminar reseña
  if (e.target.classList.contains('delete-review')) {
    const id = e.target.closest('.review').dataset.id;
    if (!confirm('¿Seguro que deseas eliminar esta reseña?')) return;

    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    if (data.success) location.reload();
  }

  // ✏️ Editar reseña (usar formulario)
  if (e.target.classList.contains('edit-review')) {
    const reviewDiv = e.target.closest('.review');
    editandoId = reviewDiv.dataset.id;

    const comentario = reviewDiv.querySelector('p:nth-of-type(2)').textContent;
    const estrellas = reviewDiv.querySelector('p:nth-of-type(1)').textContent.replace(/☆/g, '').length;

    const textarea = document.getElementById('comentario');
    const calificacionInput = document.getElementById('calificacion');
    const form = document.getElementById('reviewForm');

    textarea.value = comentario;
    calificacionInput.value = estrellas;

    document.querySelectorAll('.star').forEach((s) => s.classList.remove('active'));
    for (let i = 1; i <= estrellas; i++) {
      document.querySelector(`.star[data-value="${i}"]`).classList.add('active');
    }

    form.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

    // Desplazar el formulario a la vista
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
