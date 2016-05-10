      var CLIENT_ID = "412269236550-ccp971q3qlv6nhv39b4fqrltrgikin23.apps.googleusercontent.com";

      var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

      var data;
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
       /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        //document.getElementById("signout-button").style.display='inline';
        loadLanguage("./","fr",function(){
          gapi.client.load('calendar', 'v3', loadPersonalCalendar);
          //load the data base into the web storage
          data = getJsonDB();
          //update lexicon 
          var database = JSON.parse(localStorage.getItem("db"));
          for(organisateur in database.org){
            var orgName = database.org[organisateur].prenom;
            orgName = orgName.replace(/N\(\"(.*?)\"\)/,"$1");
            //orgName = orgName.replace(/[\"\(\)]/g,"");
            console.log(orgName)
            if(!JSrealB.Config.get("lexicon")[orgName]){
              //ajout des personnes manquantes
              console.log(JSrealB.Config.get("lexicon"))
              var genre = database.org[organisateur].genre;
              JSrealB.Config.get("lexicon")[orgName]= {"N":{"g":genre,"tab":["nI"]}};
            }
          }
        });
      }

      function signOut(event){
        var auth1=gapi.auth.getAuthInstance();
        auth1.signOut();
        console.log("user signed out");
        var authorizeDiv = document.getElementById('authorize-div');
        authorizeDiv.style.display ='inline';
      }

      function loadPersonalCalendar() {

        $("#NW").show();
        var request2 = gapi.client.calendar.calendarList.list({
        });
        request2.execute(function(resp){
          var listCal= resp.items;
          var frame=document.getElementById("calendarFrame");

            //changer la prochaine ligne pour le calenderId de l'AEDIROUM, une fois qu'on en aura un

          frame.innerHTML = '<iframe src=https://calendar.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=ea0ig2m73k4a9gjb6p4nc4jsj0@group.calendar.google.com&amp;color=%232952A3&amp;ctz=Pacific%2FNiue" style="border-width:0" width="800" height="500" frameborder="0" scrolling="no"></iframe>';

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

          for(var i=0;i<listCal.length;i++){
            if(listCal[i].accessRole=="owner"){
                var calenderI=listCal[i].id;

                //Regarder seulement le calendrier public de l'aediroum, à changer aussi ultérieurement
                if(calenderI=="ea0ig2m73k4a9gjb6p4nc4jsj0@group.calendar.google.com"){
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
          }

        });
      }

       //À corriger pour avoir un meilleur layout
      function appendPre(message,temps,nextWeek) {
        if(nextWeek){
          var pre = document.getElementById("outputNW");
        }
        else{
          var pre = document.getElementById(temps=="f"?"outputNext":"outputPast");
        }
        var para= document.createElement("P");
        para.setAttribute('style','margin: 3px;');
        para.innerHTML = message;
        pre.appendChild(para);
      }

      function outputEvent(event,temps){
        
        if(event.description==undefined){
          lesserOutputEvent(event,temps);
        }
        else{
          try{
            eventObj = createEvent(event.description);
            console.log(eventObj);
            var phrase1 =S(DT(event.start.dateTime).dOpt({day: false, hour: false, minute: false,seconde: false}).a(","),
                          (eval(eventObj.org.prenom))/**/.tag("span",{"data-toggle":"tooltip", "title": getOrgInfo(eventObj.org), "data-placement":"top"})/**/,
                          VP(V("organiser").t(temps),eval(eventObj.type)));
            if(temps=="i"){
              var action =VP(Pro("je").g(eventObj.org.genre).pe(3),V("être").t("i"));
            }
            else{
              var action =VP(V("rejoindre").t("ip").pe(2).n("p").a("-"),D("le").g(eventObj.org.genre));
              console.log('lexicon');
              console.log(JSrealB.Config.get("lexicon"));
            }
              var phrase2 = S(action,
              PP(P("à"),(eval(eventObj.lieu.nom))/**/.tag("span",{"data-toggle":"tooltip", "title":getLocInfo(eventObj.lieu), "data-placement":"top"})/**/),
              PP(P("entre"),CP(C("et"),DT(event.start.dateTime).dOpt({year: false, month: false, date: false, day: false, second: false,nat:false}),
              DT(event.end.dateTime).dOpt({year: false, month: false, date: false, day: false, second: false,nat:false}))));
            //Problème d'élision ... +problème d'espacement après le tire

            var nextWeek;
            if((new Date(event.start.dateTime) - new Date())<60*60*24*7*1000 && (new Date(event.start.dateTime) - new Date())>0){
              nextWeek=true;
            }
            else{nextWeek=false;}

            //avec reservation
            if(eventObj.resv == 't'){
              JSrealB.Config.get("lexicon")["réservation"] = {"N":{"g":"f","tab":["n17"]}};
              var phrase3 = S(NP(D("un"),N("réservation")),VP(V("être").t("p"),AP(A("nécessaire"))),AdvP(Adv("auprès"),PP(P("de"),
                NP(eval(eventObj.org.prenom)/**/.tag("span",{"data-toggle":"tooltip", "title":getOrgInfo(eventObj.org), "data-placement":"top"})/**/))));
              phrase2 += " "+phrase3;
            }
            
            appendPre(phrase1+" "+phrase2,temps,nextWeek);
          }
          catch(e){
            console.log("Could not create the sentence correctly: "+e+", event description: "+event.description)
            //L'événement n'est pas dans le format requis. Cette implémentation est assez rigide. Faudra voir pour la rendre plus souple
            lesserOutputEvent(event,temps);
          }
        }     
      }

      function lesserOutputEvent(event,temps){
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







