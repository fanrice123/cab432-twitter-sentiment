FROM node:6-slim

COPY . /nihao
COPY package.json /nihao/package.json
COPY .env /nihao/.env

WORKDIR /nihao

ENV NODE_ENV production
RUN npm install --production

CMD ["npm","start"]

EXPOSE 3000
