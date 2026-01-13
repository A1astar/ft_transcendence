FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git openssh-client

COPY package.json tsconfig.json ./

COPY src ./src

RUN npm install

EXPOSE 3004

CMD ["npm", "start"]
