import { HttpStatus } from '@nestjs/common';

export const ErrorCode = {
  // Common
  INTERNAL_SERVER_ERROR: {status: HttpStatus.INTERNAL_SERVER_ERROR, code: 'COMMON500', message: '서버 내부 오류입니다.'},
  INVALID_REQUEST: {status: HttpStatus.BAD_REQUEST, code: 'COMMON400', message: '잘못된 요청입니다.'},

  // Auth
  INVALID_KAKAO_ACCESS_TOKEN: {status: HttpStatus.UNAUTHORIZED, code: 'AUTH401_1', message: '유효하지 않은 카카오 액세스 토큰입니다.'},
  JWT_SECRET_NOT_CONFIGURED: {status: HttpStatus.INTERNAL_SERVER_ERROR, code: 'AUTH5001', message: 'JWT 시크릿이 설정되지 않았습니다.'},
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];