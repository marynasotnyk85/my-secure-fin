document.getElementById('fetch').addEventListener('click', async () => {
  const sym = document.getElementById('symbol').value.toUpperCase();
  const res = await fetch(`/api/price?symbol=${sym}`);
  const data = await res.json();
  document.getElementById('price').textContent = `$${data.price}`;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

navigator.serviceWorker.getRegistrations()
  .then(rs => rs.forEach(r => r.unregister()));