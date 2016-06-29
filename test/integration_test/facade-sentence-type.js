JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "Sentence types FR", function( assert ) {
    	assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))), "Le chat mange la souris.", "Phrase simple, sans option");
    	assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ({exc:true}), "Le chat mange la souris!", "Phrase exclamative");
    	assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ({int:true}), "Est-ce que le chat mange la souris?", "Phrase interrogative (oui/non)");
        assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ({int:true,exc:true}), "Est-ce que le chat mange la souris?!", "Phrase interrogative (oui/non) + exclamative");
        assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ({int:'yon'}), "Est-ce que le chat mange la souris?", "Phrase interrogative (oui/non)");
    	assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ({int:'wos'}), "Qui est-ce qui mange la souris?", "Phrase interrogative (sujet)");
        assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ({int:'wod'}), "Qui est-ce que le chat mange?", "Phrase interrogative (object direct-qui)");
        assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")),PP(P("à"),NP(D("le"),N("maison"))))).typ({int:'woi'}), "À qui est-ce que le chat mange la souris?", "Phrase interrogative (objet indirect-qui)");
        assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ({int:'wad'}), "Qu'est-ce que le chat mange?", "Phrase interrogative (object direct-quoi)");
        assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ({int:'whe'}), "Où est-ce que le chat mange la souris?", "Phrase interrogative (où)");
        assert.equal(S(NP(D("le"),N("chat")),VP(V("manger").t("p"),NP(D("le"),N("souris")))).typ({int:'how'}), "Comment est-ce que le chat mange la souris?", "Phrase interrogative (comment)");
    });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "Sentence types EN", function( assert ) {
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))), "The cat eats the mouse.", "Simple sentence, no option");
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ({exc:false,int:false}), "The cat eats the mouse.", "Declarative sentence");   
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ({exc:true}), "The cat eats the mouse!", "Exclamative sentence");   
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ({int:true}), "Does the cat eat the mouse?", "Interrogative sentence"); 
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ({int:'wos'}), "Who eats the mouse?", "Interrogative sentence (subject-who)");
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ({int:'wod'}), "Who does the cat eat?", "Interrogative sentence (direct object-who)");
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ({int:'wad'}), "What does the cat eat?", "Interrogative sentence (direct object-what)");               
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")),PP(P("to"),NP(D("my"),N("family"))))).typ({int:'woi'}), "To who does the cat eat the mouse?", "Interrogative sentence (indirect object-who)");
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ({int:'whe'}), "Where does the cat eat the mouse?", "Interrogative sentence (where)");               
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("p"),NP(D("the"),N("mouse")))).typ({int:'how'}), "How does the cat eat the mouse?", "Interrogative sentence (how)");                                                         
            
        });
    });
});