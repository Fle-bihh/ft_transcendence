FROM node:19
RUN mkdir -p /svr/app
WORKDIR /svr/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE $BACKEND_PORT
CMD ["npm", "start", "run"]
