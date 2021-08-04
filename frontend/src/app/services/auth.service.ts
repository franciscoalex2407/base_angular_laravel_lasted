import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  base_url = environment.base_url;

  constructor(
    private http: HttpClient
  ) { }

  login(dados): Promise<any> {
    return this.http.post(`${this.base_url}/auth/login`, dados).toPromise()
  }

  getUserByToken(queryParams: any = {}): Promise<any> {
    return this.http.get(`${this.base_url}/auth/me`, { params: queryParams }).toPromise();
  }
}
