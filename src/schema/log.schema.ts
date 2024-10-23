import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Config } from './config.schema';
export type LogDocument = Document<Log>;
@Schema({ collection: 'logs' })
export class Log {
  @Prop({ type: Types.ObjectId, ref: 'Config' })
  configId: Types.ObjectId | Config;

  @Prop()
  timestamp: Date;

  @Prop()
  status: string;

  @Prop()
  message: string;

  @Prop()
  details: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
