const io = require('socket.io-client');
const fetch = require('node-fetch');

// First, let's login to get a valid token
async function testWebSocket() {
  try {
    console.log('Testing WebSocket connection...');
    
    // Try to connect to the WebSocket server
    const socket = io('http://localhost:4004', {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });
    
    socket.on('connect', () => {
      console.log('✅ Successfully connected to WebSocket server');
      socket.disconnect();
    });
    
    socket.on('connect_error', (error) => {
      console.log('❌ WebSocket connection error:', error.message);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
    
    // Wait a bit to see if connection succeeds
    setTimeout(() => {
      if (!socket.connected) {
        console.log('Connection test completed');
        socket.close();
      }
    }, 5000);
    
  } catch (error) {
    console.error('Error testing WebSocket:', error);
  }
}

testWebSocket();