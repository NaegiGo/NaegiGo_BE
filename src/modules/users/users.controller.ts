import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ApiResponse } from '../../common/responses/api.response';
import { SuccessCode } from '../../common/responses/success-code';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserDto } from '../auth/dto/user.dto';
import { UpdateUserNameRequestDto } from './dto/update-user-name-request.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: {
    userId: number;
  };
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '이름 수정',
    description: '로그인한 사용자의 이름을 수정합니다.',
  })
  @ApiBody({ type: UpdateUserNameRequestDto })
  @ApiOkResponse({ type: UserDto })
  async updateMyName(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateUserNameRequestDto,
  ) {
    const user = await this.usersService.updateName(req.user.userId, body.name);
    return ApiResponse.success(SuccessCode.USER_NAME_UPDATED, {
      id: Number(user.id),
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      avatarTint: user.avatarTint,
    });
  }
}
