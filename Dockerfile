FROM node:9.4-alpine
MAINTAINER petar.koretic@gmail.com

WORKDIR /
COPY . .

RUN npm install --only=production

CMD ["npm", "start"]
