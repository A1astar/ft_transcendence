# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

COPY prod.package.json prod.tsconfig.json ./

COPY src ./src

RUN mv prod.package.json package.json && mv prod.tsconfig.json tsconfig.json

RUN npm install

# Expose port
EXPOSE 3003

# Start server
CMD ["npm", "start"]
