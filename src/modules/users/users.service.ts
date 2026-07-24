import { Injectable } from '@nestjs/common';
import { Prisma, SocialProvider, User } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySocialAccount(provider: SocialProvider, providerId: string) {
    return this.prisma.socialAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: true,
      },
    });
  }

  async createWithSocialAccount(params: {
    provider: SocialProvider;
    providerId: string;
    name: string;
    profileImageUrl: string | null;
  }): Promise<User> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: params.name,
          profileImageUrl: params.profileImageUrl,
          avatarTint: this.generateAvatarTint(),
        },
      });

      await tx.socialAccount.create({
        data: {
          userId: user.id,
          provider: params.provider,
          providerId: params.providerId,
        },
      });

      return user;
    });
  }

  async updateName(userId: number, name: string): Promise<User> {
    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 10) {
      throw new AppException(ErrorCode.INVALID_USER_NAME);
    }

    return this.prisma.user.update({
      where: {
        id: BigInt(userId),
      },
      data: {
        name: trimmedName,
      },
    });
  }

  private generateAvatarTint() {
    return Math.floor(Math.random() * 5);
  }
}
