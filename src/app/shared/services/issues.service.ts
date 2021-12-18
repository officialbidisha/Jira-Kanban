import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue } from 'src/assets/interfaces/Project';
import { User } from '../interfacrs/user.model';
@Injectable({
  providedIn: 'root',
})
export class IssuesService {
  private baseUrl: string = environment.baseUrl;

  public headerDict = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
  };

  public requestOptions = {
    headers: new HttpHeaders(this.headerDict),
  };
  constructor(private http: HttpClient) {}

  /**
   * Return Issues.
   * @returns
   */
  public getIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.baseUrl + 'Issue/', this.requestOptions);
  }

  public editIssues(id: string, body: Issue) {
    return this.http.post(
      this.baseUrl + `Issue/${id}`,
      body,
      this.requestOptions
    );
  }

  public getStartingWithIssues(id: string): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.baseUrl + `Issue/startsWith`, {
      params: {
        data: id,
      },
    });
  }

  public getMember(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + 'Member/', this.requestOptions);
  }

  public getSpecificMember(userNameList:any):Observable<User[]>{
    return this.http.get<User[]>(this.baseUrl+'Member/includes', {
      params:{
        data:userNameList
      }
    })
  }
}
