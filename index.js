const express = require("express");
const colors = require("colors");
const http = require("http");
const config = require('./config.json')
const app = express();

app.use(express.static('./client'))
app.use(express.json());

app.post('/data', (req, res)=>{
    console.log("Got request")
    makeApiCall(req.body.city).then(result=>{
        console.log("Got response, sending...".green)
        res.send(result);
    }).catch(err=>{
        console.log(err.red)
        res.send(err);
    })
})

app.listen(config.server_port, ()=>{
    console.log('Server listening on '+config.server_port);
});

function makeApiCall(city){
    return new Promise((resolve,reject)=>{
        if(city === undefined){
            reject("No location was provided");
        }
        var url = `${config.url}${city}/?token=${config.token}`;
        http.get(url,(response)=>{
            var str = '';
            response.on('data',(chunk)=>{
                str += chunk;
            })
            response.on('end',()=>{
                try {
                    var parsed = JSON.parse(str);
                    var result = {
                        "aqi": parsed.data.aqi,
                        "gases": parsed.data.iaqi
                    }
                    resolve(result);
                } catch (error) {
                    reject("Could not parse data");
                }
            })
            response.on('error',(err)=>{
                console.log(err);
                reject(err);
            })
        })
    })
}