import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import amqplib, {Channel} from 'amqplib'
import { v4 as uuid4} from 'uuid'

import CONFIG from '../config';
import { Request } from 'express';
import { CustomRequest } from '../types/api/customRequest.types';
import ShoppingService from '../services/shooppingService';

const { APP_SECRET, MSG_QUEUE_URL, EXCHANGE_NAME, SHOPPING_SERVICE } = CONFIG;

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

//Message Broker
let amqplibConnection: null | amqplib.Connection = null;
const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(MSG_QUEUE_URL);
  }
  return await amqplibConnection.createChannel();
};

const CreateChannel = async () => {
  try{
    const channel = await getChannel();
    await channel.assertQueue(EXCHANGE_NAME, {durable: true});
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

const SubscribeMessage = async (channel: Channel, service: ShoppingService) => {
  await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
  const q = await channel.assertQueue("", { exclusive: true });
  console.log(` Waiting for messages in queue: ${q.queue}`);

  channel.bindQueue(q.queue, EXCHANGE_NAME, SHOPPING_SERVICE);

  channel.consume(
    q.queue,
    (msg) => {
      if (msg?.content) {
        console.log("the message is:", msg.content.toString());
        service.SubscribeEvents(msg.content.toString());
      }
      console.log("[X] received");
    },
    {
      noAck: true,
    }
  );
};

const requestData = async (RPC_QUEUE_NAME: string, requestPayload: any, uuid: string) => {
  try {
    const channel = await getChannel();

    const q = await channel.assertQueue("", { exclusive: true });

    channel.sendToQueue(
      RPC_QUEUE_NAME,
      Buffer.from(JSON.stringify(requestPayload)),
      {
        replyTo: q.queue,
        correlationId: uuid,
      }
    );

    return new Promise((resolve, reject) => {
      // timeout n
      const timeout = setTimeout(() => {
        channel.close();
        resolve("API could not fullfil the request!");
      }, 8000);
      channel.consume(
        q.queue,
        (msg) => {
          if (msg && msg?.properties.correlationId == uuid) {
            resolve(JSON.parse(msg.content.toString()));
            clearTimeout(timeout);
          } else {
            reject("data Not found!");
          }
        },
        {
          noAck: true,
        }
      );
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const RPCRequest = async (RPC_QUEUE_NAME: string, requestPayload: any) => {
  const uuid = uuid4(); // correlationId
  return await requestData(RPC_QUEUE_NAME, requestPayload, uuid);
};

export {
  FormateData,
  ValidateSignature,
  GeneratePassword,
  ValidatePassword,
  GenerateSalt,
  GenerateSignature,
  RPCRequest,
  getChannel,
  PublishMessage,
  requestData,
  SubscribeMessage,
  CreateChannel
};
