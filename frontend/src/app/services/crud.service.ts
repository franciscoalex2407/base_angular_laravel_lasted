import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  base_url = environment.base_url;
  baseUrl = environment.base_url;

  constructor(
    private http: HttpClient
  ) { }

  setEndPoint(endpoint: string) {
    this.base_url = `${this.base_url}/${endpoint}`;
  }

  listing(queryParams: any = {}): Promise<any> {
    return this.http.get(`${this.base_url}`, { params: queryParams }).toPromise();
  }
  create(dados: any): Promise<any> {
    return this.http.post(`${this.base_url}`, dados).toPromise();
  }
  getById(id): Promise<any> {
    return this.http.get(`${this.base_url}/${id}`).toPromise();
  }
  update(id, dados): Promise<any> {
    return this.http.put(`${this.base_url}/${id}`, dados).toPromise();
  }
  delete(id): Promise<any> {
    return this.http.delete(`${this.base_url}/${id}`).toPromise();
  }


  //categorias
  listingCategories(queryParams: any = {}): Promise<any> {
    return this.http.get(`${this.base_url}/categoria`, { params: queryParams }).toPromise();
  }
  createCategory(dados: any): Promise<any> {
    return this.http.post(`${this.base_url}/categoria`, dados).toPromise();
  }
  getByIdCategory(id): Promise<any> {
    return this.http.get(`${this.base_url}/categoria/${id}`).toPromise();
  }
  updateCategory(id, dados): Promise<any> {
    return this.http.put(`${this.base_url}/categoria/${id}`, dados).toPromise();
  }
  deleteCategory(id): Promise<any> {
    return this.http.delete(`${this.base_url}/categoria/${id}`).toPromise();
  }


  //custom requests
  listingUsers(queryParams: any = {}): Promise<any> {
    return this.http.get(`${this.baseUrl}/users`, { params: queryParams }).toPromise();
  }
  listingUnidades(queryParams: any = {}): Promise<any> {
    return this.http.get(`${this.baseUrl}/unidades`, { params: queryParams }).toPromise();
  }
}
