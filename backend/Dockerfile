FROM node:19
RUN mkdir -p /svr/app
WORKDIR /svr/app
RUN npm i -g @nestjs/cli --silent
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE $BACKEND_PORT
CMD ["npm", "start", "run"]
