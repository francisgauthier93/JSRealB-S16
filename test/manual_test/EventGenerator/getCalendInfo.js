$(document).ready(function(){
    
	function getCalendar(){
	    try {
	        var cal = $.parseIcs("http://localhost:8000/Calendar.ics");
	        //var cal =$.parseIcs("https://calendar.google.com/calendar/ical/ea0ig2m73k4a9gjb6p4nc4jsj0%40group.calendar.google.com/public/basic.ics");
	        // show the the description of the first event
	        //console.log(cal.event[0].description[0].value);
	        } catch (err) {
	        alert(err);
	        }
	    console.log(cal);
	    //$("h3").html(cal.event[0].summary[0].value);
	    
		
		function compareDate(dateP,date2){
			if(dateP > date2){return "i";}
			else if(dateP.getDate()==date2.getDate()||dateP.getMonth()==date2.getMonth()){
			return "p";	
			}
			else{return "f"};		
		}

		var numToMois={"01":"janvier","02":"février","03":"mars","04":"avril","05":"mai","06":"juin","07":"juillet","08":"août","09":"septembre","10":"octobre","11":"novembre","12":"décembre"};

	    var i;
	    console.log("date AJD"+new Date());
	    for(i=0;i<cal.event.length;i++){
	    	var dateICS = cal.event[i].dtstart[0].value;
	    	console.log("date event:"+new Date(dateICS.substring(0,4),dateICS.substring(4,6),dateICS.substring(6,8)));
	        var temps= compareDate(new Date(),new Date(dateICS.substring(0,4),dateICS.substring(4,6),dateICS.substring(6,8)));
	    	var presentation = S(
					    cal.event[i].summary[0].value,
					    VP(V("avoir").t(temps),NP(N("lieu").n("s")),D("le"),dateICS.substring(6,8),numToMois[dateICS.substring(4,6)],dateICS.substring(0,4),PP(P("à"),NP(D("le"),N("salon"))))
					).a('.');
	    	console.log(temps);

	    	var $events = $("#events");
	    	$events.append("<p>"+presentation+"</p>");
	    }

	}

	
    // var createCORSRequest = function(method, url) {
    //     var xhr = new XMLHttpRequest();
    //     if ("withCredentials" in xhr) { // XHR for Chrome/Firefox/Opera/Safari.
    //         xhr.open(method, url, true);
    //     } else if (typeof XDomainRequest !== "undefined") { // XDomainRequest for IE.
    //         xhr = new XDomainRequest();
    //         xhr.open(method, url);
    //     } else {
    //         xhr = null; // CORS not supported.
    //     }
    //     return xhr;
    // }
    
    // var httpGetRequest = function(url) {

    //     var request = createCORSRequest("GET", url);
    //     if (!request) {
    //         alert('HTTP Get Request not supported');
    //         return;
    //     }
    //     if (request){
    // 		request.onload = function() {
    //     // ...
    // 		};
    //     request.onreadystatechange = function() {};
    //     request.send(null);
    // 	}
    // }

	// var uCal=httpGetRequest("https://calendar.google.com/calendar/ical/ea0ig2m73k4a9gjb6p4nc4jsj0%40group.calendar.google.com/public/basic.ics",alert("success"),alert("fail"));
	// console.log(uCal);

    loadLanguage("./","fr",getCalendar);

 });