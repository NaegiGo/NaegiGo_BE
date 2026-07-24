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

  // Room
  INVALID_ROOM_DATE_RANGE: {status: HttpStatus.BAD_REQUEST, code: 'ROOM400_1', message: '종료일은 시작일보다 이후여야 합니다.'},
  ROOM_MEMBER_ONLY: {status: HttpStatus.FORBIDDEN, code: 'ROOM403_1', message: '참여 중인 방만 조회할 수 있습니다.'},
  ROOM_OWNER_REQUIRED_TO_UPDATE: {status: HttpStatus.FORBIDDEN, code: 'ROOM403_2', message: '방장만 방 정보를 수정할 수 있습니다.'},
  ROOM_OWNER_REQUIRED_TO_DELETE: {status: HttpStatus.FORBIDDEN, code: 'ROOM403_3', message: '방장만 방을 삭제할 수 있습니다.'},
  ROOM_OWNER_CANNOT_LEAVE: {status: HttpStatus.FORBIDDEN, code: 'ROOM403_3', message: '방장은 방을 나갈 수 없습니다. 방을 삭제해주세요.'},
  ROOM_NOT_FOUND: {status: HttpStatus.NOT_FOUND, code: 'ROOM404', message: '방을 찾을 수 없습니다.'},
  ROOM_MEMBER_NOT_FOUND: {status: HttpStatus.NOT_FOUND, code: 'ROOM404_1', message: '참여 중인 방이 아닙니다.'},
  ROOM_ALREADY_JOINED: {status: HttpStatus.CONFLICT, code: 'ROOM409_1', message: '이미 참여한 방입니다.'},
  ROOM_ALREADY_STARTED: {status: HttpStatus.CONFLICT, code: 'ROOM409_2', message: '이미 시작된 방에는 참여할 수 없습니다.'},
  ROOM_MEMBER_LIMIT_EXCEEDED: {status: HttpStatus.CONFLICT, code: 'ROOM409_3', message: '참여 인원이 가득 찬 방입니다. (10명 제한)'},
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];