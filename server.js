import express from 'express';
import WebSocket from 'ws';
import fetch from 'node-fetch';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Конфигурация Solana RPC
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const SOLANA_WS = "wss://api.mainnet-beta.solana.com";

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

// Прокси для WebSocket соединений
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  const solanaWs = new WebSocket(SOLANA_WS);
  
  solanaWs.on('open', () => {
    console.log('Connected to Solana WebSocket');
  });
  
  solanaWs.on('message', (data) => {
    ws.send(data.toString());
  });
  
  solanaWs.on('error', (error) => {
    console.error('Solana WebSocket Error:', error);
  });
  
  ws.on('message', (data) => {
    if (solanaWs.readyState === WebSocket.OPEN) {
      solanaWs.send(data.toString());
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    solanaWs.close();
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});