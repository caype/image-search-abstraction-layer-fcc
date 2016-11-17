var express = require("express");
var request = require("request");
var mongoClient = require('mongodb');
var port = process.env.PORT || 8080;
var app = express();
const mongoDBUrl = process.env.MONGOLAB_URI;

app.get('/recentSearches/all',function(req,res) {
   mongoClient.connect(mongoDBUrl,function(err,db){
       if(err) throw err;
       var recentSearchTable = db.collection('imageAbstractionRecentSearches');
       recentSearchTable.find({}).toArray(function(err,searchResults){
           if(err) throw err;

           if(searchResults.length>0)
           res.send(searchResults);
           else
           res.send({result:'Nothing Found!'});
       });
   }) ;
});

app.get('/:queryParam?/:offset?',function(req,res){
    
    var targetData=[];
    var resultantData=[];
    var dateObj = new Date();
    var datetimeNow = dateObj.getDate()+'/'+dateObj.getMonth()+1+'/'+dateObj.getFullYear()+' '+dateObj.getHours()+":"+dateObj.getMinutes()+":"+dateObj.getSeconds();
    
    if (req.params.queryParam!= undefined || req.params.queryParam != null) {
        var jpgUrl = {
            url:'https://api.imgur.com/3/gallery/search/top/?q='+req.params.queryParam,
            headers:{
                "Authorization":"Client-ID "+process.env.client_id
            }
        };
        
        request(jpgUrl,function(error,response,body){
            if(error) throw error;
            
            if (!error && response.statusCode == 200) {
                var imginfo = JSON.parse(body);

                for (var i = 0; i <  imginfo.data.length; i++) {
                    if( imginfo.data[i].link.indexOf('.jpg')!= -1 || imginfo.data[i].link.indexOf('.png')!= -1 || imginfo.data[i].link.indexOf('.gif')!= -1)
                    targetData.push({title: imginfo.data[i].title,link: imginfo.data[i].link,size:imginfo.data[i].size,type:imginfo.data[i].type});
                }
                
                mongoClient.connect(mongoDBUrl,function(err,db){
                    if(err) throw err;
                    var targetTable = db.collection('imageAbstractionRecentSearches');
                    if(req.params.queryParam !='favicon.ico'){
                        var recordToInsert={searchTerm:req.params.queryParam,timestamp:datetimeNow};
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

