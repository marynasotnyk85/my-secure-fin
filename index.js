require('dotenv').config();
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const app     = express();

const devOrigin  = 'http://localhost:3000';
const prodOrigin = 'https://your-fin-domain.com';
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [ prodOrigin ]
  : [ devOrigin ];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET','POST'],       
  credentials: false, // true -> if you need cookies/auth
}));

app.use((req, res, next) => {
  res.set('X-Frame-Options', 'DENY');
  next();
});


// Security headers 
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://cdn.jsdelivr.net"],  // Chart.js CDN
      "connect-src": ["'self'", "https://www.alphavantage.co"], // API calls
      "style-src": ["'self'", "'unsafe-inline'"], // inline critical CSS
      "img-src": ["'self'", "data:"],
      "worker-src": ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false 
}));

app.use(cors());

app.use(express.static('public')); 
app.listen(3000, ()=> console.log('Listening on 3000'));

const axios = require('axios');

app.get('/api/price', async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol is required' });
  if (!process.env.FIN_API_KEY) {
    return res.status(500).json({ error: 'FIN_API_KEY is missing' });
  }

  try {
    const { data } = await axios.get(
      'https://www.alphavantage.co/query',
      {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: process.env.FIN_API_KEY
        }
      }
    );

    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error('No price returned from API');
    }

    res.json({ price: parseFloat(quote['05. price']) });
  } catch (err) {
    console.error('AlphaVantage error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Upstream API failed', details: err.message });
  }
});

app.get('/api/history', async(req, res) => {
  const {symbol} = req.query;
  if (!symbol) return res.status(400).json({error:'symbol is required'});

  const apiKey = process.env.FIN_API_KEY;
  if (!apiKey) return res.status(500).json({error:'FIN_API_KEY missing'});

  try {
    const {data} = await axios.get(
      'https://www.alphavantage.co/query',
      {
        params: {
          function: 'TIME_SERIES_MONTHLY',
          symbol,
          outputsize: 'compact',
          apikey: apiKey,
        }
      }
    );
 // return res.json(data);


    const series = data['Monthly Time Series'];
       if (!series) {
      return res.status(500).json({ error: 'No monthly series', raw: data });
    }


    //Convert to sort array of { date, close}
    const points = Object.entries(series)
    .map(([date, vals]) => ({
      date,
      close: parseFloat(vals['4. close'])
    }))
    .sort((a,b) => new Date(a.date) - new Date(b.date))

    res.json({symbol, points})
    
  }
  catch(err) {
    console.error('history error: ', err.message);
    res.status(500).json({ error: 'API error', details: err.message})
  }
})




