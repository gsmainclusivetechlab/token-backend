# Run
 - Run npm start
 - Go to 'sms-gateway' folder and run npm start
 - Make a post to '/sms-gateway/send' on PORT=4000
 - Body type:
  ```
  {
    "phoneNumber": "+351966558950",
    "receivingPhoneNumber": "+351966558951",
    "text": "PING"
  }
  ```
 - The response will be 'PONG'