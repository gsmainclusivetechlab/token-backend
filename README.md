# token-backend - How to run on release branch

- Requirements:

  - Docker Compose Version: +1.29
  - Docker Version: +17.06

- First, run the containers

```
docker-compose up -d 
```

- Second, open browser on http://localhost:8080

- Third, choose the header option "TryToken" or go directly to http://localhost:8080/trytoken

- To teardown everything, run the next command

```
docker-compose down
```
