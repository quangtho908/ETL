import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type ConfigDocument = Document<Config>

@Schema({collection: "config"})
export class Config {
  @Prop({type: mongoose.Schema.Types.String})
  url: string

  @Prop({type: mongoose.Schema.Types.String})
  name: string

  @Prop({type: mongoose.Schema.Types.String})
  query: string
  
  @Prop({type: mongoose.Schema.Types.String})
  queryUrlDetail: string

  @Prop({type: mongoose.Schema.Types.String})
  queryPricing: string

  @Prop({type: mongoose.Schema.Types.String})
  queryName: string

  @Prop({type: mongoose.Schema.Types.String})
  params: string

  @Prop({type: mongoose.Schema.Types.String})
  file: string

  @Prop({type: mongoose.Schema.Types.String})
  mapExtract: string

  @Prop({type: mongoose.Schema.Types.String})
  bodyList: string

  @Prop({type: mongoose.Schema.Types.String})
  bodyDetail: string

  @Prop({type: mongoose.Schema.Types.Boolean, default: false})
  enable: boolean

  @Prop({type: mongoose.Schema.Types.String})
  headers: string

  @Prop({type: mongoose.Schema.Types.String})
  methodList: string

  @Prop({type: mongoose.Schema.Types.String})
  methodDetail: string

  @Prop({type: mongoose.Schema.Types.String})
  path: string
}

export const ConfigSchema = SchemaFactory.createForClass(Config)
