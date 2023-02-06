FROM node:19
# RUN mkdir -p /svr/app
RUN mkdir -p /svr/app
WORKDIR /svr/app
RUN npm i -g @nestjs/cli --silent
COPY package*.json ./
# RUN npm uninstall bcrypt
# RUN npm i bcrypt
RUN npm ci
# USER node
COPY . .
# RUN npm rebuild bcrypt --build-form-source
EXPOSE $BACKEND_PORT
CMD ["npm", "start", "run:debug"]
