# Token Backend

This release version is available on: https://token.gsmainclusivetechlab.io

## Run

The release version of the Token Project runs with docker and uses the images of `token-backend` and `token-frontend` already built and available on Docker Hub.

Requirements:

  - Docker Compose Version: +1.29
  - Docker Version: +17.06

### Running the release version
```
docker-compose up -d 
```

### Accessing through your local browser:
http://localhost:8080

### Going directly to the TryToken page:
http://localhost:8080/trytoken


### Stopping the release version
```
docker-compose down
```

### .env file

If you want to use the Live mode with Twilio, you will have to fill the variables `TWILIO_SID`, `TWILIO_TOKEN` and `TWILIO_MESSAGE_SID` in the `.env` file with the values of your credentials on your Twilio account.
You also have to configure the `receive webhook` with the path `{url}:4100/hooks/twilio` in your Twilio account, under the `Messaging` section within the option `A MESSAGE COMES IN`. 

## Documentation - OpenAPI

You can see the documentation of each API accessing the following URLs after starting the code locally:

```
http://localhost:4000/docs - Proxy
http://localhost:4100/docs - SMS Gateway
http://localhost:4200/docs - USSD Gateway
http://localhost:4300/docs - MMO
http://localhost:4400/docs - Engine
http://localhost:3700/docs - Token Solution
```
