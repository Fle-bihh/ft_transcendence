FROM node:19-alpine
RUN mkdir -p /svr/app
WORKDIR /svr/app
RUN npm i -g @nestjs/cli --silent
COPY package*.json ./
RUN npm install
COPY ./src .
EXPOSE $BACKEND_PORT
CMD ["npm", "start", "run:debug"]