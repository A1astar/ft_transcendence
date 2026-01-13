# Base image
FROM node:20-alpine

WORKDIR /app

COPY prod.package.json prod.tsconfig.json ./

COPY src ./src

RUN mv prod.package.json package.json && mv prod.tsconfig.json tsconfig.json

RUN npm install

EXPOSE 3002

CMD ["npm", "start"]
