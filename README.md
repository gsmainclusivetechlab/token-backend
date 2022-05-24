# Token Backend

This is the backend code of the Token Project, developed in NodeJS.


## Build

### building docker images
```
docker-compose build
```

### running the backend
```
docker-compose up -d
```

### removing everything
This will stop the backend and remove all the docker images
```
docker-compose down --rmi all -v
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
