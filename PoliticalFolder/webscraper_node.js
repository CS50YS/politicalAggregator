const http = require('http');
const request = require('request');
const cheerio = require('cheerio');
const $ = require('jquery');
// https://github.com/IonicaBizau/node-ipinfo
const ipInfo = require("ipinfo");

var body;
var parsedData;
var NewsSites = {"Fox News": ["New York","Both",[18,29],"Republican"], 
                 "Huffington Post": ["New York","Both",[18,34],"Democrat"], 
                 "MSNBC": ["New York","Female",[50,64],"Democrat"], 
                 "NBC News": ["New York","Both",[18,49],"Democrat"], 
                 "CNN": ["Georgia","Both",[30,49],"Democrat"], 
                 "NPR": ["Maryland","Both",[30,49],"Other"], 
                 "The New York Times": ["New York","Both",[18,29],"Democrat"], 
                 "The Wall Street Journal": ["New York","Male",[30,49],"Republican"], 
                 "The New Yorker": ["New York","Both",[30,49],"Democrat"],
                 "Breitbart News": ["California","",[18,34],"Republican"], 
                 "Washington Post": ["Maryland","Both",[25,34],"Democrat"], 
                 "ABC": ["New York","Both",[18,49],"Other"], 
                 "CBS": ["New York","Both",[18,49],"Other"]
                };
var scraped;
function scraping(req, res, name_arr)
{
    var foxnewsarray = [];
    var huffingtonnewsarray = [];
    request('https://www.foxnews.com/politics', function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            for(var i = 0; i < 3; i++)
            {
                foxnewsarray.push([
                    $('.article')[i].children[1].children[0].children[1].children[0].children[0].data,
                    $('.article')[i].children[1].children[1].children[0].children[0].children[0].data,
                    ("https://www.foxnews.com"+$('.article')[i].children[1].children[1].children[0].children[0].attribs.href)
                ]);
            }
            sendBack(req, res, foxnewsarray);
        }
    });
    /*request('https://www.huffingtonpost.com/section/politics', function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            for(var i = 0; i < 3; i++)
            {
                //console.log($(".zone__content")[1].children[i]);
                huffingtonnewsarray.push([
                    $('.zone__content')[1].children[0].children[0].children[1].children[0].children[0].children[0],
                    $('.zone__content').children[1].children[1].children[0].children[0].children[0].data
                ]);
            }
            for(var j in $(".zone__content")[1].children)
            {
                console.log(j);
            }
            console.log($(".zone__content")[1].children[25].innerHTML);
            //console.log($(".zone__content")[1].children[0]);
        }
    });*/
}

var server = http.createServer().listen(8080);
server.on('request', function(req,res){
    if(req.method == 'POST')
    {
        body = "";
    }
    req.on('data', function(data){
        if(req.method == 'POST')
        {
            body+=data;
        }
    });
    req.on('end', function(){
        console.log(body);
        parsedData = JSON.parse(body);
        getLocation(getClientIp(req), req, res);
    });
});

function sendBack(req, res, sendBack)
{
    console.log("hi");
    res.writeHead(200, {'Content-Type': 'text/plain',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST'});
    //write some data back inside res.write
    console.log(sendBack);
    res.write(JSON.stringify(sendBack));
    res.end();
}

//IPADDRESS is a string; call with getLocation(*ip*);
function getLocation(IPADDRESS, req, res){
    ipInfo("104.207.193.226", (err, cLoc) => {
        if(!err)
        {
            continueProcessing(req, res, cLoc.region.toString());
        }
        // Ex:
        // { ip: '8.8.8.8',
        //   hostname: 'google-public-dns-a.google.com',
        //   city: 'Mountain View',
        //   region: 'California',
        //   country: 'US',
        //   loc: '37.3845,-122.0881',
        //   org: 'AS15169 Google Inc.',
        //   postal: '94040' }
    });
}

function continueProcessing(req, res, region)
{
    var byState = [];
    var byGender = [];
    var byAge = [];
    var byParty = [];
    for (var key in NewsSites)
    {
        if(NewsSites[key][0] !== region)
        {
            byState.push(key);
        }
        if(NewsSites[key][1] !== parsedData.Gender) //parsed.something = *gender*
        {
            byGender.push(key);
        }
        if(!((NewsSites[key][2][0] <= parsedData.Age)&&(NewsSites[key][2][1] >= parsedData.Age)))
        {
            byAge.push(key);
        }
        if(NewsSites[key][3] !== parsedData.Party)
        {
           byParty.push(key);
        }
    }
    var combined = byState.concat(byGender.concat(byAge.concat(byParty)));
    scraping(req, res, combined)
    //sendBack(req, res, sendBack, {"State": byState, "Gender": byGender, "Age": byAge, "Party": byParty});
}

function getClientIp(req) {
  var ipAddress;
  // The request may be forwarded from local web server.
  var forwardedIpsStr = req.headers['x-forwarded-for']; 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // If request was not forwarded
    ipAddress = req.connection.remoteAddress;
  }
  console.log(ipAddress);
  return ipAddress;
};