import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ParentTask } from './parent-task';

@Injectable({
  providedIn: 'root'
})
export class ParentTaskService {

  constructor(private http: HttpClient) { }

  updateParentTask(parentTask: ParentTask) {
    return this.http.put("http://localhost:8080/parentTasks", parentTask);
  }

  addParentTask(parentTask: any) {
    return this.http.post("http://localhost:8080/parentTasks", parentTask);
  }

  getParentTasks() {
    return this.http.get<ParentTask[]>("http://localhost:8080/parentTasks");
  }

  deleteParentTask(parentTask) {
    const httpParams = new HttpParams().set('parentTaskId', parentTask.parentTaskId);
    const options = { params: httpParams };
    return this.http.delete("http://localhost:8080/parentTasks", options);
  }
}
