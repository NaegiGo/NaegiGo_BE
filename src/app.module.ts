import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RoomsModule } from './modules/rooms/rooms.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RoomsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
