# Base image
FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json ./

COPY src ./src

RUN npm install

EXPOSE 3002

CMD ["npm", "start"]
