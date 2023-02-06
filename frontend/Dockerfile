FROM node:19-slim
RUN mkdir -p /usr/src/app
WORKDIR /user/src/app
COPY package*.json ./
RUN ls -la
COPY . .
RUN npm install
