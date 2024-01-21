FROM node:18-alpine

WORKDIR /app

ADD server.js /app/server.js
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
ENV FCM_PUBLIC $FCM_PUBLIC
ENV FCM_PRIVATE $FCM_PRIVATE

RUN [ "printenv" ]

RUN [ "npm", "install" ]

CMD ["npm", "start"]
