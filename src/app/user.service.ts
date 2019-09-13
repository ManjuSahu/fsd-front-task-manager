import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  updateUser(user: User) {
    return this.http.put("http://localhost:8080/users", user);
  }

  constructor(private http: HttpClient) { }

  addUser(user: User) {
    return this.http.post("http://localhost:8080/users", user);
  }

  getUsers() {
    return this.http.get<User[]>("http://localhost:8080/users");
  }

  deleteUser(user) {
    const httpParams = new HttpParams().set('userId', user.userId);
    const options = { params: httpParams };
    return this.http.delete("http://localhost:8080/users", options);
  }
}
