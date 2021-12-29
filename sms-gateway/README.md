# Run
 - Run npm start
 - Make a post to '/send' on PORT=4100
 - Body type:
  ```
  {
    "phoneNumber": "+351966558950",
    "receivingPhoneNumber": "+351966558951",
    "text": "PING"
  }
  ```
 - The response will be 'PONG'