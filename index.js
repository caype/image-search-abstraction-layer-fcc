var express = require("express");
var request = require("request");
var port = process.env.PORT || 8080;
var app = express();


app.get('/:queryParam?/:offset?',function(req,res){
    if (req.params.queryParam!= undefined || req.params.queryParam != null) {
        var authTokenRequest = {
            url:'https://api.imgur.com/3/gallery/search?q='+req.params.queryParam+'&q_type=jpg',
            headers:{
                "Authorization":"Client-ID "+process.env.client_id
            }
        };
        request(authTokenRequest,function(error,response,body){
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                var targetData =[];
                for (var i = 0; i < info.data.length; i++) {
                    if(info.data[i].link.indexOf('.jpg')!= -1)
                    targetData.push({title:info.data[i].title,link:info.data[i].link});
                }
                if(req.params.offset!= undefined || req.params.offset!=null){
                    if(targetData.length>=req.params.offset)
                    targetData=targetData.slice(0,req.params.offset);
                }
                res.send(targetData);
              }
        });
    }else{
        res.send({error:"enter a search param in the format : https://aqueous-chamber-90195.herokuapp.com/{query - required}/{offset - optional}"});
    }
});

app.listen(port,function(){
    console.log("something is happening at https://aqueous-chamber-90195.herokuapp.com ");
});
