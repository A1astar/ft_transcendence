FROM node:20-alpine

# Install git (needed for github: dependencies)
RUN apk add --no-cache git

WORKDIR /app

COPY *.json ./

# Install all dependencies (including dev) for build
RUN npm install

# Install TypeScript globally and @types/node locally (needed for build)
RUN npm install -g typescript && \
    npm install --save-dev @types/node typescript

COPY . .

# Build TypeScript using standalone build config
RUN tsc -p tsconfig.build.json

EXPOSE 3001

CMD ["npm", "start"]
