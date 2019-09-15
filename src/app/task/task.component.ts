import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../task.service';
import { ProjectService } from '../project.service';
import { Project } from '../project';
import { Task } from '../task';
import { ParentTaskService } from '../parent-task.service';
import { ParentTask } from '../parent-task';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  projects: Project[];

  searchedProjects: Project[];
  
  taskAddForm: FormGroup;

  submitted: Boolean = false;

  success: Boolean = false;

  // sortColumn: String = '';

  dateInputEnabled: Boolean = true;

  // users: User[];

  // searchedUsers: User[];

  @ViewChild('closeSelectProjectModal') closeSelectProjectModal: ElementRef;

  @ViewChild("formSubmit") formSubmit: ElementRef;
  @Injectable()
  constructor(@Inject(DOCUMENT) private document: Document,
              private formBuilder: FormBuilder, 
              private taskService: TaskService,
              private projectService: ProjectService,
              private parentTaskService: ParentTaskService) { 
    this.taskAddForm = this.formBuilder.group({
      projectName: [{value: '', disabled: true}, Validators.required],
      task: ['', Validators.required],
      isParentTask: [false],
      priority: [0, Validators.required],
      startDate: [{value: ''}],
      endDate: [{value: ''}],
      projectId: '',
    });
  }

  disbleParentTaskFields() {
    setTimeout(()=>{
      if(this.taskAddForm.get('isParentTask').value) {
        this.taskAddForm.get('priority').disable();
        this.taskAddForm.get('startDate').disable();
        this.taskAddForm.get('endDate').disable();
      }
      else {
        this._initializeParentTaskFields();
      }
    }, 0);
  }

  _initializeParentTaskFields() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    this.taskAddForm.get('priority').enable();
    this.taskAddForm.get('priority').setValue(0);
    this.taskAddForm.get('startDate').enable();
    this.taskAddForm.get('startDate').setValue(today.toISOString().split('T')[0]);
    this.taskAddForm.get('endDate').enable();
    this.taskAddForm.get('endDate').setValue(tomorrow.toISOString().split('T')[0]);
  }

  selectProject(project: Project) {
    this.taskAddForm.get('projectName').setValue(project.project);
    this.taskAddForm.get('projectId').setValue(project.projectId);
    this.document.getElementById('closeSelectProjectModal').click();
  }

  onSubmit() {
    debugger;
    this.submitted = true;
    if(this.taskAddForm.invalid) {
      return;
    }
    if(this.taskAddForm.get('isParentTask')) {
      const task: ParentTask = {
        parentId: null,
        parentTask: this.taskAddForm.get('task').value,
      }
      this.parentTaskService.addParentTask(task).subscribe(data => {
          console.log(data);
          this._resetForm();
      });
    } else {
      const task: Task = Object.assign({}, this.taskAddForm.value);
      this.taskService.addTask(task).subscribe(data => {
          console.log(data);
          this._resetForm();
      });
    }
    this.success = true;
  }

  _resetForm() {
    this.taskAddForm.reset();
    this._initializeParentTaskFields();
  }

  ngOnInit() {
    this._initializeParentTaskFields();
    this.projectService.getProjects().subscribe(data => {
      this.projects = this.searchedProjects = data;
    })
  }

  // update(project) {
  //   console.log('update'+project);
  //   this.taskAddForm.setValue({
  //     project : project.project,
  //     priority : project.priority,
  //     startDate : project.startDate,
  //     endDate: project.endDate,
  //     managerId: project.manager.userId,
  //     dateInputEnabled: false,
  //     managerName: project.manager.firstName+ ' '+project.manager.lastName,
  //     projectId: project.projectId
  //   });
  //   console.log(this.formSubmit.nativeElement.value);
  //   this.formSubmit.nativeElement.value = 'Update';
  //   console.log(this.formSubmit.nativeElement.value);
  // }

  // delete(project) {
  //   this.projectservice.deleteProject(project).subscribe(data => {
  //     this.projectservice.getProjects().subscribe(data => {
  //       this.projects = this.searchedProjects = data;
  //     });
  //   });
  // }

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

  // searchUsers(event: any) {
  //   this.searchedUsers = this.users;
  //   let keyword = event.target.value.replace(/ /g, '').toLowerCase();
  //   if(keyword) {
  //     console.log('searchUsers'+keyword);
  //     this.searchedUsers = this.users.filter(
  //       user => (user.firstName.toLowerCase()+user.lastName.toLowerCase()+ user.employeeId.toString()).includes(keyword)
  //     );
  //   } 
  //   console.log(this.searchedUsers);
  // }

  // sort(sortColumn) {
  //     console.log(sortColumn);
  //     this.searchedProjects = this.searchedProjects.sort(function(a,b) {
  //       var x = a[sortColumn];
  //       var y = b[sortColumn];
  //       return x < y ? -1 : x > y ? 1 : 0;
  //   });
  // }

}
