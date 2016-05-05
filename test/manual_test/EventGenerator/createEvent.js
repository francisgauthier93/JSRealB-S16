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

	return {
	"type" : {
		"bc" : NP(D("le").n("s"),CP(C("et"),N("beigne"),N("café"))),
		"lb" : NP(D("le").n("s"),CP(C("et"),N("lait"),N("biscuit").n("p"))),//"le lait et biscuit",
		"57" : NP(D("un"),N("5 à 7")),//"un 5 à 7",
		"js" : NP(D("un"),N("6 à 10").a(":"),NP(N("jeu").n("p"),PP(P("de"),N("société")))),//"6 à 10: jeux de société",
		"vf" : NP(D("le").n("s"),CP(C("et"),N("vin"),N("fromage").n("p"))),//"le vin et fromages",
		"ca" : NP(D("un"),N("conseil"),PP(P("de"),N("administration"))),//"un conseil d'administration",
		"ag" : NP(D("un"),N("assemblée"),A("général")),//"une assemblée générale",
		"sp" : NP(D("un"),N("séance"),PP(P("de"),N("sport"))),
		"cb" : NP(D("le"),N("cabane"),PP(P("à"),N("sucre"))),//"cabane à sucre",
		"in" : NP(D("le"),N("journée"),PP(P("de"),NP(D("le"),N("initiation").n("p")))),//"journée de l'initiation",
		"mi" : NP(D("un"),N("Mi-Diro"))//"mi-Diro"
	},
	"org" : {
		"fg" : {
			"prenom" : N("Francis"),
			"nom" : "Gauthier",
			"email" : "francis.gauthier.2@umontreal.ca",
			"genre" : "m"
		},
		"lj" : {
			"prenom" : "Laurent",
			"nom" : "Jakubina",
			"genre" : "m"
		},
		"sl" : {
			"prenom" : N("Stéphanie"),
			"nom" : "Larocque",
			"genre" : "f"
		}
	},
	"lieu" : {
		"sml" : {
			"nom" : NP(D("le"),N("salon"),A("Maurice-Labbé")),//"le salon Maurice-Labbé",
			"local" : NO(6000),
			"étage" : NO(6),
			"pavillon" : A("André-Aisenstadt")
		},
		"asso" : {
			"nom" : NP(D("le"),N("local"),PP(P("de"),D("le"),N("association"))),//"local de l'AÉDIROUM",
			"local" : "3190",
			"étage" : "3",
			"pavillon" : "André-Aisenstadt"
		},
		"cafe" : {
			"nom" : NP(D("le"),N("café"),A("Math-Info")),//"café Math-Info",
			"local" : "",
			"étage" : NO(1),
			"pavillon" : A("André-Aisenstadt")
		},
		"gym" :{
			"nom" : NP(D("le"),N("centre"),A("sportif"),A("CEPSUM").en("(")),
			"local" : "",
			"étage" : NO(1),
			"pavillon" : A("CEPSUM")
		} 
	} 

}

}

var db;

function createEvent(description){
var db = {};
//Devrait fonctionner. J'obtiens en sortie le feature, mais pas la db. Dans authCalendar, le même code me donne en sortie la db...

// loadLanguage("./","fr",function(){
//     console.log(JSrealB.Config.get("feature"));
//     var db = JSrealB.Config.get("db");
//     });

//à la place:
var db = getJsonDB();

var descSplit = description.toLowerCase().split("/");

var event = {};

if(descSplit.length < 3){throw "Not enough information for event creation: "+description;}

event.type = db.type[descSplit[0]];
event.org = db.org[descSplit[1]];
event.lieu = db.lieu[descSplit[2]];
event.resv = descSplit[3];
event.contact = descSplit[4];

return event;

}

function getOrgInfo(org){
	var string = eval(org.prenom)+" "+org.nom;
	console.log(org.email)
	if(org.email!=undefined){
		string = string+", contact: "+org.email;
	}
	return string;    
}

function getLocInfo(lieu){
	console.log(lieu)
	//fais planter le script
	var string = lieu.pavillon//lieu.nom;//eval(lieu.nom);
	if(lieu.étage!=undefined){
		string = string +", "+NP(lieu.étage,N("étage"));
	}
	return string;    
}



