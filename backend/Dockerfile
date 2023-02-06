FROM node:19
# RUN mkdir -p /svr/app
WORKDIR /svr/app
RUN npm i -g @nestjs/cli --silent
COPY --chown=node:node package*.json ./
# RUN npm uninstall bcrypt
# RUN npm i bcrypt
RUN npm ci
USER node
COPY --chown=node:node . .
# RUN npm rebuild bcrypt --build-form-source
EXPOSE $BACKEND_PORT
CMD ["npm", "start", "run"]
