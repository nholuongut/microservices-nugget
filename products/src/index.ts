import express from 'express';
import CONFIG from './config';
// import database from './database';
import expressApp, { CreateServer } from './app';
import errorHandler from './utils/errors'

const { PORT } = CONFIG;

const StartServer = async () => {
  const app = await CreateServer();

  // await database.databaseConnection();

  await expressApp(app);

  // app.get('/', (req, res) => res.send("hehekj"))

  errorHandler(app);

  app
    .listen(PORT, () => {
      console.log(`Product Service listening to port ${PORT}`);
    })
    .on('error', (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();
