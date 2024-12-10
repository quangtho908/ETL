import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Log } from '../schema/log.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class LogService {
  constructor(@InjectModel(Log.name) private logModel: Model<Log>) {}

  public async logEvent(
    configId: Types.ObjectId,
    status: string,
    message: string,
    details: string,
  ) {
    const logEntry = new this.logModel({
      configId,
      timestamp: new Date(),
      status,
      message,
      details,
    });
    await logEntry.save();
  }
}
