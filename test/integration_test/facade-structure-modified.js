JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "Structure de phrase modifiée FR", function( assert ) {
        //Pronominalisation des groupes du nom
        assert.equal(S(NP(D('un'),N("poule")).n('p'),VP(V("mordre").t('p'))), "Des poules mordent.", "Sans pronominalisation");
        assert.equal(S(NP(D('un'),N("poule")).n('p').pro(),VP(V("mordre").t('p'))), "Elles mordent.", "Pronominalisation sujet");
        assert.equal(S(NP(D('un'),N("poule")).n('p'),VP(V("mordre").t('p'),NP(D("un"),N("enfant")))), "Des poules mordent un enfant.", "Sans pronominalisation (avec cd)");
        assert.equal(S(NP(D('un'),N("poule")).n('p'),VP(V("mordre").t('p'),NP(D("un"),N("enfant")).pro())), "Des poules le mordent.", "Pronominalisation cd");
        assert.equal(S(NP(D('un'),N("poule")).n('p').pro(),VP(V("mordre").t('p'),NP(D("un"),N("enfant")).pro())), "Elles le mordent.", "Pronominalisation sujet+cd");
        assert.equal(S(NP(D('un'),N("poule")).n('p'),VP(V("mordre").t('p'),NP(D("un"),N("enfant")),PP(P("dans"),NP(D("un"),N("maison"))))), "Des poules mordent un enfant dans une maison.", "Sans pronominalisation (avec cd+ci)");
        assert.equal(S(NP(D('un'),N("poule")).n('p'),VP(V("mordre").t('p'),NP(D("un"),N("enfant")),PP(P("dans"),
            NP(D("un"),N("maison")).pro()))), "Des poules mordent un enfant dans elle.", "Pronominalisation ci");
        assert.equal(S(NP(D('un'),N("poule")).n('p').pro(),VP(V("mordre").t('p'),NP(D("un"),N("enfant")).pro(),PP(P("dans"),
            NP(D("un"),N("maison")).pro()))), "Elles le mordent dans elle.", "Pronominalisation sujet+cd+ci");

        //Action passive
        assert.equal(S(NP(D("le"),N("soldat").n("p")),VP(V("trouver").t("pc"),NP(D("le"),N("fille")))),"Les soldats ont trouvé la fille.", "Phrase simple");
        assert.equal(S(NP(D("le"),N("soldat").n("p")),VP(V("trouver").t("pc").vOpt({pas:true}),NP(D("le"),N("fille")))),"La fille a été trouvée par les soldats.", "Phrase passive avec sujet et cd");
        assert.equal(S(NP(D("le"),N("soldat").n("p")),VP(V("trouver").t("pc").vOpt({pas:true}))),"A été trouvé par les soldats.", "Phrase passive avec sujet, sans cd");
        assert.equal(S(VP(V("trouver").t("pc").vOpt({pas:true}),NP(D("le"),N("fille")))),"La fille a été trouvée.", "Phrase passive avec cd, sans sujet");

    });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "Phrase structure modified EN", function( assert ) {
            assert.equal(S(NP(D("the"),N("chicken")),VP(V("bite").t("p"))), "The chicken bites.", "No pronoun");
            assert.equal(S(NP(D("the"),N("chicken")).pro(),VP(V("bite").t("p"))), "He bites.", "Subject as pronoun");
            assert.equal(S(NP(D("the"),N("chicken")),VP(V("bite").t("p"),NP(D("a"),N("kid").n("p")))), "The chicken bites the kids.", "No pronoun + cd");
            assert.equal(S(NP(D("the"),N("chicken")),VP(V("bite").t("p"),NP(D("a"),N("kid").n("p")).pro())), "The chicken bites them.", "Cd as pronoun");
            assert.equal(S(NP(D("the"),N("chicken")).pro(),VP(V("bite").t("p"),NP(D("a"),N("kid").n("p")).pro())), "He bites them.", "Cd and subject as pronoun");
            assert.equal(S(NP(D("the"),N("chicken")),VP(V("bite").t("p"),
                NP(D("a"),N("kid").n("p")),PP(P("at"),NP(D("my").pe(1),N("house"))))), "The chicken bites the kids at my house.", "No pronoun + cd + ci");
            assert.equal(S(NP(D("the"),N("chicken")),VP(V("bite").t("p"),
                NP(D("a"),N("kid").n("p")),PP(P("at"),NP(D("my").pe(1),N("house")).pro()))), "The chicken bites the kids at him.", "Ci as pronoun");
            assert.equal(S(NP(D("the"),N("chicken")).pro(),VP(V("bite").t("p"),
                NP(D("a"),N("kid").n("p")).pro(),PP(P("at"),NP(D("my").pe(1),N("house")).pro()))), "He bites them at him.", "Subject, cd and ci as pronoun");
            assert.equal(S(NP(D("the"),N("chicken")).pro(),VP(V("bite").t("p"),
                NP(D("a"),N("kid").n("p")).pro(),PP(P("at"),NP(D("my").pe(1),N("house").g("n")).pro()))), "He bites them at it.", "Subject, cd and ci as pronoun");

            //Passive action
            assert.equal(S(NP(D("the"),N("soldier").n("p")),VP(V("find").t("ps"),NP(D("a"),N("girl")))),"The soldiers found a girl.", "Simple sentence");
            assert.equal(S(NP(D("the"),N("soldier").n("p")),VP(V("find").t("ps").vOpt({pas:true}),NP(D("a"),N("girl")))),"A girl was found by the soldiers.", "Passive sentence, with subject and cd");
            assert.equal(S(NP(D("the"),N("soldier").n("p")),VP(V("find").t("ps").vOpt({pas:true}))),"Was found by the soldiers.", "Passive sentence, no cd");
            assert.equal(S(VP(V("find").t("ps").vOpt({pas:true}),NP(D("a"),N("girl")))), "A girl was found.", "Passive sentence, no subject");

        
        });
    });
});