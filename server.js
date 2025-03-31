import express from 'express';
import fetch from 'node-fetch';

const app = express();

// Конфигурация Solana RPC
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

// Прокси для HTTP запросов
app.use(express.json());

app.post('/', async (req, res) => {
  try {
    const response = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('HTTP Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});