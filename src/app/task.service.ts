import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Task } from './task';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  updateTask(task: Task) {
    return this.http.put(environment.baseUrl + "/tasks", task);
  }

  addTask(task: Task) {
    return this.http.post(environment.baseUrl + "/tasks", task);
  }

  getTasks() {
    return this.http.get<Task[]>(environment.baseUrl + "/tasks");
  }

  deleteTask(task) {
    const httpParams = new HttpParams().set('taskId', task.taskId);
    const options = { params: httpParams };
    return this.http.delete(environment.baseUrl + "/tasks", options);
  }
}
