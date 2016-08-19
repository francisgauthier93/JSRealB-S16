var rawNumberOption = {raw: true};
//var naturalNumberOption = {nat: true};
var nonNaturalNumberOption = {nat: false};
var numberWith0DecimalsOption = {nat: false, mprecision: 0};
var numberWith2DecimalsOption = {nat: false, mprecision: 2};
var numberWith4DecimalsOption = {nat: false, mprecision: 4};
var numberWith6DecimalsOption = {nat: false, mprecision: 6};

JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "Number FR", function( assert ) {
        assert.equal( NO(12.95).dOpt(rawNumberOption), "12.95", "1. raw number" );
        assert.equal( NO(1200.95).dOpt(rawNumberOption), "1200.95", "2. raw number" );
        assert.equal( NO("1,200.95").dOpt(rawNumberOption), "1,200.95", "3. raw number" );
        assert.equal( NO("12.95").dOpt(rawNumberOption), "12.95", "4. raw number" );
        
        assert.equal( NO(1200.95).dOpt(nonNaturalNumberOption), "1 200,95", "1. non natural number" );
        assert.equal( NO("12.95").dOpt(nonNaturalNumberOption), "12,95", "2. non natural number" );

        assert.equal( NO("12.987654321").dOpt(numberWith0DecimalsOption), "13", "1. precision" );
        assert.equal( NO("12.987654321").dOpt(numberWith2DecimalsOption), "12,99", "2. precision" );
        assert.equal( NO("12.123456789").dOpt(numberWith4DecimalsOption), "12,1235", "3. precision" );
        assert.equal( NO("12.123456789").dOpt(numberWith6DecimalsOption), "12,123457", "4. precision" );
        
        assert.equal( NP(NO(0), N("kilomètre")), "0 kilomètre", "1. NO is a numerical adjective");
        assert.equal( NP(NO(1), N("kilomètre")), "1 kilomètre", "2. NO is a numerical adjective");
        assert.equal( NP(NO(2), N("kilomètre")), "2 kilomètres", "3. NO is a numerical adjective");
        assert.equal( NP(NO(3), N("avion"), AP(A("blanc"))), "3 avions blancs", "4. NO is a numerical adjective");
        assert.equal( NP(NO(1), N("avion"), AP(A("blanc"))), "1 avion blanc", "5. NO is a numerical adjective");

        //Conversion en langue naturelle
        assert.equal( NO(1).nat(), "un", "1 -> un");
        assert.equal( NO(1).nat().g("f"), "une", "1 -> une");
        assert.equal( NO(47).nat(), "quarante-sept", "47 -> quarante-sept");
        assert.equal( NO(13579086).nat(), "treize millions cinq cent soixante-dix-neuf mille quatre-vingt-six", "gros nombre (langue naturelle)"); 
    });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "Number EN", function( assert ) {
            assert.equal( NO(12.95).dOpt(rawNumberOption), "12.95", "1. raw number" );
            assert.equal( NO(1200.95).dOpt(rawNumberOption), "1200.95", "2. raw number" );
            assert.equal( NO("1,200.95").dOpt(rawNumberOption), "1,200.95", "3. raw number" );
            assert.equal( NO("12.95").dOpt(rawNumberOption), "12.95", "4. raw number" );

            assert.equal( NO(1200.95).dOpt(nonNaturalNumberOption), "1,200.95", "1. non natural number" );
            assert.equal( NO("12.95").dOpt(nonNaturalNumberOption), "12.95", "2. non natural number" );

            assert.equal( NO("12.987654321").dOpt(numberWith0DecimalsOption), "13", "1. precision" );
            assert.equal( NO("12.987654321").dOpt(numberWith2DecimalsOption), "12.99", "2. precision" );
            assert.equal( NO("12.123456789").dOpt(numberWith4DecimalsOption), "12.1235", "3. precision" );
            assert.equal( NO("12.123456789").dOpt(numberWith6DecimalsOption), "12.123457", "4. precision" );
        
            assert.equal( NP(NO(0), N("balloon")), "0 balloon", "1. NO is a numerical adjective");
            assert.equal( NP(NO(1), N("balloon")), "1 balloon", "2. NO is a numerical adjective");
            assert.equal( NP(NO(2), N("balloon")), "2 balloons", "3. NO is a numerical adjective");
            assert.equal( NP(NO(3), AP(A("white")), N("balloon")), "3 white balloons", "4. NO is a numerical adjective");
            assert.equal( NP(NO(1), AP(A("white")), N("balloon")), "1 white balloon", "5. NO is a numerical adjective");

            assert.equal( NO(1).nat(), "one", "1 -> one");
            assert.equal( NO(47).nat(), "forty-seven", "47 -> forty-seven");
            assert.equal( NO(13579086).nat(), "thirteen million five hundred and seventy-nine thousand eighty-six", "big number (langue naturelle)");
        });
    });
});