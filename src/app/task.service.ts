import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Task } from './task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  updateTask(task: Task) {
    return this.http.put("http://localhost:8080/tasks", task);
  }

  addTask(task: Task) {
    return this.http.post("http://localhost:8080/tasks", task);
  }

  getTasks() {
    return this.http.get<Task[]>("http://localhost:8080/tasks");
  }

  deleteTask(task) {
    const httpParams = new HttpParams().set('taskId', task.taskId);
    const options = { params: httpParams };
    return this.http.delete("http://localhost:8080/tasks", options);
  }
}
