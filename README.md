# token-backend - How to run on release branch

- Requirements:

  - Docker Compose Version: +1.29
  - Docker Version: +17.06

- To run the containers

```
docker-compose up -d 
```

- If you want to see the client, you will need to build the client (token-frontend) on your own and update the docker-compose with the client image and update the docker-compose

- The client will run on port 8080 (http://localhost:8080) and for try this showcase you will need to choose the header option "Try Token" or go directly to http://localhost:8080/trytoken

- To teardown everything

```
docker-compose down
```
