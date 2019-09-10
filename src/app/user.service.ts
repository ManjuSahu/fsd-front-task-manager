import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  addUser(user: Object) {
    return this.http.post("http://localhost:8080/users", user);
  }

  getUsers() {
    return this.http.get("http://localhost:8080/users");
  }
}
