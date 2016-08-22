JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "HTML FR", function( assert ) {
        assert.equal( S(NP(Pro("je").pe(1)), VP(V("habiter")).tag("span")), "<span>J'habite</span>.", "1. HTML SPAN" );
        assert.equal( S(NP(Pro("je").pe(1)), VP(V("manger")).t("ps").tag("span", {"class": "verb"})).a("!"), 'Je <span class="verb">mangeai</span>!', "2. HTML SPAN" );
        assert.equal( S(NP(Pro("je").pe(1)), VP(V("manger").tag("span", {"class": "verb"}))).t("ps").a("!"), 'Je <span class="verb">mangeai</span>!', "3. HTML SPAN" );
        assert.equal( V("jouer").pe(2).tag("span", {"class": "verb"}), '<span class="verb">joues</span>', "4. HTML SPAN" );
        assert.equal( S(NP(Pro("je")), VP(V("habiter"))).tag("i"), "<i>Il habite.</i>", "1. HTML italic" );
        assert.equal( S(NP(Pro("je")), VP(V("habiter"), PP(P("à"), NP(D("le"), N("ville"))).tag("i"))), "Il habite <i>à la ville</i>.", "2. HTML italic" );
        assert.equal( S(NP(D("le"), N("homme").tag("a", {"class": "noun", "href": "#noun"})).n("p")), 'Les <a class="noun" href="#noun">hommes</a>.', "1. HTML Link" );
        assert.equal( V("manger").t("b").tag("a", {"href": "#manger"}), '<a href="#manger">manger</a>', "2. HTML Link" );
        assert.equal( S(NP(Pro("je").pe(1)), VP(V("être"), NP(D("un"), N("joueur").tag("a", {"href": "#joueur"})).g("f"))).tag("p"), '<p>Je suis une <a href="#joueur">joueuse</a>.</p>', "1. HTML p and link" );
        assert.equal( S(NP(D("un"), N("femme").tag("strong"))), 'Une <strong>femme</strong>.', "1. HTML strong" );
        assert.equal( S(NP(D("un"), N("femme").tag("em"))), 'Une <em>femme</em>.', "1. HTML em" );
        assert.equal( S(NP(Pro("je").pe(1)), VP(V("habiter"), PP(P("à"), NP(D("le"), N("maison")))).tag("span")), "<span>J'habite à la maison</span>.", "1. HTML + elision" );
        assert.equal( S(NP(Pro("je").pe(1)), VP(V("habiter"), PP(P("à"), NP(D("le"), N("maison")))).tag("span")).a("!"), "<span>J'habite à la maison</span>!", "2. HTML + elision" );
        assert.equal( S(NP(D("un"), A("beau").tag("span"), N("femme").tag("span"))), "Une <span>belle</span> <span>femme</span>.", "3. HTML + elision" );
        assert.equal( S(NP(D("le"), N("ours").tag("b"))), "<b>L'ours</b>.", "4. HTML + elision" );
        assert.equal( S(CP(C("et"), NP(D("le"), N("boulanger").g("f")).tag("span"), NP(D("le"), N("client").g("f").tag("span"))), VP(V("parler")).tag("span")), "<span>La boulangère</span> et la <span>cliente</span> <span>parlent</span>.", "5. HTML + elision" );

        //tag multiples
        assert.equal( S(NP(D("un"), A("beau").tag("b").tag("i"), N("femme").tag("span"))), "Une <i> <b>belle</b></i> <span>femme</span>.", "1. HTML(multiples)" );
        assert.equal( S(NP(D("un"), N("femme").tag("span").tag("b",{"style":"text-decoration:underline"})).tag("i")), "<i>Une <b style='text-decoration:underline'> <span>femme</span></b></i>.", "2. HTML(multiples)" );

    });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "HTML EN", function( assert ) {
            assert.equal( S(NP(Pro("I").pe(1)), VP(V("eat")).t("ps").tag("span", {"class": "verb"})).a("!"), 'I <span class="verb">ate</span>!', "1. HTML SPAN" );
            assert.equal( S(NP(Pro("I").pe(1)), VP(V("eat").tag("span", {"class": "verb"}))).t("ps").a("!"), 'I <span class="verb">ate</span>!', "2. HTML SPAN" );
            assert.equal( V("play").pe(2).tag("span", {"class": "verb"}), '<span class="verb">play</span>', "3. HTML SPAN" );
            assert.equal( S(NP(Pro("I")), VP(V("leave"))).tag("i"), "<i>He leaves.</i>", "1. HTML italic" );
            assert.equal( S(NP(Pro("I")), VP(V("leave"), PP(P("in"), NP(D("the"), N("city"))).tag("i"))), "He leaves <i>in the city</i>.", "2. HTML italic" );
            assert.equal( S(NP(D("the"), N("man").tag("a", {"class": "noun", "href": "#noun"})).n("p")), 'The <a class="noun" href="#noun">men</a>.', "1. HTML Link" );
            assert.equal( V("eat").t("b").tag("a", {"href": "#eat"}), '<a href="#eat">eat</a>', "2. HTML Link" );
            assert.equal( S(NP(Pro("I").pe(1)), VP(V("be"), NP(D("a"), N("player").tag("a", {"href": "#player"})))).tag("p"), '<p>I am a <a href="#player">player</a>.</p>', "1. HTML p and link" );
            assert.equal( S(NP(D("a"), N("woman").tag("strong"))), 'A <strong>woman</strong>.', "1. HTML strong" );
            assert.equal( S(NP(D("a"), N("woman").tag("em"))), 'A <em>woman</em>.', "1. HTML em" );

            //tag multiples
            assert.equal( S(NP(D("a"), A("nice").tag("b").tag("i"), N("woman").tag("span")).t("p")), "A <i><b>nice</b></i> <span>woman</span>.", "3. HTML(multiples)" );
            assert.equal( S(NP(D("a"), N("woman").tag("span").tag("b",{"style":"text-decoration:underline"})).tag("i")), "<i>A <b style='text-decoration:underline'><span>woman</span></b></i>.", "3. HTML(multiples)" );

        });
    });
});