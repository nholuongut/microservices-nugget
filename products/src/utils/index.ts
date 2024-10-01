import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import amqplib, { Channel } from 'amqplib'

import CONFIG from '../config';
import { Request } from 'express';
import { CustomRequest } from '../types/api/customRequest.types';
import ProductService from '../services/productService';

const { APP_SECRET, MSG_QUEUE_URL, EXCHANGE_NAME } = CONFIG;
// let amqplibConnection = null;

//Utility functions
const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};
const GeneratePassword = async (inputPasswd: string, salt: string) => {
  return await bcrypt.hash(inputPasswd, salt);
};

const ValidatePassword = async ({
  inputPasswd,
  password,
  salt,
}: {
  [key: string]: string;
}) => {
  return (await GeneratePassword(inputPasswd, salt)) === password;
};

const GenerateSignature = async (payload: string | jwt.JwtPayload) => {
  return jwt.sign(payload, APP_SECRET as string, { expiresIn: '1d' });
};

const ValidateSignature = async (req: Request) => {
  const signature = req.get('Authorization');

  if (!signature) return false;
  try {
    const payload = jwt.verify(
      signature.split(' ')[1],
      APP_SECRET,
    ) as jwt.JwtPayload;
    
    (req as CustomRequest).user = payload;
    return true;
  } catch (err) {
    return false;
  }
};

const FormateData = (data: any) => {
  if (data) {
    return { data };
  } else {
    throw new Error('Data Not found!');
  }
};
// try {
//   const channel = await amqplib.connect(MSG_QUEUE_URL);
//   await channel.assertQueue(EXCHANGE_NAME, { durable: true });
//   return channel;
// } catch (err) {
//   throw err;
// }

//Message Broker
const CreateChannel = async () => {
  try{
    const connection = await amqplib.connect(MSG_QUEUE_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(EXCHANGE_NAME, { durable: true });
    return channel;
  }catch(err){
    console.log(err)
    throw err;
  }
};

const PublishMessage = (channel: Channel, service: string, msg: string) => {
  channel.publish(EXCHANGE_NAME, service, Buffer.from(msg));
  console.log("Sent: ", msg);
};

const RPCObserver = async (RPC_QUEUE_NAME: string, service: ProductService, channel: Channel) => {
  await channel.assertQueue(RPC_QUEUE_NAME, {
    durable: false,
  });
  channel.prefetch(1);
  channel.consume(
    RPC_QUEUE_NAME,
    async (msg) => {
      if (msg?.content) {
        // DB Operation
        const payload = JSON.parse(msg.content.toString());
        const response = await service.serveRPCRequest(payload);
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        channel.ack(msg);
      }
    },
    {
      noAck: false,
    }
  );
};

export {
  FormateData,
  ValidateSignature,
  GeneratePassword,
  ValidatePassword,
  GenerateSalt,
  GenerateSignature,
  CreateChannel,
  PublishMessage, 
  RPCObserver
};