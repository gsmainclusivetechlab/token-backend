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

- NOTE: If you want to use Live mode with Twilio you will need to fill the properties on the .env file with your Twilio credentials and config the receive webhook (A MESSAGE COMES IN option on Messaging section) for the path '{url}:4100/hooks/twilio'
