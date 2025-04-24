import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";

@Injectable()
export class MongooseConfigSerivce implements MongooseOptionsFactory {

    constructor(private configService: ConfigService) {}

    createMongooseOptions(): Promise<MongooseModuleOptions> | MongooseModuleOptions {
        return {
            uri: this.configService.get<string>('MONGODB_URI')
        }
    }
}