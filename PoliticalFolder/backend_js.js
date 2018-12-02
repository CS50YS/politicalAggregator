var xhttp = new XMLHttpRequest();

$(document).ready(function() {
    xhttp.onreadystatechange = function(){
        if(xhttp.readyState === 4)
        {
            var returned = xhttp.response;
            $("#news_feed").append(JSON.parse(returned)[0]);
            $("#news_feed").append(JSON.parse(returned)[1]);
            $("#news_feed").append(JSON.parse(returned)[2]);
        }
    };

    $('#submit_bttn').click(function(){
        let profile = {"Gender": "","Age": 0,"Party": ""};
        profile.Gender = $('#gender_dropdown').find(":selected").text();
        profile.Party = $('#part_dropdown').find(":selected").text();
        profile.Age = parseInt($('#age_field').val());
        if(profile.Age == NaN || profile.Age < 1 || profile.Age > 120)
        {
                throw "Invalid Age";
        }
        xhttp.open("POST","http://localhost:8080",true);
        xhttp.setRequestHeader("Content-Type","text/plain");
        xhttp.send(JSON.stringify(profile));
    }); 
});