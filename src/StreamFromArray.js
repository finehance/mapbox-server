const { Readable } = require("stream");

class StreamFromArray extends Readable {
  constructor(array) {
    super({ objectMode: true });
    this.array = array;
    this.index = 0;
  }
  _read() {
    if (this.index < this.array.length) {
      const chunk = {
        data: this.array[this.index],
        index: this.index,
      };
      this.push(chunk);
      this.index += 1;
    } else {
      this.push(null);
    }
  }
}

module.exports = StreamFromArray;
