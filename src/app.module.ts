import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigSerivce } from 'config/mongoose.config.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MongooseConfigSerivce
    }),
    ChatModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
