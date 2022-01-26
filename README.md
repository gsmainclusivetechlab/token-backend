# token-backend - How to run on release branch

- The live version is available on -> https://token.gsmainclusivetechlab.io/

- If you want to run the project locally:

- Requirements:

  - Docker Compose Version: +1.29
  - Docker Version: +17.06

- To run the containers

```
docker-compose up -d 
```

- Second, open browser on http://localhost:8080

- Third, choose the header option "Try Token" or go directly to http://localhost:8080/trytoken

- To teardown everything, run the next command

```
docker-compose down
```

- NOTE: If you want to use Live mode with Twilio you will need to fill the properties on the .env file with your Twilio credentials and config the receive webhook (A MESSAGE COMES IN option on Messaging section) for the path '{url}:4100/hooks/twilio'
