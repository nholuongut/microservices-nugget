FROM node:14-alpine

WORKDIR /app/shopping/

COPY package*.json /app/shopping/

RUN npm install

COPY . /app/shopping/

RUN npm run build

EXPOSE 5002

# Start the app
CMD ["npm", "start"]
