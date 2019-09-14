import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { $ } from 'protractor';
import { User } from '../user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  users: User[];

  searchedUsers: User[];
  
  userAddForm: FormGroup;

  submitted: Boolean = false;

  success: Boolean = false;

  sortColumn: String = '';

  @ViewChild("formSubmit") formSubmit: ElementRef;

  constructor(private formBuilder: FormBuilder, private userService: UserService) { 
    this.userAddForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      employeeId: ['', Validators.required],
      userId: ['']
    });
  }

  onSubmit() {
    this.submitted = true;
    if(this.userAddForm.invalid) {
      return;
    }
    const user = Object.assign({}, this.userAddForm.value);
    console.log(user);
    const userFromList = this.users.filter(userInLoop => user.employeeId === userInLoop.employeeId).length;
    if(userFromList > 0) {
      this.userService.updateUser(user).subscribe(data => {
        this.userService.getUsers().subscribe(data => {
          this.users = this.searchedUsers = data;
          this._resetForm();
        });
      });
    }
    else {
      this.userService.addUser(user).subscribe(data => {
        this.userService.getUsers().subscribe(data => {
        this.users = this.searchedUsers = data;
          this._resetForm();
        });
      });
    }
    this.success = true;
  }

  _resetForm() {
    this.formSubmit.nativeElement.value = 'Add';
    this.userAddForm.reset();
  }

  ngOnInit() {
    this.userService.getUsers().subscribe(data => {
      this.users = this.searchedUsers = data;
    })
  }

  update(user) {
    console.log('update'+user);
    this.userAddForm.setValue({
      firstName : user.firstName,
      lastName : user.lastName,
      employeeId : user.employeeId,
      userId: user.userId
    });
    this.formSubmit.nativeElement.value = 'Update';
  }

  delete(user) {
    this.userService.deleteUser(user).subscribe(data => {
      this.userService.getUsers().subscribe(data => {
        this.users = this.searchedUsers = data;
      });
    });
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
      this.searchedUsers = this.searchedUsers.sort(function(a,b) {
        var x = a[sortColumn];
        var y = b[sortColumn];
        return x < y ? -1 : x > y ? 1 : 0;
    });
  }

}
