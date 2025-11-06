document.addEventListener('DOMContentLoaded', () => {

  const actualizarTotal = () => {
    let total = 0;
    document.querySelectorAll('.producto-carrito').forEach(prod => {
      const subtotalText = prod.querySelector('p:last-child').textContent;
      const subtotal = parseFloat(subtotalText.replace(/\D/g, '')) || 0;
      total += subtotal;
    });
    const totalElement = document.querySelector('.total');
    if (totalElement) totalElement.textContent = `Total: $${total.toLocaleString()}`;
  };

  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cartId = btn.dataset.id;
      try {
        const res = await fetch('/carrito/eliminar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartId })
        });
        const data = await res.json();
        if (data.success) {
          btn.closest('.producto-carrito').remove();
          actualizarTotal();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
        alert('Error eliminando producto');
      }
    });
  });
});
