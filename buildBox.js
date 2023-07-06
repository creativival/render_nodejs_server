const WebSocket = require('ws');

class BuildBox {
  constructor(roomName) {
    this.ws = new WebSocket('wss://render-nodejs-server.onrender.com');
    this.roomName = roomName;
    this.boxes = [];
    this.size = 1.0;
    this.buildInterval = 0.01;
  }

  createBox(x, y, z, r, g, b) {
    x = Math.floor(x);
    y = Math.floor(y);
    z = Math.floor(z);
    this.boxes.push([x, y, z, r, g, b]);
  }

  removeBox(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    z = Math.floor(z);
    for (let i = 0; i < this.boxes.length; i++) {
      let box = this.boxes[i];
      if (box[0] === x && box[1] === y && box[2] === z) {
        this.boxes.splice(i, 1);
        break;
      }
    }
  }

  setBoxSize(boxSize) {
    this.size = boxSize;
  }

  setBuildInterval(interval) {
    this.buildInterval = interval;
  }

  clearData() {
    this.boxes = [];
    this.size = 1.0;
    this.buildInterval = 0.01;
  }

  sendData() {
    console.log('Sending data...');
    let date = new Date();
    let dataToSend = {
      boxes: this.boxes,
      size: this.size,
      interval: this.buildInterval,
      date: date.toISOString()
    };

    this.ws.on('open', () => {
      this.ws.send(this.roomName);
      console.log(`Joined room: ${this.roomName}`);
      this.ws.send(JSON.stringify(dataToSend));

      this.clearData();

      // Close the WebSocket connection after sending data
      this.ws.close();
    });
  }
}

module.exports = BuildBox;
