/**
 * 
 */
$(document).ready(function(){
	$("#creation").hide();
	
	var e = {"nom":"Vin et Fromage des cycles supérieurs",
		     "respos":[{"nom" : "Francis Gauthier",
		                "mail" :"francis.gauthier.2@umontreal.ca"},
		                {"nom": "Stéphanie Larocque",
		    	        "mail": "stephanie.larocque@umontreal.ca"}],
		       "org": {"nom" : "AEDIROUM",
		    	       "mail" : "aediroum@iro.umontreal.ca"},
		       "date" : "2016-04-28T18:30:00",
		       "lieu" : "Salon Maurice-Labbé",
		       "payant" : true,
		       "prix" : {"Étudiant" : 10,
		    	         "Invité" : 15,
		    	         "Professeur/Autre" : 20 },
		       "reserv" : true};
	//var ev = JSON.parse(e);

	var date = new Date();
	
	function compareDate(dateP,date2){
		if(dateP > date2){return "i";}
		else if(dateP.getDate()==date2.getDate()||dateP.getMonth()==date2.getMonth()){
		return "p";	
		}
		else{return "f"};		
	}
	
	var nouvelEvent={};
	
	function getEnteredValues(){
		nouvelEvent.nom= $("#nomEv").val();
	}
	
	$("#creer").click(function(){
		//console.log(ev.nom)
		$("#creation").slideToggle(400);
		
		function getTexte(){
			//Savoir si l'évévement est futur ou passé
			var temps;
			var dateE = new Date(e.date);
			//if(date <  dateE){temps="f";}
			//else if(date.getDay()==dateE.getDay()){temps="p";}
			//else{temps="i"}
			temps=compareDate(date,dateE);
			
			var $body = $("body");
			var presentation = S(
				    NP(D("ce"),N("soirée")),
				    VP(V("avoir").t(temps),NP(N("lieu").n("s")),PP(P("à"),NP(D("le"),N("salon"))))
				).a('.');
			var texte2= S(NP(N(e.respos[0].nom)),VP(V("organiser").t(temps),NP(D("le"),N("soirée"))))
			$body.append("<p>"+presentation+"</p>");
			$body.append("<p>"+texte2+"</p>");
			$body.append("<p>"+"Date :"+nouvelEvent.nom+"</p>");
		}
		
		loadLanguage("./","fr",getTexte)
	})
	
	$("#submit").click(function(){
		getEnteredValues();
	})

	
});