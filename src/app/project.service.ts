import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Project } from './project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  updateProject(project: Project) {
    return this.http.put("http://localhost:8080/projects", project);
  }

  constructor(private http: HttpClient) { }

  addProject(project: Project) {
    return this.http.post("http://localhost:8080/projects", project);
  }

  getProjects() {
    return this.http.get<Project[]>("http://localhost:8080/projects");
  }

  deleteProject(project) {
    const httpParams = new HttpParams().set('projectId', project.projectId);
    const options = { params: httpParams };
    return this.http.delete("http://localhost:8080/projects", options);
  }
}
