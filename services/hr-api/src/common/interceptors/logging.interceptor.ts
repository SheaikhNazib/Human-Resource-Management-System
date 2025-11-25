import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const body = req.body;
    const user = req.user ? req.user.id : 'anonymous';

    // ANSI color codes
    const cyan = '\x1b[36m';
    const green = '\x1b[32m';
    const yellow = '\x1b[33m';
    const reset = '\x1b[0m';
    const magenta = '\x1b[35m'; // for user

    // Only log for CRUD methods
    if (["POST" , "PATCH", "DELETE"].includes(method)) {
      console.log(
        `${cyan}API HIT:${reset} ${green}${method}${reset} ${yellow}${url}${reset} ${magenta}by user: ${user}${reset}`
      );
    } else if (method === "GET") {
      console.log(
        `${cyan}API HIT:${reset} ${green}GET${reset} ${yellow}${url}${reset} ${magenta}by user: ${user}${reset}`
      );
    }

    const now = Date.now();
    return next.handle().pipe(
      tap((data) => {
        console.log(
          `${cyan}API HIT:${reset} ${green}${method}${reset} ${yellow}${url}${reset} ${magenta}completed in${reset} ${cyan}${Date.now() - now}ms${reset}`
        );
      })
    );
  }
}
