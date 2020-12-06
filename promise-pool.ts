class PromisePoolExecutor<T extends Promise<any>, R> {

  private workerQueue: T[];
  private workerCount: number;
  private maximumPoolSize: number;

  constructor(poolSize: number) {
    this.maximumPoolSize = poolSize;
    this.workerCount = 0;
    this.workerQueue = [];
  }

  public async execute(tasks: T[]) {
    for (const task of tasks) {
      if (this.workerCount >= this.maximumPoolSize) {
        await this.wait();
      }
      this.addWorker(task);
    }
  }

  private addWorker(task: T) {
    task
      .then((value) => {
        console.log(`Task id: ${value}`);
        this.workerQueue.shift();
        this.decrementWorkerCount();
      });

    this.workerQueue.push(task);
    this.incrementWorkerCount();
  }

  private async wait() {
    await Promise.race(this.workerQueue);
  }

  private incrementWorkerCount(): boolean {
    this.workerCount += 1;
    return true;
  }


  private decrementWorkerCount(): boolean {
    this.workerCount -= 1;
    return true;
  }
}

const task = (id: number) => new Promise(resolve => setTimeout(() => resolve(id), 3000));
const tasks = [];
for (const i of Array(12).keys()) {
  tasks.push(task(i))
}
const executor = new PromisePoolExecutor<any, any>(10);
executor.execute(tasks);