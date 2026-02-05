## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## Omid
docker build . -t manager:v1.30 --pull=false  --no-cache
docker save -o manager manager:v1.30
scp manager ubuntu@172.17.80.60:/home/ubuntu/
rm manager
docker load -i manager

docker build . -t manager:v1.30 --pull=false && docker save -o manager manager:v1.30 && scp manager ubuntu@172.17.80.60:/home/ubuntu/ && rm manager

docker load -i manager && docker-compose up -d && rm manager