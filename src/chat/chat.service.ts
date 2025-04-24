import { Injectable } from '@nestjs/common';
import { ChatMessage, ChatMessageDocument } from './chat.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { send } from 'process';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(ChatMessage.name)
        private chatModel: Model<ChatMessageDocument>
    ) {}

    private agentQueue: string[] = ['agent1', 'agent2'];
    private roomMap = new Map<string, string>();

    async saveMessage(roomId: string, sender: string, message: string) {
        const sendAt = new Date();
        const chat = await this.chatModel.findOneAndUpdate(
            {roomId},
            {
                $push: {
                    contents : {
                        sender,
                        message,
                        sendAt
                    }
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        console.log(chat);

        return chat;
    }

    async getMessagesByRoom(roomId: string) {
        const chat = await this.chatModel.findOne({roomId});
        return chat?.contents || [];
    }

    assignAgent(userId: string): string | null {
        const agent = this.agentQueue.shift();

        if(agent) {
            this.roomMap.set(userId, agent);
            return agent;
        }
        return null;
    }

    createRoom(userId: string, agentId: string) :string {
        const roomId = `${userId}-${agentId}`;
        return roomId;
    }
}
