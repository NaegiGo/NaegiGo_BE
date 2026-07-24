import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ApiResponse } from '../../common/responses/api.response';
import { SuccessCode } from '../../common/responses/success-code';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomRequestDto } from './dto/create-room-request.dto';
import { CreateRoomResponseDto } from './dto/create-room-response.dto';
import { JoinRoomResponseDto } from './dto/join-room-response.dto';
import { RoomByCodeResponseDto } from './dto/room-by-code-response.dto';
import { RoomDetailResponseDto } from './dto/room-detail-response.dto';
import { UpdateRoomRequestDto } from './dto/update-room-request.dto';
import { UpdateRoomResponseDto } from './dto/update-room-response.dto';
import { RoomsService } from './rooms.service';

type AuthenticatedRequest = Request & {
  user: {
    userId: number;
  };
};

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: '방 만들기' })
  @ApiBody({ type: CreateRoomRequestDto })
  @ApiCreatedResponse({ type: CreateRoomResponseDto })
  async createRoom(@Req() req: AuthenticatedRequest, @Body() body: CreateRoomRequestDto) {
    const data = await this.roomsService.createRoom(req.user.userId, body);
    return ApiResponse.success(SuccessCode.ROOM_CREATED, data);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '방 코드로 방 조회' })
  @ApiParam({ name: 'code', description: '방 코드' })
  @ApiOkResponse({ type: RoomByCodeResponseDto })
  async getRoomByCode(@Req() req: AuthenticatedRequest, @Param('code') code: string) {
    const data = await this.roomsService.getRoomByCode(req.user.userId, code);
    return ApiResponse.success(SuccessCode.ROOM_FETCHED, data);
  }

  @Get(':roomId')
  @ApiOperation({ summary: '방 상세 조회 (참여 후)' })
  @ApiParam({ name: 'roomId', description: '방 id' })
  @ApiOkResponse({ type: RoomDetailResponseDto })
  async getRoomDetail(
    @Req() req: AuthenticatedRequest,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const data = await this.roomsService.getRoomDetail(req.user.userId, roomId);
    return ApiResponse.success(SuccessCode.ROOM_FETCHED, data);
  }

  @Patch(':roomId')
  @ApiOperation({ summary: '방 수정' })
  @ApiParam({ name: 'roomId', description: '방 id' })
  @ApiBody({ type: UpdateRoomRequestDto })
  @ApiOkResponse({ type: UpdateRoomResponseDto })
  async updateRoom(
    @Req() req: AuthenticatedRequest,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() body: UpdateRoomRequestDto,
  ) {
    const data = await this.roomsService.updateRoom(req.user.userId, roomId, body);
    return ApiResponse.success(SuccessCode.ROOM_UPDATED, data);
  }

  @Delete(':roomId')
  @ApiOperation({ summary: '방 삭제' })
  @ApiParam({ name: 'roomId', description: '방 id' })
  async deleteRoom(
    @Req() req: AuthenticatedRequest,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    await this.roomsService.deleteRoom(req.user.userId, roomId);
    return ApiResponse.success(SuccessCode.ROOM_DELETED, null);
  }

  @Post(':roomId/join')
  @ApiOperation({ summary: '방 참여 확정' })
  @ApiParam({ name: 'roomId', description: '방 id' })
  @ApiOkResponse({ type: JoinRoomResponseDto })
  async joinRoom(
    @Req() req: AuthenticatedRequest,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const data = await this.roomsService.joinRoom(req.user.userId, roomId);
    return ApiResponse.success(SuccessCode.ROOM_JOINED, data);
  }

  @Delete(':roomId/members/me')
  @ApiOperation({ summary: '방 나가기' })
  @ApiParam({ name: 'roomId', description: '방 id' })
  async leaveRoom(
    @Req() req: AuthenticatedRequest,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    await this.roomsService.leaveRoom(req.user.userId, roomId);
    return ApiResponse.success(SuccessCode.ROOM_LEFT, null);
  }
}
