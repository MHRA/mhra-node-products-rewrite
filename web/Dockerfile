FROM node:21-alpine AS base

FROM base AS deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

FROM base AS build

# Required for build - dynamic pages based on storage account
ARG AZURE_STORAGE_ACCOUNT
ARG AZURE_STORAGE_KEY
ENV AZURE_STORAGE_ACCOUNT=${AZURE_STORAGE_ACCOUNT}
ENV AZURE_STORAGE_KEY=${AZURE_STORAGE_KEY}

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM base as runner
ARG PORT=3000
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE ${PORT}
ENV PORT ${PORT}

CMD HOSTNAME="0.0.0.0" node server.js