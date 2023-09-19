const WebSocket = require('ws');

let rooms = {};

const wss = new WebSocket.Server({ port: 8765 });

wss.on('connection', function connection(ws) {
  let roomName = null;

  ws.on('message', function incoming(message) {
    // 初回メッセージの検証
    if (!roomName) {
      if (typeof message !== 'string' || message.length  > 10) { // 例: 部屋名の長さ制限
        ws.send('Invalid room name');
        ws.close();
        return;
      }
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
    if (roomName && rooms[roomName]) {
      rooms[roomName].delete(ws);
      // 部屋のクリーンアップ
      if (rooms[roomName].size === 0) {
        delete rooms[roomName];
      }
    }
  });

  ws.on('error', function error(e) {
    // エラーロギング
    console.error(`WebSocket Error: ${e.message}`);

    // クライアントへの通知 (詳細なエラー情報は送信しない)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('An error occurred. Please try again later.');
    }

    // リソースのクリーンアップ (この例では部屋からのクライアントの削除)
    if (roomName && rooms[roomName]) {
      rooms[roomName].delete(ws);
      if (rooms[roomName].size === 0) {
        delete rooms[roomName];
      }
    }

    // アラート通知 (例: Slack、Eメールなどの通知サービスを使用)
    // sendAlertToOpsTeam(`WebSocket Error: ${e.message}`);
  });
});
