# token-backend - how to run
 - First, build the containers
 ```
 docker-compose build 
 ```
 - Then, run the containers
 ```
 docker-compose up -d 
 ```
- To test the CLI, run the next command
 ```
 docker-compose run --rm nodecli
 ```
- To teardown everything, run the next command
 ```
 docker-compose down --rmi all -v 
 ```
