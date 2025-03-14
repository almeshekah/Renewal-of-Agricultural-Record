import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  success(title: string, message: string) {
    // Implement your notification logic here
    console.log('Success:', title, message);
    // You can use any notification library like ngx-toastr
  }

  error(title: string, message: string) {
    console.log('Error:', title, message);
  }

  warning(title: string, message: string) {
    console.log('Warning:', title, message);
  }

  info(title: string, message: string) {
    console.log('Info:', title, message);
  }
}
