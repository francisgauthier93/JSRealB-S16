JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "Sentence types FR", function( assert ) {
    	assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))), "Le chat mange la souris.", "Phrase simple, sans option");
    	assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ("dec"), "Le chat mange la souris.", "Phrase déclarative, avec option 'dec'");
    	assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ("exc"), "Le chat mange la souris!", "Phrase exclamative");
    	assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ("int"), "Est-ce que le chat mange la souris?", "Phrase interrogative (oui/non)");
    	//assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ("int"), "Qui mange la souris?", "Phrase interrogative (sujet)");

    });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "Sentence types EN", function( assert ) {
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))), "The cat eats the mouse.", "Simple sentence, no option");
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ("dec"), "The cat eats the mouse.", "Declarative sentence");   
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ("exc"), "The cat eats the mouse!", "Exclamative sentence");   
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ("int"), "Does the cat eat the mouse?", "Interrogative sentence");             
            
        });
    });
});