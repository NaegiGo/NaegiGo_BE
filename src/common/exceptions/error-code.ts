import { HttpStatus } from '@nestjs/common';

export const ErrorCode = {
  // Common
  INTERNAL_SERVER_ERROR: {status: HttpStatus.INTERNAL_SERVER_ERROR, code: 'COMMON500', message: '서버 내부 오류입니다.'},
  INVALID_REQUEST: {status: HttpStatus.BAD_REQUEST, code: 'COMMON400', message: '잘못된 요청입니다.'},

  // Auth
  UNAUTHORIZED: {status: HttpStatus.UNAUTHORIZED, code: 'AUTH401', message: '로그인이 필요합니다.'},
  KAKAO_AUTH_CODE_REQUIRED: {status: HttpStatus.BAD_REQUEST, code: 'AUTH400_1', message: '카카오 인가 코드가 필요합니다.'},
  INVALID_KAKAO_ACCESS_TOKEN: {status: HttpStatus.UNAUTHORIZED, code: 'AUTH401_1', message: '유효하지 않은 카카오 액세스 토큰입니다.'},
  KAKAO_CONFIG_NOT_FOUND: {status: HttpStatus.INTERNAL_SERVER_ERROR, code: 'AUTH500_1', message: '카카오 로그인 설정이 누락되었습니다.'},
  JWT_SECRET_NOT_CONFIGURED: {status: HttpStatus.INTERNAL_SERVER_ERROR, code: 'AUTH500_2', message: 'JWT 시크릿이 설정되지 않았습니다.'},
  KAKAO_TOKEN_EXCHANGE_FAILED: {status: HttpStatus.BAD_GATEWAY, code: 'AUTH502_1', message: '카카오 서버와 통신에 실패했습니다.'},

  // User
  INVALID_USER_NAME: {status: HttpStatus.BAD_REQUEST, code: 'USER400', message: '이름은 2자 이상 10자 이하로 입력해주세요.'},
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];