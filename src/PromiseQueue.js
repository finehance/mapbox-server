const logUpdate = require("log-update");
const toX = () => "X";

class PromiseQueue {
  constructor(promises = [], concurrentCount = 1) {
    this.concurrent = concurrentCount;
    this.total = promises.length;
    this.todo = promises;
    this.running = [];
    this.complete = [];
  }

  get runAnother() {
    return this.running.length < this.concurrent && this.todo.length;
  }

  graphTasks() {
    var { todo, running, complete } = this;
    logUpdate(`
    todo: [${todo.map(toX)}],
    running: [${running.map(toX)}],
    complete: [${complete.map(toX)}]
    `);
  }

  run() {
    while (this.runAnother) {
      const promise = this.todo.shift();
      promise.then(() => {
        this.complete.push(this.running.shift());
        this.graphTasks();

        this.run();
      });
      this.running.push(promise);
      this.graphTasks();
    }
  }
}

module.exports = PromiseQueue;
