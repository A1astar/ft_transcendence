FROM alpine

WORKDIR /app

COPY package*.json ./

# npm clean installation: suited for CI/CD and containers
RUN npm ci

COPY . .
