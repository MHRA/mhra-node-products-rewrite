FROM node:21-slim AS base

FROM base AS deps

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# chrome install required for puppeteer
RUN apt-get update && apt-get install wget gnupg -y \
  && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | tee /etc/apt/trusted.gpg.d/google.asc >/dev/null \
  && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg \
  && sh -c 'echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update
RUN apt-get install google-chrome-stable -y --no-install-recommends

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM base as runner
WORKDIR /app
ENV NODE_ENV production

ARG AZURE_SEARCH_API_VERSION
ARG AZURE_SEARCH_EXACTNESS_BOOST
ARG AZURE_SEARCH_INDEX
ARG AZURE_SEARCH_KEY
ARG AZURE_SEARCH_SCORING_PROFILE
ARG AZURE_SEARCH_SERVICE
ARG AZURE_SEARCH_WORD_FUZZINESS
ARG GOOGLE_GTM_CONTAINER_ID
ARG GOOGLE_TRACKING_ID
ARG GOOGLE_USE_DEBUG
ARG ROOT_URL_DOMAIN
ARG USE_GRAPHQL

ENV AZURE_SEARCH_API_VERSION=${AZURE_SEARCH_API_VERSION}
ENV AZURE_SEARCH_EXACTNESS_BOOST=${AZURE_SEARCH_EXACTNESS_BOOST}
ENV AZURE_SEARCH_INDEX=${AZURE_SEARCH_INDEX}
ENV AZURE_SEARCH_KEY=${AZURE_SEARCH_KEY}
ENV AZURE_SEARCH_SCORING_PROFILE=${AZURE_SEARCH_SCORING_PROFILE}
ENV AZURE_SEARCH_SERVICE=${AZURE_SEARCH_SERVICE}
ENV AZURE_SEARCH_WORD_FUZZINESS=${AZURE_SEARCH_WORD_FUZZINESS}
ENV GOOGLE_GTM_CONTAINER_ID=${GOOGLE_GTM_CONTAINER_ID}
ENV GOOGLE_TRACKING_ID=${GOOGLE_TRACKING_ID}
ENV GOOGLE_USE_DEBUG=${GOOGLE_USE_DEBUG}
ENV ROOT_URL_DOMAIN=${ROOT_URL_DOMAIN}
ENV USE_GRAPHQL=${USE_GRAPHQL}
# Other env vars to be added

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD HOSTNAME="0.0.0.0" node server.js