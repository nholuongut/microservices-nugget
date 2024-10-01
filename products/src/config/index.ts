import dotenv from 'dotenv';

dotenv.config();

if (process.env.NODE_ENV !== 'prod') {
  const configFile = `../.env.${process.env.NODE_ENV}`;
  dotenv.config({ path: configFile });
} else {
  dotenv.config();
}

export default {
  PORT: process.env.PORT || 5000,
  DB_URL: process.env.MONGO_URI as string,
  APP_SECRET: process.env.APP_SECRET as string,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME as string,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL as string,
  CUSTOMER_SERVICE: "customer_service",
  SHOPPING_SERVICE: "shopping_service",
  SENTRY: process.env.SENTRY_URI as string,
};
