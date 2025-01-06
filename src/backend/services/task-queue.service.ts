import { Injectable } from "injection-js";
import { randomUUID } from "crypto";

interface Task<TaskType> {
  task: any;
  taskType: TaskType;
}

type Subscriber = {
  id: string;
  callback: (task: any) => Promise<any>;
};

@Injectable()
export class TaskQueueService<TaskType extends string> {
  private taskQueues: Record<TaskType, Task<any>[]> = {} as Record<
    TaskType,
    Task<any>[]
  >;
  private subscribers: Record<
    TaskType,
    Record<string, Subscriber>
  > = {} as Record<TaskType, Record<string, Subscriber>>;
  private isProcessing: Record<TaskType, boolean> = {} as Record<
    TaskType,
    boolean
  >;
  private responses: Record<
    TaskType,
    Record<string, any[]>
  > = {} as Record<TaskType, Record<string, any[]>>;
  private errors: Record<TaskType, Record<string, any[]>> =
    {} as Record<TaskType, Record<string, any[]>>;

  /**
   * Publishes a task to the queue.
   * @param taskType The type of the task
   * @param task The task to be added to the queue
   */
  publishTask(taskType: TaskType, task: any): void {
    if (!this.taskQueues[taskType]) {
      this.taskQueues[taskType] = [];
    }
    this.taskQueues[taskType].push({ task, taskType });
    if (!this.isProcessing[taskType]) {
      this.isProcessing[taskType] = false;
      this.processTasks(taskType);
    }
  }

  /**
   * Subscribes a callback to process tasks.
   * @param taskType The type of the task
   * @param subscriber A callback function that processes a task and returns a value.
   */
  async subscribe(
    taskType: TaskType,
    subscriber: (task: any) => Promise<any>
  ): Promise<string> {
    const subscriberId = randomUUID();
    if (!this.subscribers[taskType]) {
      this.subscribers[taskType] = {};
    }
    this.subscribers[taskType as string][subscriberId] = {
      id: subscriberId,
      callback: subscriber,
    };
    if (!this.isProcessing[taskType]) {
      this.isProcessing[taskType] = false;
      this.processTasks(taskType);
    }
    return subscriberId;
  }

  /**
   * Processes the tasks in the queue using the registered subscribers.
   * It processes each task sequentially, passing it to all the subscribers and stores the responses.
   */
  private async processTasks(taskType: TaskType): Promise<void> {
    if (this.isProcessing[taskType]) {
      return;
    }

    this.isProcessing[taskType] = true;
    while (this.taskQueues[taskType]?.length > 0) {
      const currentTask = this.taskQueues[taskType].shift();
      if (currentTask) {
        for (const subscriberId in this.subscribers[taskType]) {
          const subscriber = this.subscribers[taskType][subscriberId];
          try {
            const response = await subscriber.callback(currentTask.task);
            if (!this.responses[taskType]) {
              this.responses[taskType] = {};
            }
            if (!this.responses[taskType][subscriber.id]) {
              this.responses[taskType as string][subscriber.id] = [];
            }
            this.responses[taskType][subscriber.id].push({
              ...currentTask.taskType,
              response,
            });
          } catch (error: any) {
            if (!this.errors[taskType]) {
              this.errors[taskType] = {};
            }
            if (!this.errors[taskType][subscriber.id]) {
              this.errors[taskType as string][subscriber.id] = [];
            }
            this.errors[taskType][subscriber.id].push({
              ...currentTask.taskType,
              error,
            });
            console.error("Error while processing a task", error);
          }
        }
      }
    }
    this.isProcessing[taskType] = false;
  }

  getResponses(taskType: TaskType, subscriberId: string): any[] {
    return this.responses[taskType]?.[subscriberId] || [];
  }

  getErrors(taskType: TaskType, subscriberId: string): any[] {
    return this.errors[taskType]?.[subscriberId] || [];
  }
}