#Import the base Alpine image
FROM alpine:3.20.2

WORKDIR /opt/bin

#Add Packages
RUN apk add --no-cache bash sed grep curl coreutils nodejs npm

WORKDIR /cli
# 'package-lock.json' contains `*` to not enforce file existance
ADD ./package.json ./package-lock*.json ./ 
ADD ./commands ./commands
RUN npm install --production

ENTRYPOINT [ "npm", "start" ]