import { Component, OnInit, ElementRef, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ProjectService } from '../project.service';
import { $ } from 'protractor';
import { Project } from '../project';
import { UserService } from '../user.service';
import { User } from '../user';
import { Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['../app.component.css','./project.component.css']
})
export class ProjectComponent implements OnInit {

  projects: Project[];

  searchedProjects: Project[];
  
  projectAddForm: FormGroup;

  submitted: Boolean = false;

  success: Boolean = false;

  sortColumn: String = '';

  dateInputEnabled: Boolean = true;

  users: User[];

  searchedUsers: User[];

  today: Date;

  lastSelectedSortColumn: String = '';

  sortAsc: Boolean = true;

  @ViewChild('closeSelectManagerModal') closeSelectManagerModal: ElementRef;

  @ViewChild("formSubmit") formSubmit: ElementRef;
  constructor(@Inject(DOCUMENT) private document: Document,private formBuilder: FormBuilder, private projectservice: ProjectService,
    private userService: UserService) { 
    this.today = new Date();
    this.today.setHours(0,0,0,0);
    this.projectAddForm = this.formBuilder.group({
      project: ['', Validators.required],
      priority: [0, Validators.required],
      startDate: [{value: '', disabled: true}],
      endDate: [{value: '', disabled: true}],
      dateInputEnabled: [false],
      managerId: '',
      managerName: [{value: '', disabled: true}],
      projectId: ''
    }, {
      validator: ProjectComponent.DateValidation
   });
  }

  enableDateInputs() {
    setTimeout(()=>{
      if(this.projectAddForm.get('dateInputEnabled').value) {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        this.projectAddForm.get('startDate').enable();
        this.projectAddForm.get('startDate').setValue(today.toISOString().split('T')[0]);
        this.projectAddForm.get('endDate').enable();
        this.projectAddForm.get('endDate').setValue(tomorrow.toISOString().split('T')[0]);
      }
      else {
        this.projectAddForm.get('startDate').disable();
        this.projectAddForm.get('endDate').disable();
        this.projectAddForm.get('startDate').setValue('');
        this.projectAddForm.get('endDate').setValue('');
      }
    }, 0);
  }

  selectAsManager(user) {
    this.projectAddForm.get('managerName').setValue(user.firstName + ' ' + user.lastName);
    this.projectAddForm.get('managerId').setValue(user.userId);
    this.document.getElementById('closeSelectManagerModal').click();
  }

  onSubmit() {
    this.submitted = true;
    this.success= false;
    if(this.projectAddForm.invalid) {
      return;
    }
    const Project = Object.assign({}, this.projectAddForm.value);
    const projectFromList = this.projects.filter(projectInLoop => Project.employeeId === projectInLoop.projectId).length;
    if(projectFromList > 0) {
      this.projectservice.updateProject(Project).subscribe(data => {
        this.projectservice.getProjects().subscribe(data => {
          this.projects = this.searchedProjects = data;
          this._resetForm();
          this.success = true;
        });
      });
    }
    else {
      this.projectservice.addProject(Project).subscribe(data => {
        this.projectservice.getProjects().subscribe(data => {
          this.projects = this.searchedProjects = data;
          this._resetForm();
          this.success = true;
        });
      });
    }
  }

  _resetForm() {
    this.projectAddForm.reset();
    this.formSubmit.nativeElement.value = 'Add';
    this.projectAddForm.get('startDate').disable();
    this.projectAddForm.get('endDate').disable();
    this.projectAddForm.get('startDate').setErrors(null);
    this.projectAddForm.get('endDate').setErrors(null);
    this.projectAddForm.get('priority').setValue(0);
    this.submitted = false;
    this.success = false;
  }

  ngOnInit() {
    this.projectservice.getProjects().subscribe(data => {
      this.projects = this.searchedProjects = data;
    })
    this.userService.getUsers().subscribe(data => {
      this.users = this.searchedUsers = data;
    })
  }

  update(project) {
    this.projectAddForm.setValue({
      project : project.project,
      priority : project.priority,
      startDate : project.startDate,
      endDate: project.endDate,
      managerId: project.manager ? project.manager.userId : '',
      dateInputEnabled: !!project.startDate || !!project.endDate,
      managerName: project.manager ? project.manager.firstName+ ' '+project.manager.lastName : '',
      projectId: project.projectId
    });
    if(this.projectAddForm.get('dateInputEnabled').value) {
      this.projectAddForm.get('startDate').enable();
      this.projectAddForm.get('endDate').enable();
    } else {
      this.projectAddForm.get('startDate').disable();
      this.projectAddForm.get('endDate').disable();
    }
    this.formSubmit.nativeElement.value = 'Update';
  }

  suspend(project: Project) {
    project.status = 'Suspended';
    this.projectservice.updateProject(project).subscribe(data => {
      this.projectservice.getProjects().subscribe(data => {
        this.projects = this.searchedProjects = data;
      });
    });
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

  searchUsers(event: any) {
    this.searchedUsers = this.users;
    let keyword = event.target.value.replace(/ /g, '').toLowerCase();
    if(keyword) {
      this.searchedUsers = this.users.filter(
        user => (user.firstName.toLowerCase()+user.lastName.toLowerCase()+ user.employeeId.toString()).includes(keyword)
      );
    } 
  }

  sort(sortColumn) {
    if(this.lastSelectedSortColumn === sortColumn) 
      this.sortAsc = !this.sortAsc;
    else
      this.sortAsc = true;
    this.searchedProjects = this.searchedProjects.sort(function(a,b) {
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


  getNoOfTasks(project) {
    return project.tasks.length + project.parentTasks.length;
  }
  
  getNoOfCompletedTasks(project) {
    return project.tasks.filter(task => task.status === 'Completed').length +
           project.parentTasks.filter(task => task.status === 'Completed').length;
  }

  static DateValidation(abstractControl: AbstractControl) {
    const startDateControl = abstractControl.get('startDate');
    const endDateControl = abstractControl.get('endDate');
    const dateInputEnabled = abstractControl.get('dateInputEnabled');
    const projectIdControl = abstractControl.get('projectId');
    const projectId = projectIdControl.value;
    startDateControl.setErrors(null);
    endDateControl.setErrors(null);
    if(dateInputEnabled.value) {
      const startDate = new Date(startDateControl.value);
      startDate.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      if(!projectId && startDate < today) {
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

}
