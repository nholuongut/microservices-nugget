FROM node:14-alpine

WORKDIR /app/products/

COPY package*.json /app/products/

RUN npm install

COPY . /app/products/

RUN npx prisma generate
RUN npm run build

EXPOSE 5001

# Start the app
CMD ["npm", "start"]