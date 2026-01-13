FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json ./

COPY src ./src

RUN mkdir database

RUN apk add --no-cache git openssh-client

RUN npm install

EXPOSE 3001

CMD ["npm", "start"]
