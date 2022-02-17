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

# .env File

If you want to use Live mode with Twilio, you will need to fill the properties on the .env file (TWILIO_SID, TWILIO_TOKEN and TWILIO_MESSAGE_SID) with your Twilio credentials and config the receive webhook (A MESSAGE COMES IN option on Messaging section) for the path '{url}:4100/hooks/twilio'

# token-frontend - how to run dev environment

In this case, the developer need to access the token-frontend repository (https://github.com/gsmainclusivetechlab/token-frontend) and go to main branch to clone the repository, then follow the next steps presents on README.md

# Documentation - OpenAPI

You can see the documentation of each api in the following urls after starting the code locally

```
localhost:4000/docs - Proxy
localhost:4100/docs - SMS Gateway
localhost:4200/docs - USSD Gateway
localhost:4300/docs - MMO
localhost:4400/docs - Engine
localhost:3700/docs - Token Solution
```