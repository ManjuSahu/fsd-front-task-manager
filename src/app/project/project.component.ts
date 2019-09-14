import { Component, OnInit, ElementRef, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  styleUrls: ['./project.component.css']
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

  @ViewChild('closeSelectManagerModal') closeSelectManagerModal: ElementRef;

  @ViewChild("formSubmit") formSubmit: ElementRef;
  @Injectable()
  constructor(@Inject(DOCUMENT) private document: Document,private formBuilder: FormBuilder, private projectservice: ProjectService,
    private userService: UserService) { 
    this.projectAddForm = this.formBuilder.group({
      project: ['', Validators.required],
      priority: [0, Validators.required],
      startDate: [{value: '', disabled: true}],
      endDate: [{value: '', disabled: true}],
      dateInputEnabled: [false],
      managerId: '',
      managerName: [{value: '', disabled: true}],
      projectId: ''
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
    if(this.projectAddForm.invalid) {
      return;
    }
    const Project = Object.assign({}, this.projectAddForm.value);
    console.log(Project);
    const projectFromList = this.projects.filter(projectInLoop => Project.employeeId === projectInLoop.projectId).length;
    if(projectFromList > 0) {
      this.projectservice.updateProject(Project).subscribe(data => {
        this.projectservice.getProjects().subscribe(data => {
          this.projects = this.searchedProjects = data;
          this._resetForm();
        });
      });
    }
    else {
      this.projectservice.addProject(Project).subscribe(data => {
        this.projectservice.getProjects().subscribe(data => {
          this.projects = this.searchedProjects = data;
          this._resetForm();
        });
      });
    }
    this.success = true;
  }

  _resetForm() {
    this.projectAddForm.reset();
    this.formSubmit.nativeElement.value = 'Add';
    this.projectAddForm.get('startDate').disable();
    this.projectAddForm.get('endDate').disable();
    this.projectAddForm.get('priority').setValue(0);

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
    console.log('update'+project);
    this.projectAddForm.setValue({
      project : project.project,
      priority : project.priority,
      startDate : project.startDate,
      endDate: project.endDate,
      managerId: project.manager.userId,
      dateInputEnabled: false,
      managerName: project.manager.firstName+ ' '+project.manager.lastName,
      projectId: project.projectId
    });
    console.log(this.formSubmit.nativeElement.value);
    this.formSubmit.nativeElement.value = 'Update';
    console.log(this.formSubmit.nativeElement.value);
  }

  delete(project) {
    this.projectservice.deleteProject(project).subscribe(data => {
      this.projectservice.getProjects().subscribe(data => {
        this.projects = this.searchedProjects = data;
      });
    });
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

  searchUsers(event: any) {
    this.searchedUsers = this.users;
    let keyword = event.target.value.replace(/ /g, '').toLowerCase();
    if(keyword) {
      console.log('searchUsers'+keyword);
      this.searchedUsers = this.users.filter(
        user => (user.firstName.toLowerCase()+user.lastName.toLowerCase()+ user.employeeId.toString()).includes(keyword)
      );
    } 
    console.log(this.searchedUsers);
  }

  sort(sortColumn) {
      console.log(sortColumn);
      this.searchedProjects = this.searchedProjects.sort(function(a,b) {
        var x = a[sortColumn];
        var y = b[sortColumn];
        return x < y ? -1 : x > y ? 1 : 0;
    });
  }

}
