JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "Options de verbes FR", function( assert ) {
    	assert.equal(S(Pro("je"),VP(V("trouver"))), "Il trouve.", "Verbe simple, sans option"); //1
        assert.equal(S(Pro("je"),VP(V("trouver").t("pc"))), "Il a trouvé.", "Verbe composé, sans option");  //2
        assert.equal(S(Pro("je"),VP(V("trouver"))).typ({neg:true}), "Il ne trouve pas.", "Verbe simple, négatif");  //3
        assert.equal(S(Pro("je"),VP(V("trouver").t("pc"))).typ({neg:true}), "Il n'a pas trouvé.", "Verbe composé, négatif");  //4
        assert.equal(S(Pro("je"),VP(V("trouver"))).typ({pas:true}), "Est trouvé par lui.", "Verbe simple, passif");  //5
        assert.equal(S(Pro("je"),VP(V("trouver").t("pc"))).typ({pas:true}), "A été trouvé par lui.", "Verbe composé, passif");  //6
        assert.equal(S(Pro("je"),VP(V("trouver"))).typ({pas:true,neg:true}), "N'est pas trouvé par lui.", "Verbe simple, passif-négatif");  //7
        assert.equal(S(Pro("je"),VP(V("trouver").t("pc"))).typ({pas:true,neg:true}), "N'a pas été trouvé par lui.", "Verbe composé, passif-négatif");  //8
        assert.equal(S(Pro("je"),VP(V("trouver"))).typ({prog:true}), "Il est en train de trouver.", "Verbe simple, progressif"); //9
        assert.equal(S(Pro("je"),VP(V("trouver").t("pc"))).typ({prog:true}), "Il était en train de trouver.", "Verbe composé, progressif");  //10
        assert.equal(S(Pro("je"),VP(V("trouver"))).typ({neg:true,prog:true}), "Il n'est pas en train de trouver.", "Verbe simple, négatif-progressif");  //11
        assert.equal(S(Pro("je"),VP(V("trouver").t("pc"))).typ({neg:true,prog:true}), "Il n'était pas en train de trouver.", "Verbe composé, négatif-progressif");  //12
        assert.equal(S(Pro("je"),VP(V("trouver"))).typ({pas:true, prog:true}), "Est en train d'être trouvé par lui.", "Verbe simple, passif-progressif");  //13
        assert.equal(S(Pro("je"),VP(V("trouver").t("pc"))).typ({pas:true,prog:true}), "Était en train d'être trouvé par lui.", "Verbe composé, passif-progressif");  //14
        assert.equal(S(Pro("je"),VP(V("trouver"))).typ({pas:true,neg:true,prog:true}), "N'est pas en train d'être trouvé par lui.", "Verbe simple, passif-négatif-progressif");  //15
        assert.equal(S(Pro("je"),VP(V("trouver").t("pc"))).typ({pas:true,neg:true,prog:true}), "N'était pas en train d'être trouvé par lui.", "Verbe composé, passif-négatif-progressif");  //16
        assert.equal(S(Pro("je"),VP(V("trouver").t("pc"))).typ({neg:"rien"}), "Il n'a rien trouvé.", "Verbe composé, négatif personnalisé");  //17
    });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "Verb options EN", function( assert ) {
        	assert.equal(S(Pro("I"),VP(V("find"))), "He finds.", "No option"); //1
            assert.equal(S(Pro("I"),VP(V("find"))).typ({neg:true}), "He does not find.", "Negative");  //2
            assert.equal(S(Pro("I").pe("1"),VP(V("be"))).typ({neg:true}), "I am not.", "Negative"); //2.5
            assert.equal(S(Pro("I"),VP(V("find"))).typ({pas:true}), "Is found by him.", "Passive");  //3
            assert.equal(S(Pro("I"),VP(V("find"))).typ({neg:true,pas:true}), "Is not found by him.", "Negative-passive");  //4
            assert.equal(S(Pro("I"),VP(V("find"))).typ({prog:true}), "He is finding.", "Continuous");  //5
            assert.equal(S(Pro("I"),VP(V("find"))).typ({neg:true,prog:true}), "He is not finding.", "Negative-continuous");  //6
            assert.equal(S(Pro("I"),VP(V("find"))).typ({pas:true,prog:true}), "Is being found by him.", "Passive-continuous");  //7
            assert.equal(S(Pro("I"),VP(V("find"))).typ({neg:true,pas:true,prog:true}), "Is not being found by him.", "Negative-passive-continuous");  //8
            
            assert.equal(S(Pro("I"),VP(V("find"))).typ({perf:true}), "He has found.", "Perfect"); //9
            assert.equal(S(Pro("I"),VP(V("find"))).typ({neg:true,perf:true}), "He has not found.", "Negative-perfect");  //10
            assert.equal(S(Pro("I"),VP(V("find"))).typ({pas:true,perf:true}), "Has been found by him.", "Passive-perfect");  //11
            assert.equal(S(Pro("I"),VP(V("find"))).typ({neg:true,pas:true,perf:true}), "Has not been found by him.", "Negative-passive-perfect");  //12
            assert.equal(S(Pro("I"),VP(V("find"))).typ({prog:true,perf:true}), "He has been finding.", "Continuous-perfect");  //13
            assert.equal(S(Pro("I"),VP(V("find"))).typ({neg:true,prog:true,perf:true}), "He has not been finding.", "Negative-continuous-perfect");  //14
            assert.equal(S(Pro("I"),VP(V("find"))).typ({pas:true,prog:true,perf:true}), "Has been being found by him.", "Passive-continuous-perfect");  //15
            assert.equal(S(Pro("I"),VP(V("find"))).typ({neg:true,pas:true,prog:true,perf:true}), "Has not been being found by him.", "Negative-passive-continuous-perfect");  //16            
        });
    });
});