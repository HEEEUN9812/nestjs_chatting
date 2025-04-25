import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "src/chat/chat.service";

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class ChatGateway{
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  private userRoomMap = new Map<string, string>();

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data : {sender: string; message: string, roomId: string},
    @ConnectedSocket() client: Socket
  ) {

    const roomId = data.roomId ? data.roomId : client.id;

    this.userRoomMap.set(client.id, roomId);

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

  @SubscribeMessage('get_connected_rooms')
  async handleGetConnectedRooms(@ConnectedSocket() client: Socket) {
    const connectedRooms = await this.chatService.getConnectedRooms();
    client.emit('connected_rooms', connectedRooms);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const roomId = this.userRoomMap.get(client.id);
    console.log(`Client disconnect: ${client.id}`);

    if (client.id === roomId) {
      console.log(`Client disconnect: ${client.id}`);
      
      this.server.to(roomId).emit('receive_message', {
        sender: 'system',
        message: '고객님이 채팅방을 나가 상담을 종료하겠습니다.',
        sendAt: new Date(),
        isSystem: true
      });

      this.chatService.disconnectChat(roomId);

      this.userRoomMap.delete(client.id);
    }
  }
 }