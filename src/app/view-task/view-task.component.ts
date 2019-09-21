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
  styleUrls: ['../app.component.css','./view-task.component.css']
})
export class ViewTaskComponent implements OnInit {

  projects: Project[];

  searchedProjects: Project[];
  
  parentTasks: ParentTask[];

  allTasks: any[] = [];
  
  selectedProject: any = {};

  tasks: Task[];

  lastSelectedSortColumn: String = '';

  sortAsc: Boolean = true;
  
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
      this.searchedProjects = this.projects.filter(
        project => (project.project.toLowerCase().includes(keyword))
      );
    } 
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
    this.router.navigate(['/addTask'], { state: { selectedTask: task } });
  }

  end(task) {
    if(task.isParentTask) {
      const parentTask: ParentTask = {
        parentId: task.taskId,
        parentTask: task.task,
        projectId: task.project.projectId,
        project: task.project,
        status: 'Completed'
      }
      this.parentTaskService.updateParentTask(parentTask).subscribe((data) =>
        task.status =  'Completed'
      );
    }
    else {
        const task1: any = {
          taskId: task.taskId,
          task: task.task,
          isParentTask: task.isParentTask,
          priority: task.priority,
          startDate: task.startDate,
          endDate: task.endDate,
          parentTask: task.parentTaskId ? task.parentTask: null,
          project: task.project,
          taskOwner: task.taskOwner,
          status: 'Completed'
        }
        this.taskService.updateTask(task1).subscribe((data) =>
          task.status =  'Completed'
      );
    }
  }

  sort(sortColumn) {
    if(this.lastSelectedSortColumn === sortColumn) 
      this.sortAsc = !this.sortAsc;
    else
      this.sortAsc = true;
    this.allTasks = this.allTasks.sort(function(a,b) {
      var x = a[sortColumn];
      var y = b[sortColumn];
      if(this.sortAsc) {
        return x < y ? -1 : x > y ? 1 : 0;
      } else {
        return x > y ? -1 : x < y ? 1 : 0;
      }
    }.bind(this));
    this.lastSelectedSortColumn = sortColumn;
  }

}
