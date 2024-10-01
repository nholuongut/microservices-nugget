import express from 'express';
import CONFIG from './config';
import database from './database';
import expressApp, { CreateServer } from './app';
import errorHandler from './utils/errors';

const { PORT } = CONFIG;

export const StartServer = async () => {
  const app = await CreateServer();
  await database.databaseConnection();

  await expressApp(app);

  app.get('/', (req, res) => res.status(200).send("test"))

  errorHandler(app);

  app
    .listen(PORT, () => {
      console.log(`Customer service listening to port ${PORT}`);
    })
    .on('error', (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();
