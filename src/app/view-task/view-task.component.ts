import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { Project } from '../project';
import { DOCUMENT } from '@angular/platform-browser';
import { TaskService } from '../task.service';
import { ProjectService } from '../project.service';
import { ParentTaskService } from '../parent-task.service';
import { ParentTask } from '../parent-task';
import { Task } from '../task';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css']
})
export class ViewTaskComponent implements OnInit {

  projects: Project[];

  searchedProjects: Project[];
  
  parentTasks: ParentTask[];

  allTasks: any[] = [];
  
  selectedProject: any = {};

  tasks: Task[];
  
  @ViewChild('closeSelectProjectModal') closeSelectProjectModal: ElementRef;


  constructor(@Inject(DOCUMENT) private document: Document,
  private taskService: TaskService,
  private projectService: ProjectService,
  private parentTaskService: ParentTaskService,
  private router: Router) { }

  ngOnInit() {
    this.projectService.getProjects().subscribe(data => {
      this.projects = this.searchedProjects = data;
    })
    this.parentTaskService.getParentTasks().subscribe(data => {
      this.parentTasks = data;
    })
    this.taskService.getTasks().subscribe(data => {
      this.tasks = this.tasks = data;
    })
  }

  searchProjects(event: any) {
    this.searchedProjects = this.projects;
    let keyword = event.target.value.toLowerCase();
    if(keyword) {
      console.log('searchProjects'+keyword);
      this.searchedProjects = this.projects.filter(
        project => (project.project.toLowerCase().includes(keyword))
      );
    } 
    console.log(this.searchedProjects);
  }

  selectProject(project: Project) {
    this.selectedProject = {
      projectId: project.projectId,
      project: project.project
    }
    this.allTasks = [];
    this.tasks
      .filter(task=> task.project.projectId === this.selectedProject.projectId)
      .forEach(task => {
        if(!task.parentTask)
          task = Object.assign(task,
            {parentTask : {
              parentTask: 'Parent Task Can Be Any One From Main task List'
            }});
        this.allTasks.push(task);
      });
    this.parentTasks
      .filter(parentTask => parentTask.project.projectId === this.selectedProject.projectId)
      .forEach(parentTask => 
        this.allTasks.push({
          taskId: parentTask.parentId,
          task: parentTask.parentTask,
          project: parentTask.project,
          isParentTask: true,
          parentTask: {
            parentTask: 'This task has NO parent'
          }
        }));
    this.document.getElementById('closeSelectProjectModal').click();
  }

  edit(task) {
    this.router.navigate(['/addTask'], { state: { selectedTask: task } })
      .then(success => console.log('navigation success?' , success))
      .catch(console.error); 
  }

}
