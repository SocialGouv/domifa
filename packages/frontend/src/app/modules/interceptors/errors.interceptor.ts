import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private modalService: NgbModal) {

  }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return next.handle(request)
    .pipe(
      catchError( (error: HttpErrorResponse) => {
        let errMsg = '';
        // Client Side Error
        if (error.error instanceof ErrorEvent) {
          errMsg = `Error: ${error.error.message}`;
        }
        else {  // Server Side Error
          console.log("SERV");
          errMsg = `Error Code: ${error.status},  Message: ${error.message}`;
        }
        // return an observable
        return throwError(errMsg);
      })
      )
    }
  }
