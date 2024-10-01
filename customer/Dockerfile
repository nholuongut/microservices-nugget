FROM node:14-alpine

WORKDIR /app/customer/

COPY package*.json /app/customer/

RUN npm install

COPY . /app/customer/

RUN npm run build

EXPOSE 5000

# Start the app
CMD ["npm", "start"]
