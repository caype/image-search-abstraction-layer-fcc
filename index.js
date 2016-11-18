var express = require("express");
var request = require("request");
var mongoClient = require('mongodb');
var port = process.env.PORT || 8080;
var app = express();
const mongoDBUrl = process.env.MONGOLAB_URI;

app.get('/recentSearches',function(req,res) {
   mongoClient.connect(mongoDBUrl,function(err,db){
       if(err) throw err;
       var recentSearchTable = db.collection('imageAbstractionRecentSearches');
       recentSearchTable.find().sort({_id:-1}).limit(20).toArray(function(err,searchResults){
           if(err) throw err;

           if(searchResults.length>0)
           res.send(searchResults);
           else
           res.send({result:'Nothing Found!'});
       });
   }) ;
});

app.get('/delete',function(req,res){
       mongoClient.connect(mongoDBUrl,function(err,db){
           if(err) throw err;
        var tableToRemove = db.collection('imageAbstractionRecentSearches');
        tableToRemove.remove({},function(err,resu) {
                if(err) throw err;
                res.send(resu);
            });
    }); 
});

app.get('/:queryParam*?/:offset*?',function(req,res){
    
    var targetData=[];
    var dateObj = new Date().getTime();
    
    if (req.params.queryParam!= undefined || req.params.queryParam != null) {
        var RequestUrl = {
            url:'https://api.imgur.com/3/gallery/search/top?q='+req.params.queryParam,
            headers:{
                "Authorization":"Client-ID "+process.env.client_id
            }
        };
        
        request(RequestUrl,function(error,response,body){
            if(error) throw error;
            
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);

                for (var i = 0; i < info.data.length; i++) {
                    if(info.data[i].link.indexOf('.jpg')!= -1 || info.data[i].link.indexOf('.png')!= -1 || info.data[i].link.indexOf('.gif')!= -1)
                    targetData.push({title:info.data[i].title,link:info.data[i].link});
                }
                    /*
                    if(req.params.offset!= undefined || req.params.offset!=null){
                        if(targetData.length>=10*req.params.offset){
                            var fval = req.params.offset==1?0:req.params.offset-1;
                            targetData=targetData.slice(10*fval,10*req.params.offset);    
                        }
                    }
                    */
                    
                mongoClient.connect(mongoDBUrl,function(err,db){
                    if(err) throw err;
                    var targetTable = db.collection('imageAbstractionRecentSearches');
                    if (req.params.queryParam != 'favicon.ico') {
                        var recordToInsert={searchTerm:req.params.queryParam,timestamp:dateObj};
                        targetTable.insert([recordToInsert],function(err,insertedRecord){
                            if(err) throw err;
                            res.send(targetData);
                        });   
                    }
                });
              }
        });
        
    }else{
        res.send({error:"enter a search param in the format : https://aqueous-chamber-90195.herokuapp.com/{query - required}/{offset - optional}"});
    }
});


app.listen(port,function(){
    console.log("something is happening at https://aqueous-chamber-90195.herokuapp.com ");
});
