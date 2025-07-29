const ctx = document.getElementById('chart').getContext('2d');
let chart;  

async function fetchPrice(symbol) {
  try {
    const res  = await fetch(`/api/price?symbol=${symbol}`);
    const data = await res.json();

    // 1) network or server error
    if (!res.ok) {
      throw new Error(data.error || 'Server error');
    }
    // 2) our SW’s offline fallback
    if (data.offline) {
      throw new Error('You are offline');
    }
    // 3) finally, we have a real price
    return data.price;
  } catch (err) {
    // display a user-friendly message
    const msg = err.message.includes('offline')
      ? 'Offline – cannot fetch price'
      : `Error fetching price: ${err.message}`;
    document.getElementById('price').textContent = msg;
    // signal upstream that we failed
    throw err;
  }
}

async function fetchHistory(symbol){
 try {
    const res  = await fetch(`/api/history?symbol=${symbol}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Server error');
    }
    if (data.offline) {
      throw new Error('You are offline');
    }
    return data.points;   // success!
  } catch (err) {
    // clear out the old chart/table
    document.getElementById('history-table').innerHTML = '';
    // show a message below the chart
    document.getElementById('price').textContent =
      err.message.includes('offline')
        ? 'Offline – history unavailable'
        : `Error loading history: ${err.message}`;
    // don’t proceed to render
    throw err;
  }
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

   try {
    const price  = await fetchPrice(symbol);
    document.getElementById('price').textContent = `$${price.toFixed(2)}`;

    const points = await fetchHistory(symbol);
    renderChart(points);
    renderTable(points);
  } catch {
    // errors are already shown by the helpers
  }
});


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { 
  navigator.serviceWorker.register('/sw.js' , {
  scope: '/my-sicure-fin/'
})
  .then(reg => {
       console.log('ServiceWorker registered (scope:', reg.scope, ')');

       //Listen for updates to the SW (new version found)
       reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        newSW.addEventListener('statechange', () => {
          if ( newSW.state === 'installed') {
            if (navigator.serviceWorker.controller){
              // Show a “Refresh to update” banner/button
              showUpdateUI(() => window.location.reload());
              console.log('New SW installed -please refresh');
            } else {
              console.log('Sw installed for first time');
            }
          }
        })
       })
  })
  .catch(err => console.log('SW registration failed:'. err));
  })
}

