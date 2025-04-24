import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessage, ChatMessageSchema } from './chat.schema';
import { ChatGateway } from 'src/gateway/chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: ChatMessage.name, schema: ChatMessageSchema}
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService]
})
export class ChatModule {}
