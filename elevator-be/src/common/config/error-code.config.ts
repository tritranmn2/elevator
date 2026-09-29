export interface IError {
  code: number;
  type: string;
  msg: string;
  count?: number;
}

export const ErrorCode = {
  // Lỗi hệ thống cơ bản
  BACKEND: { code: 5000, type: 'ERROR_BACKEND', msg: 'Internal Server Error' },
  BAD_REQUEST: { code: 4000, type: 'BAD_REQUEST', msg: 'Bad Request' },
  UNAUTHORIZED: { code: 4010, type: 'UNAUTHORIZED', msg: 'Unauthorized' },
  FORBIDDEN: { code: 4030, type: 'FORBIDDEN', msg: 'Forbidden' },
  NOT_FOUND: { code: 4040, type: 'NOT_FOUND', msg: 'Not Found' },
  VALIDATION_ERROR: { code: 4220, type: 'VALIDATION_ERROR', msg: 'Validation Error' },

  // Domain Thang Máy (Elevator Domain Errors)
  ELEVATOR_NOT_FOUND: {
    code: 4401,
    type: 'ELEVATOR_NOT_FOUND',
    msg: 'Thang máy không tồn tại',
  },
  INVALID_FLOOR_RANGE: {
    code: 4402,
    type: 'INVALID_FLOOR_RANGE',
    msg: 'Tầng yêu cầu phải nằm trong khoảng từ 1 đến 10',
  },
  CANNOT_CALL_UP_HIGHEST: {
    code: 4403,
    type: 'CANNOT_CALL_UP_HIGHEST',
    msg: 'Không thể gọi UP ở tầng cao nhất',
  },
  CANNOT_CALL_DOWN_LOWEST: {
    code: 4404,
    type: 'CANNOT_CALL_DOWN_LOWEST',
    msg: 'Không thể gọi DOWN ở tầng thấp nhất',
  },
  DOOR_CANNOT_OPEN_MOVING: {
    code: 4405,
    type: 'DOOR_CANNOT_OPEN_MOVING',
    msg: 'Không thể mở cửa khi thang máy đang di chuyển',
  },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCode;
export default ErrorCode;
