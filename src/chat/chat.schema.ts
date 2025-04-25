import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ collection: 'chat_logs',timestamps: true})
export class ChatMessage {
    @Prop()
    roomId: string;

    @Prop({
        type: [
            {
                sender: {type: String, required: true},
                message: {type: String, required: true},
                sendAt: {type: Date, required: true},
                _id: false

            }
        ],
        default: []
    })
    contents: {
        sender: string;
        message: string;
        sendAt: Date;
    }

    @Prop()
    isConnected: boolean;
    
    createdAt?: Date;
    updatedAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);