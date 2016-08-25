JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "Syntagme nominal FR", function( assert ) {
        // NP : Noun Phrase
        assert.equal( NP(D("un"), N("camion")), "un camion", "NP : Aucun accord nécessaire" );
        assert.equal( NP(D("un"), N("camion")).n("p"), "des camions", "NP : Accord en nombre" );
        assert.equal( NP(D("un"), N("voiture")), "une voiture", "NP : Accord en genre" );
        assert.equal( NP(D("un"), A("beau"), N("voiture")).n("p"), "des belles voitures", "NP : Accord en genre et nombre" );
        assert.equal( NP(D("un"), N("personne"), A("riche")), "une personne riche", "NP : accord en genre + adjectif");
        assert.equal( NP(D("un"), N("personne"), AP(Adv("très"),A("riche"))), "une personne très riche", "NP : accord en genre + groupe adjectif");
        assert.equal( NP(D("un"), N("personne"), AP(Adv("très"),A("riche")).pos("pre")), "une très riche personne", "NP : accord en genre + groupe adjectif");
        assert.equal( NP(D("un"), AP(Adv("très"),A("beau")), N("voiture")).n("p"), "des très belles voitures", "NP : Accord en genre et nombre + groupe adjectif" );
        assert.equal( NP(D("un"), AP(Adv("très"),A("beau")).pos("post"), N("voiture")).n("p"), "des voitures très belles", "NP : Accord en genre et nombre + groupe adjectif" );

        
    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "Noun Phrase EN", function( assert ) {
            // NP : Noun Phrase
            assert.equal( NP(D("a"), A("lonely"), N("tourist").n("p")), "lonely tourists", "1. NP: plural" );
            assert.equal( NP(D("a"), N("car")), "a car", "2. NP" );
            assert.equal( NP(D("a"), N("car")).n("p"), "cars", "3. NP : Accord en nombre" );
            assert.equal( NP(D("a"), A("old"), N("man")).n("p"), "old men", "4. NP: adjective + plural" );
            assert.equal( NP(D("a"), A("young"), N("man")), "a young man", "5. NP" );
            assert.equal( NP(D("a"), N("bone")), "a bone", "6. NP" );
            assert.equal( NP(D("a"), A("old"), N("man")), "an old man", "7. NP: adjective" );
            assert.equal( NP(D("a"), N("apple")), "an apple", "8. NP: elision" );
            assert.equal( NP(D("a"), AP(A("big"), A("red")), N("car")), "a big red car", "9. NP" );
            assert.equal(NP(D("the"), N("boy")), "the boy", "10. NP");

            //Elision english
            assert.equal(NP(D("a"),N("helmet")),"a helmet", "11. a helmet => a helmet");
            assert.equal(NP(D("a"),N("hour")),"an hour", "12. a hour => an hour");
            assert.equal( NP(D("a"),N("school")),"a school", "13. a school => a school");
            assert.equal( NP(D("a"),N("apple")),"an apple", "14. a apple => an apple");

        });
    });
});
});