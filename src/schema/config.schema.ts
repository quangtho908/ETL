import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type ConfigDocument = Document<Config>;

@Schema({ collection: 'config' })
export class Config {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.String })
  url: string;

  @Prop({ type: mongoose.Schema.Types.String })
  name: string;

  @Prop({ type: mongoose.Schema.Types.String })
  query: string;

  @Prop({ type: mongoose.Schema.Types.String })
  queryUrlDetail: string;

  @Prop({ type: mongoose.Schema.Types.String })
  queryPricing: string;

  @Prop({ type: mongoose.Schema.Types.String })
  queryName: string;

  @Prop({ type: mongoose.Schema.Types.String })
  params: string;

  @Prop({ type: mongoose.Schema.Types.String })
  file: string;

  @Prop({ type: mongoose.Schema.Types.String })
  mapExtract: string;

  @Prop({ type: mongoose.Schema.Types.String })
  bodyList: string;

  @Prop({ type: mongoose.Schema.Types.String })
  bodyDetail: string;

  @Prop({ type: mongoose.Schema.Types.Boolean, default: false })
  enable: boolean;

  @Prop({ type: mongoose.Schema.Types.String })
  headers: string;

  @Prop({ type: mongoose.Schema.Types.String })
  methodList: string;

  @Prop({ type: mongoose.Schema.Types.String })
  methodDetail: string;

  @Prop({ type: mongoose.Schema.Types.String })
  path: string;

  @Prop({ type: mongoose.Schema.Types.Boolean })
  isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.Boolean })
  isLoginRequired: boolean;

  @Prop({ type: mongoose.Schema.Types.String })
  loginDetails: string;

  @Prop({ type: mongoose.Schema.Types.Date })
  lastTimeCrawlData: Date;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
