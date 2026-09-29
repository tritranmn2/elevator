import { HttpException, HttpStatus } from '@nestjs/common';
import ErrorCode, { IError } from '../config/error-code.config';

export class CustomErrorException extends HttpException {
  constructor(
    statusCode: HttpStatus,
    code: number,
    type: string,
    msg: string,
    count?: number,
  ) {
    super(
      {
        code,
        success: false,
        type,
        msg,
        ...(count !== undefined ? { count } : {}),
      },
      statusCode,
    );
  }
}

/**
 * Helper function để throw lỗi có định dạng chuẩn
 * @param httpStatus - HTTP Status (e.g. HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND)
 * @param error - Đối tượng lỗi từ ErrorCode
 */
export const ErrorHttpException = (
  httpStatus: HttpStatus,
  error?: IError,
): CustomErrorException => {
  return new CustomErrorException(
    httpStatus,
    error?.code ?? ErrorCode.BACKEND.code,
    error?.type ?? ErrorCode.BACKEND.type,
    error?.msg ?? ErrorCode.BACKEND.msg,
    error?.count,
  );
};
