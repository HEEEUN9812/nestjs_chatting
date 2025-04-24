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

    async saveMessage(roomId: string, sender: string, message: string) {
        const sendAt = new Date();
        const isConnected = true;
        const chat = await this.chatModel.findOneAndUpdate(
            {roomId},
            {
                $push: {
                    contents : {
                        sender,
                        message,
                        sendAt
                    }
                },
                $set: {
                    isConnected: true
                }
            },
            {
                new: true,
                upsert: true
            },
        );

        console.log(chat);

        return chat;
    }

    async disconnectChat(roomId: string) {
        await this.chatModel.updateOne(
            {roomId},
            {
                $set: {
                    isConnected: false
                }
            }
        )
    }

    async getMessagesByRoom(roomId: string) {
        const chat = await this.chatModel.findOne({roomId});
        return chat?.contents || [];
    }

    async getConnectedRooms() {
        const chats = await this.chatModel.find({isConnected: true});
        return chats.map(chat => chat.roomId);
    }
}
