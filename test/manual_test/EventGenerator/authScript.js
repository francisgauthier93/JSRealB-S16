      var CLIENT_ID = "412269236550-ccp971q3qlv6nhv39b4fqrltrgikin23.apps.googleusercontent.com";

      var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
      //document.getElementById("signout-button").style.display='none';

      /**
       * Check if current user has authorized this application.
       */
      function checkAuth() {
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          loadCalendarApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }
      // function onSignIn(googleUser) {
      //    var profile = googleUser.getBasicProfile();
      //    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
      //    console.log('Name: ' + profile.getName());
      //    console.log('Image URL: ' + profile.getImageUrl());
      //    console.log('Email: ' + profile.getEmail());
      // }

      /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        //document.getElementById("signout-button").style.display='inline';
        loadLanguage("./","fr",function(){
          gapi.client.load('calendar', 'v3', loadPersonalCalendar);
        });
      }

      function signOut(event){
        var auth1=gapi.auth.getAuthInstance();
        auth1.signOut();
        console.log("user signed out");
        var authorizeDiv = document.getElementById('authorize-div');
        authorizeDiv.style.display ='inline';
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function loadPersonalCalendar() {

        //test JSON
        console.log(JSrealB.Config.get("lexicon"));
        console.log(JSrealB.Config.get("db"));

        $("#NW").show();
        var request2 = gapi.client.calendar.calendarList.list({
        });
        request2.execute(function(resp){
          var listCal= resp.items;
          var i;
          for(i=0;i<listCal.length;i++){
            if(listCal[i].primary){
              var frame=document.getElementById("calendarFrame");


              frame.innerHTML = '<iframe src=https://calendar.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src='+listCal[i].id+'&amp;color=%232952A3&amp;ctz=Pacific%2FNiue" style="border-width:0" width="800" height="600" frameborder="0" scrolling="no"></iframe>';
            }
          }
        });
        loadIncomingEvents("f");
        loadIncomingEvents("i");
      }

      function loadIncomingEvents(t){

        var request=gapi.client.calendar.calendarList.list({
        });
        request.execute(function(resp){
          var listCal= resp.items;

          var h3=document.createElement("h3");
          h3.appendChild(document.createTextNode(t=="f"?"Événements à venir\n":"Événements passés"));
          document.getElementById(t=="f"?"outputNext":"outputPast").appendChild(h3);
          console.log("temps : "+t);

          for(var i=0;i<listCal.length;i++){
            if(listCal[i].accessRole=="owner"){
                var calenderI=listCal[i].id;
                console.log("newDate: "+(new Date()).toISOString());
                console.log("newDate: "+(new Date("2000","01","01")).toISOString());
                var request3 = gapi.client.calendar.events.list({
                  "calendarId":calenderI,
                  "singleEvents":true,
                  "orderBy": "startTime",
                  "timeMin": t=="f"?(new Date()).toISOString():(new Date("2000","01","01")).toISOString(),
                  "timeMax": t=="i"?(new Date()).toISOString():(new Date(2050,01,01)).toISOString(),
                  "maxResults":20 
                });
                request3.execute(function(resp){
                  var events = resp.items;
                  for(var i=0;i<events.length;i++){
                    
                    outputEvent(events[i],t);

                  }
                })
            }
          }
        });
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message,temps,nextWeek) {
        if(nextWeek){
          var pre = document.getElementById("outputNW");
          console.log("gothere")

        }
        else{
          var pre = document.getElementById(temps=="f"?"outputNext":"outputPast");
        }
        var para= document.createElement("P");
        var textContent = document.createTextNode(message+"\n");
        para.appendChild(textContent);
        //pre.appendChild(para.appendChild(textContent));
        pre.appendChild(para);
      }

      function compareDate(dateP,date2){
      if(dateP > date2){return "i";}
      else if(dateP.getDate()==date2.getDate()||dateP.getMonth()==date2.getMonth()){
      return "p"; 
      }
      else{return "f"};   
      }

      function outputEvent(event,temps){
        try{
          if(event.summary=="undefined"){
          console.log("Couldn't find summary for an event:"+err);
          }
          else if(event.start.dateTime=="undefined"){
            console.log("Couldn't find date for an event:"+err);
            appendPre(event.summary);
          }
          else{
            var d=event.start.dateTime;
            var dateEv = DT(d);
            var nextWeek;
            if((new Date(d) - new Date())<60*60*24*7*1000 && (new Date(d) - new Date())>0){
              nextWeek=true;
            }
            else{nextWeek=false;}
            //console.log("sub:"+(new Date(d) - new Date()))//dateEv - DT(new Date())))
            appendPre(S(dateEv,VP(V("avoir").t(temps),NP(N("lieu").n("s")),NP(D("ce"),N("événement").a(":"))),event.summary),temps,nextWeek);
          }
        }
        catch(err){
          console.log("Could not access some info for an event: "+err);
        }        
      }

