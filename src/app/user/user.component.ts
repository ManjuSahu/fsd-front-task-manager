import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  users: Object;
  
  userAddForm: FormGroup;

  submitted: Boolean = false;

  success: Boolean = false;

  constructor(private formBuilder: FormBuilder, private userService: UserService) { 
    this.userAddForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      employeeId: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    if(this.userAddForm.invalid) {
      return;
    }
    const user = Object.assign({}, this.userAddForm.value);
    console.log(user);
    this.userService.addUser(user).subscribe(data => {
      console.log('response'+data);      
    })
    this.success = true;
  }


  ngOnInit() {
  }

}
