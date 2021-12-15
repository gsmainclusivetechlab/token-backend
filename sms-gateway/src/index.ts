import * as express from 'express';
import axios, { AxiosResponse, AxiosError } from 'axios';
import 'dotenv/config'

const app = express();
app.use(express.json())

app.post('*', function (req, res) {

    const { body } = req;

    if(body.text === 'PING'){
        res.send('PONG');
    } else {
        res.send('Thanks for using SMS Gateway');
    }
    
    // const url = <string>process.env.WEB_HOOK_URL;

    // axios.post(url, body)
    // .then((response: AxiosResponse) => {
    //     res.send(response.data);
    // })
    // .catch((error: AxiosError) => {
    //     res.status(500).send(error.message);
    // });
});

app.listen(4000);