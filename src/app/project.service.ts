import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Project } from './project';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  updateProject(project: Project) {
    return this.http.put(environment.baseUrl + "/projects", project);
  }

  constructor(private http: HttpClient) { }

  addProject(project: Project) {
    return this.http.post(environment.baseUrl + "/projects", project);
  }

  getProjects() {
    return this.http.get<Project[]>(environment.baseUrl + "/projects");
  }

  deleteProject(project) {
    const httpParams = new HttpParams().set('projectId', project.projectId);
    const options = { params: httpParams };
    return this.http.delete(environment.baseUrl + "/projects", options);
  }
}
