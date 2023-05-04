FROM node:18

WORKDIR /SPLETNO_PROGRAMIRANJE

COPY package*.json ./

RUN npm install

COPY . /SPLETNO_PROGRAMIRANJE

EXPOSE 3000

CMD ["npm", "run", "dev"]
