FROM node:19-alpine
RUN mkdir -p /svr/app
WORKDIR /svr/app
COPY package*.json ./
# COPY tsconfig.json ./
RUN npm i -g @nestjs/cli --silent
RUN npm install
COPY ./src .
# COPY ormconfig.json ./
# USER root
# COPY ./run-migrations.sh .
# RUN chmod +x /usr/src/app/run-migrations.sh
# Value set in .env file.
# RUN apt-get update && apt-get install -y netcat
EXPOSE $BACKEND_PORT
# CMD ["./run-migrations.sh"]
CMD ["npm", "start", "run:debug"]
