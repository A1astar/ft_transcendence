FROM node:20-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./

# RUN npm ci --production
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
