//create an event from description (string) in format TT/OO/LL/BR/BC
function getJsonDB(){
	//ajouter les mots requis au lexique:
	JSrealB.Config.get("lexicon")["beigne"] = {"N":{"g":"m","tab":["n3"]}};
	JSrealB.Config.get("lexicon")["biscuit"] = {"N":{"g":"m","tab":["n3"]}};
	JSrealB.Config.get("lexicon")["5 à 7"] = {"N":{"g":"m","tab":["nI"]}};
	JSrealB.Config.get("lexicon")["6 à 10"] = {"N":{"g":"m","tab":["nI"]}};
	JSrealB.Config.get("lexicon")["Maurice-Labbé"] = {"A":{"tab":["nI"]}};
	JSrealB.Config.get("lexicon")["André-Aisenstadt"] = {"A":{"tab":["nI"]}};
	JSrealB.Config.get("lexicon")["CEPSUM"] = {"A":{"tab":["nI"]}};
	JSrealB.Config.get("lexicon")["assemblée"] = {"N":{"g":"f","tab":["n17"]}};
	JSrealB.Config.get("lexicon")["sportif"] = {"A":{"tab":["n46"]}};
	JSrealB.Config.get("lexicon")["association"] = {"N":{"g":"f","tab":["n17"]}};
	JSrealB.Config.get("lexicon")["initiation"] = {"N":{"g":"f","tab":["n17"]}};
	JSrealB.Config.get("lexicon")["Mi-Diro"] = {"N":{"tab":["nI"]}};
	JSrealB.Config.get("lexicon")["Math-Info"] = {"A":{"tab":["nI"]}};

	//Agenda
	JSrealB.Config.get("lexicon")["Stéphanie"] = {"N":{"g":"f","tab":["nI"]}};
	JSrealB.Config.get("lexicon")["Francis"] = {"N":{"g":"m","tab":["nI"]}};
	JSrealB.Config.get("lexicon")["Laurent"] = {"N":{"g":"m","tab":["nI"]}};

	//En format json
	var dataj={
	"type" : {
		"bc" : 'NP(D("le").n("s"),CP(C("et"),N("beigne"),N("café")))',
		"lb" : 'NP(D("le").n("s"),CP(C("et"),N("lait"),N("biscuit").n("p")))',
		"57" : 'NP(D("un"),N("5 à 7"))',
		"js" : 'NP(D("un"),N("6 à 10").a(":"),NP(N("jeu").n("p"),PP(P("de"),N("société"))))',
		"vf" : 'NP(D("le").n("s"),CP(C("et"),N("vin"),N("fromage").n("p")))',
		"ca" : 'NP(D("un"),N("conseil"),PP(P("de"),N("administration")))',
		"ag" : 'NP(D("un"),N("assemblée"),A("général"))',
		"sp" : 'NP(D("un"),N("séance"),PP(P("de"),N("sport")))',
		"cb" : 'NP(D("le"),N("cabane"),PP(P("à"),N("sucre")))',
		"in" : 'NP(D("le"),N("journée"),PP(P("de"),NP(D("le"),N("initiation").n("p"))))',
		"mi" : 'NP(D("un"),N("Mi-Diro"))'
	},
	"org" : {
		"fg" : {
			"prenom" : 'N("Francis")',
			"nom" : "Gauthier",
			"email" : "francis.gauthier.2@umontreal.ca",
			"genre" : "m"
		},
		"lj" : {
			"prenom" : 'N("Laurent")',
			"nom" : "Jakubina",
			"email" : "jakubinl@iro.umontreal.ca",
			"genre" : "m"
		},
		"sl" : {
			"prenom" : 'N("Stéphanie")',
			"nom" : "Larocque",
			"genre" : "f"
		}
	},
	"lieu" : {
		"sml" : {
			"nom" : 'NP(D("le"),N("salon"),A("Maurice-Labbé"))',
			"local" : 'NO(6000)',
			"étage" : "6e",
			"pavillon" : 'A("André-Aisenstadt")'
		},
		"asso" : {
			"nom" : 'NP(D("le"),N("local"),PP(P("de"),D("le"),N("association")))',
			"local" : "3190",
			"étage" : "3e",
			"pavillon" : 'A("André-Aisenstadt")'
		},
		"cafe" : {
			"nom" : 'NP(D("le"),N("café"),A("Math-Info"))',
			"étage" : "1er",
			"pavillon" : 'A("André-Aisenstadt")'
		},
		"gym" :{
			"nom" : 'NP(D("le"),N("centre"),A("sportif"),A("CEPSUM").en("("))',
			"local" : "",
			"étage" : "1er",
			"pavillon" : 'A("CEPSUM")'
		} 
	}
	}


	//put the data base in the local storage of the web page
	if(!localStorage.getItem("db")){
		localStorage.setItem("db", JSON.stringify(dataj));
	}
	//toujours aller chercher une nouvelle db (pour fin de déboguage)
	// localStorage.setItem("db", JSON.stringify(dataj));

	return data;
	}


function createEvent(description){

var db = JSON.parse(localStorage.getItem("db"));

var descSplit = description.toLowerCase().split("/");

var event = {};

if(descSplit.length < 3){throw "Not enough information for event creation: "+description;}
//à partir du local storage
event.type = db.type[descSplit[0]];
event.org = db.org[descSplit[1]];
event.lieu = db.lieu[descSplit[2]];
event.resv = descSplit[3];
event.contact = descSplit[4];

return event;

}

function getOrgInfo(org){
	var string = eval(org.prenom)+" "+org.nom;
	if(org.email!=undefined){
		string = string+", contact: "+org.email;
	}
	return string;    
}

function getLocInfo(lieu){
	//fais planter le script
	var string = "Pavillon: "+eval(lieu.pavillon)//lieu.nom;//eval(lieu.nom);
	if(lieu.étage!=undefined){
		string = string +", "+NP(lieu.étage,N("étage"));
	}
	if(lieu.local!=undefined && lieu.local!=""){
		string = string+", local: "+lieu.local;
	}
	return string;    
}

//function addNewName(prenom, nom, initiales, email="", genre="m"){

//}
function addNewName(){
	console.log("clicked");

	//loadLanguage("./","fr",function(){});
	var prenom = $("#prenomP").val();
	var nom = $("#nomP").val();
	var initiales = $("#iniP").val().toLowerCase();
	var email = $("#emailP").val();
	var genre = $('input[name="genreP"]:checked').val();
	console.log(genre);

	if(prenom=="" || nom == undefined){
		alert("Veuillez spécifier un prénom et un nom: "+prenom+nom)
	}
	else if(initiales == ""){
		alert("Les initiales doivent contenir au moins une lettre")
	}
	else if(JSON.parse(localStorage.getItem("db")).org[initiales]!=undefined){
		alert("Quelqu'un a déjà ces initiales, veuillez en choisir d'autre");
	}
	else{
		var p={
			"prenom" : 'N(\"'+prenom+'\")',
			"nom" : nom,
			"email" : email,
			"genre" : genre
		}
		//update local db
		var datab = JSON.parse(localStorage.getItem("db"));
		datab.org[initiales]=p;
		localStorage.setItem("db", JSON.stringify(datab));


		alert(prenom+" "+nom+" a bel et bien été ajouté.");

		//clear text boxes
		$("#prenomP").val("");
		$("#nomP").val("");
		$("#iniP").val("");
		$("#emailP").val("");
	}
}

function deleteName(){
	var initiales = $("#iniDelete").val();
	console.log(initiales);
	var orgName = JSON.parse(localStorage.getItem("db")).org[initiales].prenom
	orgName = orgName.replace(/N\(\"(.*?)\"\)/,"$1");
	alert(orgName+" "+JSON.parse(localStorage.getItem("db")).org[initiales].nom+" a été retiré de la base de données.");
	var datab = JSON.parse(localStorage.getItem("db"));
	delete datab.org[initiales];
	localStorage.setItem("db", JSON.stringify(datab));
}


