FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.js template.docx ./
COPY lib ./lib
COPY routes ./routes
COPY public ./public
COPY worker ./worker

RUN npm run build
RUN npm prune --omit=dev

EXPOSE 3000
CMD ["node", "index.js"]
