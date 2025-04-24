import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "src/chat/chat.service";

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('request_chat')
  async handleChatRequest(@MessageBody() data: {userId: string}) {
    const assignedAgent = await this.chatService.assignAgent(data.userId);
    if(assignedAgent) {
      const roomId = this.chatService.createRoom(data.userId, assignedAgent);
      this.server.to(roomId).emit('chat_started', {roomId});
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data : {sender: string; message: string, roomId: string},
    @ConnectedSocket() client: Socket
  ) {

    const roomId = data.roomId ? data.roomId : client.id;

    const savedChat = await this.chatService.saveMessage(
      roomId,
      data.sender,
      data.message,
    );

    this.server.to(roomId).emit('receive_message',{
        sender: data.sender,
        message: data.message,
        sendAt: new Date()
      });
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: {roomId: string},
    @ConnectedSocket() client: Socket
  ) {
    client.join(data.roomId);
    console.log(`[join_room] 상담사가 ${data.roomId} 방에 입장했습니다`);

    const chat = await this.chatService.getMessagesByRoom(data.roomId);

    if(chat) {
      client.emit('chat_history', chat)
    }
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnect: ${client.id}`);
  }
 }