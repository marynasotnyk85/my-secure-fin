const ctx = document.getElementById('chart').getContext('2d');
let chart;  

async function fetchPrice(symbol) {
  const res = await fetch(`/api/price?symbol=${symbol}`);
  const { price } = await res.json();
  document.getElementById('price').textContent = `$${price.toFixed(2)}`;
}

async function fetchHistory(symbol){
  const res = await fetch(`/api/history?symbol=${symbol}`);
  const { points } = await res.json();
  return points;
}

function renderChart(points){
  const labels = points.map(p => p.date);
  const data = points.map(p => p.close);

  //destroy old chart if exist
if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Close Price',
        data,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: { display: true, title: { display: true, text: 'Date' } },
        y: { display: true, title: { display: true, text: 'Price (USD)' } }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function renderTable(points) {
  const table = document.getElementById('history-table');
  // clear old rows
  table.innerHTML = `
    <tr><th>Date</th><th>Close Price</th></tr>
  `;
  points.forEach(({ date, close }) => {
    const row = table.insertRow();
    row.insertCell().textContent = date;
    row.insertCell().textContent = `$${close.toFixed(2)}`;
  });
}



document.getElementById('fetch').addEventListener('click', async () => {
  const symbol = document.getElementById('symbol').value.toUpperCase();
  if (!symbol) return;

  await fetchPrice(symbol);

  const points = await fetchHistory(symbol);

  renderChart(points);
  renderTable(points);
});


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

navigator.serviceWorker.getRegistrations()
  .then(rs => rs.forEach(r => r.unregister()));