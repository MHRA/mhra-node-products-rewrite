FROM node:21-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run compile

FROM base AS runner
ARG PORT=3000
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV NODE_ENV production

EXPOSE ${PORT}
ENV PORT ${PORT}

CMD HOSTNAME="0.0.0.0" node ./dist/index.js