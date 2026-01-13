FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git openssh-client

COPY prod.package.json prod.tsconfig.json ./

COPY src ./src

RUN mv prod.package.json package.json && mv prod.tsconfig.json tsconfig.json

RUN npm install

EXPOSE 3004

CMD ["npm", "start"]
