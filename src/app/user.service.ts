import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from './user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  updateUser(user: User) {
    return this.http.put(environment.baseUrl + "/users", user);
  }

  constructor(private http: HttpClient) { }

  addUser(user: User) {
    return this.http.post(environment.baseUrl + "/users", user);
  }

  getUsers() {
    return this.http.get<User[]>(environment.baseUrl + "/users");
  }

  deleteUser(user) {
    const httpParams = new HttpParams().set('userId', user.userId);
    const options = { params: httpParams };
    return this.http.delete(environment.baseUrl + "/users", options);
  }
}
