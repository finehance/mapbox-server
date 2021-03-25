const { Duplex } = require("stream");

class Throttle extends Duplex {
  constructor(ms, props) {
    super(props);
    this.delay = ms;
  }

  _write(chunk, encoding, callback) {
    this.push(chunk);
    setTimeout(callback, this.delay);
  }

  _read() {}

  _final() {
    this.push(null);
  }
}

module.exports = Throttle;
