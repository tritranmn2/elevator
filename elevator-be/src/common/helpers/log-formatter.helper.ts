import chalk from 'chalk';

export class LogFormatter {
  private static userInfo(request: any) {
    const id = request?.user?.id ?? '-';
    const contact = request?.user?.email ?? request?.user?.phone ?? '-';
    return `${chalk.bold.yellow('USER:')} ${chalk.cyan(id)} - ${chalk.yellow(contact)}`;
  }

  private static getErrorInfo(error: any) {
    return {
      status: error.response?.statusCode ?? error.status ?? 500,
      type: error.response?.error ?? error.response?.type ?? error.name ?? 'UnknownError',
      message:
        error.response?.message ??
        error.response?.msg ??
        error.message ??
        'Unknown message',
    };
  }

  static start(request: any): string {
    const statusCode = request?.res?.statusCode ?? 200;
    const method = request.method?.toUpperCase() ?? 'GET';
    const path = request.route?.path ?? request.path ?? request.url;
    const url = request.url ?? '/';
    const payload = JSON.stringify(request.body ?? {});

    return `START | ${this.userInfo(request)} | ${chalk.green('StatusCode: ' + statusCode)} | ${chalk.magenta(method)} | ${chalk.bold.magenta('PATH:')} ${path} | ${chalk.bold.magenta('URL:')} ${url} | ${chalk.bold.magenta('PAYLOAD:')} ${payload}`;
  }

  static end(request: any, responseTime: number): string {
    const statusCode = request?.res?.statusCode ?? 200;
    const path = request.route?.path ?? request.path ?? request.url;
    const url = request.url ?? '/';
    const payload = JSON.stringify(request.body ?? {});

    return `END | ${this.userInfo(request)} | ${chalk.green('StatusCode: ' + statusCode)} | ${chalk.bold.magenta('PATH:')} ${path} | ${chalk.bold.magenta('URL:')} ${url} | ${chalk.bold.magenta('TIME:')} [${responseTime}ms] | ${chalk.bold.magenta('PAYLOAD:')} ${payload} - DONE`;
  }

  static error(request: any, error: any): string {
    const { status, type, message } = this.getErrorInfo(error);
    const path = request.route?.path ?? request.path ?? request.url;
    const url = request.url ?? '/';
    const payload = JSON.stringify(request.body ?? {});
    const errorMsg = typeof message === 'object' ? JSON.stringify(message) : message;

    return `${this.userInfo(request)} | ${chalk.red('StatusCode: ' + status)} | ${chalk.bold.magenta('PATH:')} ${path} | ${chalk.bold.magenta('URL:')} ${url} | ${chalk.bold.magenta('TYPE:')} ${type} | ${chalk.bold.red('ERROR:')} ${errorMsg} | ${chalk.bold.magenta('PAYLOAD:')} ${payload}`;
  }
}
