import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { TaskService } from '../task.service';
import { ProjectService } from '../project.service';
import { Project } from '../project';
import { Task } from '../task';
import { ParentTaskService } from '../parent-task.service';
import { ParentTask } from '../parent-task';
import { User } from '../user';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['../app.component.css','./task.component.css']
})
export class TaskComponent implements OnInit {

  projects: Project[];

  searchedProjects: Project[];

  parentTasks: ParentTask[];

  searchedParentTasks: ParentTask[];
  
  taskAddForm: FormGroup;

  submitted: Boolean = false;

  success: Boolean = false;

  dateInputEnabled: Boolean = true;

  users: User[];

  searchedUsers: User[];

  selectedTask: Task
  
  @ViewChild('closeSelectProjectModal') closeSelectProjectModal: ElementRef;

  @ViewChild("formSubmit") formSubmit: ElementRef;

  @ViewChild("searchParentTaskButton") searchParentTaskButton: ElementRef;

  @ViewChild("clearParentTaskButton") clearParentTaskButton: ElementRef;
  
  @ViewChild("searchTaskOwnerButton") searchTaskOwnerButton: ElementRef;

  @ViewChild("searchProjectButton") searchProjectButton: ElementRef;

  constructor(@Inject(DOCUMENT) private document: Document,
              private formBuilder: FormBuilder, 
              private taskService: TaskService,
              private projectService: ProjectService,
              private parentTaskService: ParentTaskService,
              private userService: UserService,
              private router: Router) { 

      if(this.router.getCurrentNavigation().extras.state) {
        this.selectedTask = this.router.getCurrentNavigation().extras.state.selectedTask;
      }
      this.initializeForm();
  }

  initializeForm() {
    this.taskAddForm = this.formBuilder.group(this.getFormModel(), {
      validator: TaskComponent.DateValidation
    });
    this.setRangeInputValueAgain();
    this.disbleParentTaskFields();
  }

  setRangeInputValueAgain() {
    setTimeout(() => {
      if(this.selectedTask) {
        this.taskAddForm.get('priority').setValue(this.selectedTask.priority);
        this.searchProjectButton.nativeElement.disabled = true;
      }
    }, 0);
  }

  getFormModel() {
    return {
      projectId: [this.selectedTask ? this.selectedTask.project.projectId : '', Validators.required],
      projectName: [{value: this.selectedTask ? this.selectedTask.project.project : '', disabled: true}],
      taskId: this.selectedTask ? this.selectedTask.taskId: '',
      task: [this.selectedTask ? this.selectedTask.task : '', Validators.required],
      isParentTask: [{value: this.selectedTask ? this.selectedTask.isParentTask : false, disabled: this.selectedTask}],
      priority: [this.selectedTask ? this.selectedTask.priority : 0, Validators.required],
      startDate: this.selectedTask ? this.selectedTask.startDate: this.today(),
      endDate: this.selectedTask ? this.selectedTask.endDate : this.tomorrow(),
      parentTaskId: this.selectedTask && this.selectedTask.parentTask ? this.selectedTask.parentTask.parentId : '',
      parentTaskName: [{value: this.selectedTask && this.selectedTask.parentTask ? this.selectedTask.parentTask.parentTask : '', disabled: true}],
      taskOwnerId: this.selectedTask && this.selectedTask.taskOwner ? this.selectedTask.taskOwner.userId : '',
      taskOwnerName: [{value: this.selectedTask && this.selectedTask.taskOwner ? this.selectedTask.taskOwner.firstName + ' ' + this.selectedTask.taskOwner.lastName: '', 
        disabled: true}],
    }
  }

  disbleParentTaskFields() {
    setTimeout(()=>{
      if(this.taskAddForm.get('isParentTask').value) {
        this.taskAddForm.get('priority').disable();
        this.taskAddForm.get('startDate').disable();
        this.taskAddForm.get('endDate').disable();
        this.searchParentTaskButton.nativeElement.disabled = true;
        this.clearParentTaskButton.nativeElement.disabled = true;
        this.searchTaskOwnerButton.nativeElement.disabled = true;
        this.taskAddForm.get('parentTaskName').setValue('');
        this.taskAddForm.get('taskOwnerName').setValue('');
        this.taskAddForm.get('startDate').setValue('');
        this.taskAddForm.get('endDate').setValue('');
      }
      else {
        this._initializeParentTaskFields();
      }
    }, 0);
  }

  today() {
    return new Date().toISOString().split('T')[0];
  }

  tomorrow() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1)
    return tomorrow.toISOString().split('T')[0];
  }

  _initializeParentTaskFields() {
    this.taskAddForm.get('priority').enable();
    this.taskAddForm.get('startDate').enable();
    this.taskAddForm.get('endDate').enable();
    this.searchParentTaskButton.nativeElement.disabled = false;
    this.clearParentTaskButton.nativeElement.disabled = false;
    this.searchTaskOwnerButton.nativeElement.disabled = false;
    if(!this.selectedTask) {
      this.taskAddForm.get('priority').setValue(0);
      this.taskAddForm.get('startDate').setValue(this.today());
      this.taskAddForm.get('endDate').setValue(this.tomorrow());
    }
  }

  selectProject(project: Project) {
    this.taskAddForm.get('projectName').setValue(project.project);
    this.taskAddForm.get('projectId').setValue(project.projectId);
    this.document.getElementById('closeSelectProjectModal').click();
  }

  selectParentTask(parentTask: ParentTask) {
    this.taskAddForm.get('parentTaskId').setValue(parentTask.parentId);
    this.taskAddForm.get('parentTaskName').setValue(parentTask.parentTask);
    this.document.getElementById('closeSelectParentTaskModal').click();
  }

  selectTaskOwner(user: User) {
    this.taskAddForm.get('taskOwnerId').setValue(user.userId);
    this.taskAddForm.get('taskOwnerName').setValue(user.firstName + ' ' + user.lastName);
    this.document.getElementById('closeSelectTaskOwnerModal').click();
  }

  onSubmit() {
    this.submitted = true;
    this.success= false;
    if(this.taskAddForm.invalid) {
      return;
    }
    if(this.taskAddForm.get('isParentTask').value) {
      const task = Object.assign({}, {
        parentId: this.selectedTask ? this.selectedTask.taskId : '',
        parentTask: this.taskAddForm.get('task').value,
        projectId: this.taskAddForm.get('projectId').value,
      });
      this.parentTaskService.addParentTask(task).subscribe(data => {
          this._resetForm();
          this.success = true;
      });
    } else {
      const task: Task = Object.assign({taskId: this.selectedTask ? this.selectedTask.taskId: ''}, this.taskAddForm.value);
      this.taskService.addTask(task).subscribe(data => {
          this._resetForm();
          this.success = true;
      });
    }
  }

  _resetForm() {
    this.taskAddForm.reset();
    this.submitted = false;
    this.success = false;
    this.taskAddForm.get('startDate').setErrors(null);
    this.taskAddForm.get('endDate').setErrors(null);
    this.formSubmit.nativeElement.value = 'Add';
    this.searchProjectButton.nativeElement.disabled = false;
    this.selectedTask = null;
    this.taskAddForm.get('isParentTask').enable();
    this._initializeParentTaskFields();
  }

  ngOnInit() {
    this._initializeParentTaskFields();
    this.projectService.getProjects().subscribe(data => {
      this.projects = this.searchedProjects = data;
    })
    this.parentTaskService.getParentTasks().subscribe(data => {
      this.parentTasks = this.searchedParentTasks = data;
    })
    this.userService.getUsers().subscribe(data => {
      this.users = this.searchedUsers = data;
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

  searchParentTasks(event: any) {
    this.searchedParentTasks = this.parentTasks;
    let keyword = event.target.value.toLowerCase();
    if(keyword) {
      this.searchedParentTasks = this.parentTasks.filter(
        parentTask => (parentTask.parentTask.toLowerCase().includes(keyword))
      );
    } 
  }

  searchUsers(event: any) {
    this.searchedUsers = this.users;
    let keyword = event.target.value.replace(/ /g, '').toLowerCase();
    if(keyword) {
      this.searchedUsers = this.users.filter(
        user => (user.firstName.toLowerCase()+user.lastName.toLowerCase()+ user.employeeId.toString()).includes(keyword)
      );
    } 
  }

  clearParentTask() {
    this.taskAddForm.get('parentTaskId').setValue('');
    this.taskAddForm.get('parentTaskName').setValue('');
  }

  static DateValidation(abstractControl: AbstractControl) {

    const startDateControl = abstractControl.get('startDate');
    const endDateControl = abstractControl.get('endDate');
    const taskIdControl = abstractControl.get('taskId');
    const taskId = taskIdControl.value;
    startDateControl.setErrors(null);
    endDateControl.setErrors(null);
      const startDate = new Date(startDateControl.value);
      startDate.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      if(!taskId && startDate < today) {
        startDateControl.setErrors({
          pastStartDate: true
        });
      }
      const endDate = new Date(endDateControl.value);
      endDate.setHours(0,0,0,0);
      if(endDate < today) {
        endDateControl.setErrors({
          pastEndDate: true
        });
      }
      if(startDate > endDate) {
        endDateControl.setErrors({
          startDateAfterEndDate: true
        });
      }
  }

}
