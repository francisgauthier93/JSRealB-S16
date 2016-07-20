JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() 
    {
        QUnit.test( "Elision FR", function( assert ) {
        	assert.equal(S(NP(D("le"),N("élève"),A("aimable")),VP(V("écrire"),PP(P("sur"),NP(D("le"),N("ardoise"))))), "L'élève aimable écrit sur l'ardoise.", "L'élève aimable écrit sur l'ardoise.");
            assert.equal(S(Pro("je").pe(1),VP(Pro("me").pe(2),V("aimer"),PP(P("pour"),NP(D("le"),N("éternité"))))), "Je t'aime pour l'éternité.", "Je t'aime pour l'éternité.");
            assert.equal(S(Pro("ce"),VP(V("être").vOpt({neg:true}),NP(D("un"),N("examen")),PP(P("de"),NP(N("école"))),AdvP(Adv("très"),A("aisé"),PP(P("à"),V("réussir").t("b"),PP(P("de"),NP(D("le"),N("coup"),A("premier"))))))),
             "Ce n'est pas un examen d'école très aisé à réussir du premier coup.", "Ce n'est pas un examen d'école très aisé à réussir du premier coup.");
            assert.equal(S(Pro("que"),Pro("je").pe(1),VP(V("aimer"),CP(C("et"),PP(P("à"),VP(V("faire").t("b"),NP(D("ce"),N("exercice")))),VP(V("voir").t("b"),NP(D("ce"),N("chien")))))),
             "Que j'aime à faire cet exercice et voir ce chien.","Que j'aime à faire cet exercice et voir ce chien.");
            assert.equal(S(Pro("que"),Pro("je"),VP(V("aimer"),VP(V("avoir").t("b"),PP(P("de"),NP(D("le"),N("exercice")))))), "Qu'il aime avoir de l'exercice.", "Qu'il aime avoir de l'exercice.");
            assert.equal(S(CP(C("et"),NP(D("le"),N("église")),NP(D("le"),N("ami").g("f")),NP(D("mon"),N("ami").g("f")))), "L'église, l'amie et son amie.", "L'église, l'amie et son amie.");
            assert.equal(S("quoique",Pro("je").pe(3),VP(V("faire").t("s"),A("beau"))), "Quoiqu'il fasse beau.", "Quoiqu'il fasse beau.");
            assert.equal(S(NP(D("le"),N("élève")),VP(Pro("me").pe(1),V("dire").t("pc"),PP(P("de"),VP(V("interroger").t("b"),NP(D("le"),N("fille")).pro())))),
                "L'élève m'a dit de l'interroger.","L'élève m'a dit de l'interroger.");
            assert.equal(S(CP(C("et"),S(NP(D("le"),N("histoire")),VP(V("être"),NP(D("un"),N("épreuve")))),
                        S(NP(D("le"),N("homme")),VP(V("respecter").vOpt({neg:'plus'}),NP(D("le"),N("nature")))))),
            "L'histoire est une épreuve et l'homme ne respecte plus la nature.","L'histoire est une épreuve et l'homme ne respecte plus la nature.");
            assert.equal(S(CP(C("et"),NP(D("mon"),N("ami").g("f")),NP(D("ce"),A("honnête").pos("pre"),N("père"))),VP(V("entrer").t("pc"),PP(P("avec"),NP(D("le"),N("armoire"))))),
                "Son amie et cet honnête père sont entrés avec l'armoire.","Son amie et cet honnête père sont entrés avec l'armoire.");
            assert.equal(S(Pro("je"),VP("se",V("adresser").t("ps"),PP(P("à"),NP(D("le"),N("homme"))),PP(P("à"),NP(D("le"),N("porte"),PP(P("de"),NP(D("ce"),A("ancien").pos("pre"),N("château"))))))),
                "Il s'adressa à l'homme à la porte de cet ancien château.","Il s'adressa à l'homme à la porte de cet ancien château.");
            
            assert.equal(S(Pro("ce"),VP(V("être"),PP(P("de"),NP(D("le"),N("affection"),SP(Pro("dont"),NP(D("ce"),N("enfant")),VP(V("avoir"),N("besoin"))))))),
                "C'est de l'affection dont cet enfant a besoin.","C'est de l'affection dont cet enfant a besoin.");
            assert.equal(S(NP(D("le"),N("hirondelle")),VP(Pro("me").pe(1),V("honorer").a(","),
                "mais",Pro("me").pe(1),V("amener"),CP(C("et"),PP(P("à"),NP(D("le"),N("hôpital"))),PP(P("à"),NP(D("le"),N("hibou")))))),
                "L'hirondelle m'honore, mais m'amène à l'hôpital et au hibou.","L'hirondelle m'honore, mais m'amène à l'hôpital et au hibou.");


            assert.equal(S(NP(D("le"),N("élève")),VP(Pro("me").pe(1),V("dire").t("pc"),PP(P("de"),VP(Adv("ne"),Adv("pas"),V("interroger").t("b"),NP(D("le"),N("fille")).pro())))),
            "L'élève m'a dit de ne pas l'interroger.","L'élève m'a dit de ne pas l'interroger.");
//Les prochains tests ne fonctionnent pas...
            // assert.equal(S(NP(D("le"),N("élève")),VP(Pro("me").pe(1),V("dire").t("pc"),PP(P("de"),VP(V("interroger").vOpt({neg:true}),NP(D("le"),N("fille")).pro())))),
            // "L'élève m'a dit de ne pas l'interroger.","L'élève m'a dit de ne pas l'interroger."); //Ne fonctionne pas encore, mais ce n'est pas une erreur d'élision.
        });
    }
);