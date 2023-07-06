const WebSocket = require('ws');

let rooms = {}

const wss = new WebSocket.Server({port: 8765});

wss.on('connection', function connection(ws) {
  let roomName = null;

  ws.on('message', function incoming(message) {
    if (!roomName) {
      roomName = message;
      if (!rooms[roomName]) {
        rooms[roomName] = new Set();
      }
      rooms[roomName].add(ws);
      console.log(`Client joined room: ${roomName}`);
    } else {
      console.log(`Received message from client: ${message}`);
      // Broadcast the message to all other clients in the same room
      if (roomName in rooms) {
        rooms[roomName].forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    }
  });

  ws.on('close', function close() {
    // Unregister client
    if (roomName) {
      rooms[roomName].delete(ws);
    }
  });

  ws.on('error', function error(e) {
    console.log(`Error: ${e}`);
  });
});
