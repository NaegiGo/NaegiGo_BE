import {
  AuthType,
  Prisma,
  Room,
  RoomMember,
  RoomRole,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomRequestDto } from './dto/create-room-request.dto';
import { UpdateRoomRequestDto } from './dto/update-room-request.dto';

type ActiveRoomMember = RoomMember & {
  user: {
    id: bigint;
    name: string;
    avatarTint: number;
  };
};

type RoomWithActiveMembers = Room & {
  members: ActiveRoomMember[];
};

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(userId: number, body: CreateRoomRequestDto) {
    const validated = this.validateRoomInput(body);
    const code = await this.generateUniqueCode();

    const room = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdRoom = await tx.room.create({
        data: {
          name: validated.name,
          goal: validated.goal,
          penalty: validated.penalty,
          currentAuthType: validated.authType,
          targetWeekdays: validated.targetWeekdays as Prisma.InputJsonValue,
          startDate: validated.startDate,
          endDate: validated.endDate,
          code,
        },
      });

      await tx.roomMember.create({
        data: {
          roomId: createdRoom.id,
          userId: BigInt(userId),
          role: RoomRole.OWNER,
        },
      });

      return createdRoom;
    });

    return {
      id: Number(room.id),
      code: room.code,
      name: room.name,
      goal: room.goal,
      penalty: room.penalty,
      authType: room.currentAuthType,
      targetWeekdays: this.readWeekdays(room.targetWeekdays),
      startDate: room.startDate.toISOString(),
      endDate: room.endDate.toISOString(),
      myRole: RoomRole.OWNER,
      memberCount: 1,
    };
  }

  async updateRoom(userId: number, roomId: number, body: UpdateRoomRequestDto) {
    const room = await this.getRoomWithActiveMembers(roomId);
    this.ensureRoomExists(room);
    this.ensureOwner(room.members, userId, ErrorCode.ROOM_OWNER_REQUIRED_TO_UPDATE);

    const startDate = body.startDate ? new Date(body.startDate) : room.startDate;
    const endDate = body.endDate ? new Date(body.endDate) : room.endDate;
    this.ensureValidDateRange(startDate, endDate);

    const hasStarted = this.getRoomStatus(room.startDate, room.endDate) !== 'BEFORE_START';
    const nextDay = this.getNextDayDateString();
    const nextAuthType = body.authType ?? room.currentAuthType;
    const shouldScheduleAuthTypeChange = nextAuthType !== room.currentAuthType;
    const shouldApplyAuthTypeImmediately = !hasStarted && shouldScheduleAuthTypeChange;
    const persistedWeekdays = this.readWeekdays(
      room.targetWeekdays,
    ) as Prisma.InputJsonValue;
    const nextTargetWeekdays: Prisma.InputJsonValue = hasStarted
      ? persistedWeekdays
      : body.targetWeekdays
        ? this.validateWeekdays(body.targetWeekdays)
        : persistedWeekdays;

    const updatedRoom = await this.prisma.room.update({
      where: { id: room.id },
      data: {
        name: body.name?.trim() ?? room.name,
        goal: hasStarted ? room.goal : (body.goal?.trim() ?? room.goal),
        penalty: hasStarted ? room.penalty : (body.penalty?.trim() ?? room.penalty),
        targetWeekdays: nextTargetWeekdays,
        startDate: hasStarted ? room.startDate : startDate,
        endDate: hasStarted ? room.endDate : endDate,
        currentAuthType: shouldApplyAuthTypeImmediately ? nextAuthType : room.currentAuthType,
        pendingAuthType:
          hasStarted && shouldScheduleAuthTypeChange ? nextAuthType : null,
        effectiveDate:
          hasStarted && shouldScheduleAuthTypeChange ? new Date(nextDay) : null,
      },
    });

    return {
      id: Number(updatedRoom.id),
      name: updatedRoom.name,
      goal: updatedRoom.goal,
      penalty: updatedRoom.penalty,
      currentAuthType: updatedRoom.currentAuthType,
      pendingAuthType: updatedRoom.pendingAuthType,
      effectiveDate: updatedRoom.effectiveDate
        ? this.formatDateOnly(updatedRoom.effectiveDate)
        : null,
    };
  }

  async deleteRoom(userId: number, roomId: number) {
    const room = await this.getRoomWithActiveMembers(roomId);
    this.ensureRoomExists(room);
    this.ensureOwner(room.members, userId, ErrorCode.ROOM_OWNER_REQUIRED_TO_DELETE);

    const authLogs = await this.prisma.roomAuthLog.findMany({
      where: { roomId: room.id },
      select: { id: true },
    });

    const authLogIds = authLogs.map((log) => log.id);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (authLogIds.length > 0) {
        await tx.authImage.deleteMany({
          where: { authLogId: { in: authLogIds } },
        });
      }

      await tx.roomAuthLog.deleteMany({ where: { roomId: room.id } });
      await tx.roomResult.deleteMany({ where: { roomId: room.id } });
      await tx.roomMember.deleteMany({ where: { roomId: room.id } });
      await tx.room.delete({ where: { id: room.id } });
    });
  }

  async getRoomByCode(userId: number, code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: {
        members: {
          where: { leftAt: null },
          include: { user: true },
        },
      },
    });

    this.ensureRoomExists(room);
    const owner = room.members.find((member) => member.role === RoomRole.OWNER);

    return {
      id: Number(room.id),
      code: room.code,
      ownerName: owner?.user.name ?? '',
      name: room.name,
      goal: room.goal,
      penalty: room.penalty,
      authType: room.pendingAuthType ?? room.currentAuthType,
      targetWeekdays: this.readWeekdays(room.targetWeekdays),
      startDate: room.startDate.toISOString(),
      endDate: room.endDate.toISOString(),
      status: this.getRoomStatus(room.startDate, room.endDate),
      dDay: this.getDDay(room.startDate),
      memberCount: room.members.length,
      isJoined: room.members.some((member) => Number(member.userId) === userId),
    };
  }

  async joinRoom(userId: number, roomId: number) {
    const joinedMember = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room = await tx.room.findUnique({
        where: { id: BigInt(roomId) },
        include: {
          members: true,
        },
      });
      this.ensureRoomExists(room);

      const activeMember = room.members.find(
        (member) => Number(member.userId) === userId && member.leftAt === null,
      );
      if (activeMember) {
        throw new AppException(ErrorCode.ROOM_ALREADY_JOINED);
      }

      if (this.getRoomStatus(room.startDate, room.endDate) !== 'BEFORE_START') {
        throw new AppException(ErrorCode.ROOM_ALREADY_STARTED);
      }

      const activeMemberCount = room.members.filter(
        (member) => member.leftAt === null,
      ).length;
      if (activeMemberCount >= 10) {
        throw new AppException(ErrorCode.ROOM_MEMBER_LIMIT_EXCEEDED);
      }

      const existingMember = room.members.find(
        (member) => Number(member.userId) === userId && member.leftAt !== null,
      );

      if (existingMember) {
        return tx.roomMember.update({
          where: { id: existingMember.id },
          data: {
            leftAt: null,
            joinedAt: new Date(),
            role: RoomRole.MEMBER,
          },
        });
      }

      return tx.roomMember.create({
        data: {
          roomId: BigInt(roomId),
          userId: BigInt(userId),
          role: RoomRole.MEMBER,
        },
      });
    });

    return {
      roomId,
      role: joinedMember.role,
      joinedAt: joinedMember.joinedAt.toISOString(),
    };
  }

  async leaveRoom(userId: number, roomId: number) {
    const room = await this.getRoomWithActiveMembers(roomId);
    this.ensureRoomExists(room);

    const member = room.members.find((item) => Number(item.userId) === userId);
    if (!member) {
      throw new AppException(ErrorCode.ROOM_MEMBER_NOT_FOUND);
    }

    if (member.role === RoomRole.OWNER) {
      throw new AppException(ErrorCode.ROOM_OWNER_CANNOT_LEAVE);
    }

    await this.prisma.roomMember.update({
      where: { id: member.id },
      data: {
        leftAt: new Date(),
      },
    });
  }

  async getRoomDetail(userId: number, roomId: number) {
    const room = await this.getRoomWithActiveMembers(roomId);
    this.ensureRoomExists(room);

    const me = room.members.find((member) => Number(member.userId) === userId);
    if (!me) {
      throw new AppException(ErrorCode.ROOM_MEMBER_ONLY);
    }

    return {
      id: Number(room.id),
      code: room.code,
      name: room.name,
      goal: room.goal,
      penalty: room.penalty,
      currentAuthType: room.currentAuthType,
      pendingAuthType: room.pendingAuthType,
      effectiveDate: room.effectiveDate ? this.formatDateOnly(room.effectiveDate) : null,
      targetWeekdays: this.readWeekdays(room.targetWeekdays),
      startDate: room.startDate.toISOString(),
      endDate: room.endDate.toISOString(),
      status: this.getRoomStatus(room.startDate, room.endDate),
      dDay: this.getDDay(room.startDate),
      myRole: me.role,
      isJoined: true,
      members: room.members.map((member) => ({
        id: Number(member.user.id),
        name: member.user.name,
        avatarTint: member.user.avatarTint,
        role: member.role,
        isMe: Number(member.userId) === userId,
      })),
    };
  }

  private async getRoomWithActiveMembers(roomId: number) {
    return this.prisma.room.findUnique({
      where: { id: BigInt(roomId) },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarTint: true,
              },
            },
          },
        },
      },
    });
  }

  private async getRoomWithAllMembers(roomId: number) {
    return this.prisma.room.findUnique({
      where: { id: BigInt(roomId) },
      include: {
        members: true,
      },
    });
  }

  private ensureRoomExists(room: RoomWithActiveMembers | (Room & { members: RoomMember[] }) | null): asserts room is NonNullable<typeof room> {
    if (!room) {
      throw new AppException(ErrorCode.ROOM_NOT_FOUND);
    }
  }

  private ensureOwner(members: ActiveRoomMember[], userId: number, error: typeof ErrorCode.ROOM_OWNER_REQUIRED_TO_UPDATE | typeof ErrorCode.ROOM_OWNER_REQUIRED_TO_DELETE) {
    const member = members.find((item) => Number(item.userId) === userId);
    if (!member || member.role !== RoomRole.OWNER) {
      throw new AppException(error);
    }
  }

  private validateRoomInput(body: CreateRoomRequestDto) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    this.ensureValidDateRange(startDate, endDate);

    return {
      name: body.name.trim(),
      goal: body.goal.trim(),
      penalty: body.penalty.trim(),
      authType: body.authType,
      targetWeekdays: this.validateWeekdays(body.targetWeekdays),
      startDate,
      endDate,
    };
  }

  private ensureValidDateRange(startDate: Date, endDate: Date) {
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      throw new AppException(ErrorCode.INVALID_ROOM_DATE_RANGE);
    }
  }

  private validateWeekdays(weekdays: number[]) {
    const unique = Array.from(new Set(weekdays)).sort((a, b) => a - b);
    return unique;
  }

  private readWeekdays(raw: Prisma.JsonValue) {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value));
  }

  private getRoomStatus(startDate: Date, endDate: Date) {
    const now = new Date();

    if (now < startDate) {
      return 'BEFORE_START';
    }

    if (now > endDate) {
      return 'ENDED';
    }

    return 'IN_PROGRESS';
  }

  private getDDay(startDate: Date) {
    const today = new Date();
    const start = new Date(startDate);
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const diffMs = normalizedStart.getTime() - normalizedToday.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private async generateUniqueCode() {
    for (let index = 0; index < 10; index += 1) {
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      const existing = await this.prisma.room.findUnique({
        where: { code },
        select: { id: true },
      });

      if (!existing) {
        return code;
      }
    }

    throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
  }

  private getNextDayDateString() {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate()).toISOString();
  }

  private formatDateOnly(date: Date) {
    return date.toISOString().slice(0, 10);
  }
}
