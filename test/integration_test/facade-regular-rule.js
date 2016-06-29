JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "Regular rule FR", function( assert ) {
        
        assert.equal( Adv("justement"), "justement", "justement => justement" );
        assert.equal( Adv("ne"), "ne", "ne => ne" );
        assert.equal( VP(Adv("ne"),V("avoir").t("p").n("p")) , "n'ont", "(elision) ne ont => n'ont" );
        
        assert.equal( P("jusque"), "jusque", "jusque => jusque" );
        assert.equal( PP(P("jusque"),P("à")), "jusqu'à", "(elision) jusque à => jusqu'à" );
        assert.equal( P("de"), "de", "de => de" );
        assert.equal( PP(P("de"),V("arriver")), "d'arriver", "(elision) de arriver => d'arriver" );
        assert.equal( PP(P("de"),NP(D("le"),N("lac"))), "du lac", "(elision) de le lac => du lac" );
//        assert.equal( P("dans").el(true), "dans", "(pas elision possible) dans => dans" );
        assert.equal( P("parmi"), "parmi", "parmi => parmi" );
        assert.equal( P("à"), "à", "à => à" );
        assert.equal( PP(P("à"),NP(D("le"),N("lac"))), "au lac", "(elision) à le lac => au lac");
        assert.equal( NP(D("mon"),N("chaise")), "sa chaise", "(pas d'elision, accord) son chaise => sa chaise");
        assert.equal( NP(D("mon"),N("ouverture")), "son ouverture", "(elision malgré l'accord) son ouverture => sa ouverture => son ouverture");

        assert.equal( NP(D("le"),N("hache")), "la hache", "(h aspiré, pas d'elision) la hache => la hache");
        assert.equal( NP(D("le"),N("hommage")), "l'hommage", "(elision) le hommage => l'hommage");

        assert.equal( P("par"), "par", "par => par" );

        assert.equal( NP(D("ce"),N("loup")),"ce loup", "ce loup => ce loup");
        assert.equal( NP(D("ce"),N("hommage")),"cet hommage", "ce hommage => cet hommage");
        assert.equal( NP(D("ce"),N("hache")),"cette hache", "ce hache => cette hache");
        assert.equal( NP(D("ce"),N("étoile")),"cette étoile", "ce étoile => cette étoile");
        assert.equal( NP(D("ce"),N("exemple")),"cet exemple", "ce exemple => cet exemple");
        
        //assert.equal( VP(Pro("ce"),V("être").t("i")),"c'était", "ce était => c'était");      //partie de l'élision à rectifier  

    });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "Regular rule EN", function( assert ) {
            
            assert.equal( P("round"), "round", "round => round" );
            assert.equal( P("through"), "through", "through => through" );
            assert.equal( P("to"), "to", "to => to" );
            assert.equal( P("unlike"), "unlike", "unlike => unlike" );

            assert.equal( D("a"), "a", "a => a");
            assert.equal( NP(D("a"),N("school")),"a school", "a school => a school");
            assert.equal( NP(D("a"),N("apple")),"an apple", "a apple => an apple");

            //assert.equal( NP(D("a"),A("unique"),N("school"),"a unique school"), "a unique school => a unique school");   //Ne fonctionne pas, dépend de la phonétique...
                        
    //        assert.equal( , "", "" );
        });
    });
});