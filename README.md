# token-backend - how to run dev environment

- IF HOW WANT TO SEE THE DEMO VERSION, PLEASE CHANGE TO RELEASE BRANCH


- First, build the containers

```
docker-compose build
```

- Then, run the containers

```
docker-compose up -d
```

- To teardown everything, run the next command

```
docker-compose down --rmi all -v
```
