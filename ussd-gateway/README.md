# Run
 - Run npm start
 - Make a post to '/send' on PORT=4200
 - Body type:
  ```
  {
    "sessionId": "id1",
    "serviceCode": "123",
    "phoneNumber": "+351966558950",
    "text": "*#0#"
  }
  ```
 - The response will be 'END ACK'