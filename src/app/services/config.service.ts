import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  get(apiPath: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}${apiPath}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => this.handleAuthError(error, () => this.get(apiPath)))
      );
  }

  post(apiPath: string, body: any): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}${apiPath}`, body, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => this.handleAuthError(error, () => this.post(apiPath, body)))
      );
  }

  put(apiPath: string, body: any): Observable<any> {
    return this.http.put<any>(`${environment.apiBaseUrl}${apiPath}`, body, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => this.handleAuthError(error, () => this.put(apiPath, body)))
      );
  }

  delete(apiPath: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiBaseUrl}${apiPath}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => this.handleAuthError(error, () => this.delete(apiPath)))
      );
  }

  /**
   * **NEW: Handle authentication errors and token refresh**
   */
  private handleAuthError(error: HttpErrorResponse, retryRequest: () => Observable<any>): Observable<any> {
    console.log('🔍 HTTP Error:', error);
    
    // Check if it's a token expired error
    if (error.status === 401 && error.error?.code === 'token_not_valid') {
      console.log('🔄 Token expired, attempting refresh...');
      
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        // Try to refresh the token
        return this.refreshToken(refreshToken).pipe(
          switchMap(response => {
            console.log('✅ Token refreshed successfully');
            // Store new access token
            localStorage.setItem('access_token', response.access);
            
            // Retry the original request
            return retryRequest();
          }),
          catchError(refreshError => {
            console.error('❌ Token refresh failed:', refreshError);
            this.handleAuthFailure();
            return throwError(refreshError);
          })
        );
      } else {
        console.error('❌ No refresh token available');
        this.handleAuthFailure();
        return throwError(error);
      }
    }
    
    return throwError(error);
  }

  /**
   * **NEW: Refresh JWT token**
   */
  private refreshToken(refreshToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<any>(`${environment.apiBaseUrl}api/refresh/`, 
      { refresh: refreshToken }, 
      { headers }
    );
  }

  /**
   * **NEW: Handle authentication failure**
   */
  private handleAuthFailure(): void {
    console.log('🚪 Authentication failed, logging out...');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /**
   * **UPDATED: Get authentication headers with better error handling**
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.warn('⚠️ No access token found in localStorage');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getBaseUrl(): string {
    return environment.apiBaseUrl;
  }

  /**
   * **NEW: Check if user is authenticated**
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    return !!(token && refreshToken);
  }

  /**
   * **NEW: Manual token refresh**
   */
  refreshTokenManually(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      this.handleAuthFailure();
      return throwError('No refresh token available');
    }
    
    return this.refreshToken(refreshToken).pipe(
      switchMap(response => {
        localStorage.setItem('access_token', response.access);
        console.log('✅ Manual token refresh successful');
        return response;
      }),
      catchError(error => {
        console.error('❌ Manual token refresh failed:', error);
        this.handleAuthFailure();
        return throwError(error);
      })
    );
  }

  // Add this method to your existing ConfigService
getWithParams(apiPath: string, params?: { [key: string]: any }): Observable<any> {
  let httpParams = new HttpParams();
  
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
  }

  return this.http.get<any>(`${environment.apiBaseUrl}${apiPath}`, { 
    headers: this.getAuthHeaders(),
    params: httpParams 
  }).pipe(
    catchError(error => this.handleAuthError(error, () => this.getWithParams(apiPath, params)))
  );
}

}
