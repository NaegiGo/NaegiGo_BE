import { HttpStatus } from '@nestjs/common';

export const SuccessCode = {
  // Common
  OK: {status: HttpStatus.OK, code: 'COMMON200', message: '요청이 성공했습니다.'},
  CREATED: {status: HttpStatus.CREATED, code: 'COMMON201', message: '생성되었습니다.'},

  // Auth
  KAKAO_LOGIN_SUCCESS: {status: HttpStatus.OK, code: 'AUTH200', message: '로그인에 성공했습니다.'},

  // User
  USER_NAME_UPDATED: {status: HttpStatus.OK, code: 'USER200', message: '이름이 등록되었습니다.'},

  // Room
  ROOM_CREATED: {status: HttpStatus.CREATED, code: 'ROOM201', message: '방이 생성되었습니다.'},
  ROOM_UPDATED: {status: HttpStatus.OK, code: 'ROOM200', message: '방 정보가 수정되었습니다.'},
  ROOM_DELETED: {status: HttpStatus.OK, code: 'ROOM200', message: '방이 삭제되었습니다.'},
  ROOM_FETCHED: {status: HttpStatus.OK, code: 'ROOM200', message: '방 조회에 성공했습니다.'},
  ROOM_JOINED: {status: HttpStatus.OK, code: 'ROOM200', message: '방 참여가 완료되었습니다.'},
  ROOM_LEFT: {status: HttpStatus.OK, code: 'ROOM200', message: '방에서 나갔습니다.'},
} as const;

export type SuccessCodeType = (typeof SuccessCode)[keyof typeof SuccessCode];