FROM node:12.15.0-slim

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY . /usr/src/

RUN npm install .

EXPOSE 8888

CMD ["npm", "start"]
