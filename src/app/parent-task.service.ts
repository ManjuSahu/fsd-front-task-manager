import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ParentTask } from './parent-task';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParentTaskService {

  constructor(private http: HttpClient) { }

  updateParentTask(parentTask: ParentTask) {
    return this.http.put(environment.baseUrl + "/parentTasks", parentTask);
  }

  addParentTask(parentTask: any) {
    return this.http.post(environment.baseUrl + "/parentTasks", parentTask);
  }

  getParentTasks() {
    return this.http.get<ParentTask[]>(environment.baseUrl + "/parentTasks");
  }
}
