import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private prefix = '[FrontGamez]';

  info(message: string, context?: any): void {
    console.info(`${this.prefix} INFO: ${message}`, context !== undefined ? context : '');
  }

  warn(message: string, context?: any): void {
    console.warn(`${this.prefix} WARN: ${message}`, context !== undefined ? context : '');
  }

  error(message: string, error?: any): void {
    console.error(`${this.prefix} ERROR: ${message}`, error !== undefined ? error : '');
  }

  debug(message: string, context?: any): void {
    console.debug(`${this.prefix} DEBUG: ${message}`, context !== undefined ? context : '');
  }
}
