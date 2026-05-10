import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CurrentUserService } from './current-user.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [CurrentUserService],
  exports: [CurrentUserService],
})
export class CurrentUserModule {}
