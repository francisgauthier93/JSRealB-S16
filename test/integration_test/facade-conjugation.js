JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "Conjugaison FR", function( assert ) {
        assert.equal( V("manger").pe(1), "mange", "Je mange" );
        assert.equal( V("manger").pe(1).n("s"), "mange", "Je mange" );
        assert.equal( V("manger").pe(1).n("p"), "mangeons", "Nous mangeons" );
        assert.equal( V("manger").pe(3).n("p"), "mangent", "Ils mangent" );
        
        assert.equal( V("manger").t("i").pe(1), "mangeais", "Je mangeais" );
        assert.equal( V("manger").t("i").pe(1).n("s"), "mangeais", "Je mangeais" );
        assert.equal( V("manger").t("i").pe(3), "mangeait", "Il mangeait" );
        assert.equal( V("manger").t("i").pe(1).n("p"), "mangions", "Nous mangions" );
        assert.equal( V("manger").t("i").pe(3).n("p"), "mangeaient", "Ils mangeaient" );
        
        assert.equal( V("manger").t("pc").pe(1), "ai mangé", "J'ai mangé" );
        assert.equal( V("manger").t("pc").pe(1).n("s"), "ai mangé", "J'ai mangé" );
        assert.equal( V("manger").t("pc").pe(1).n("p"), "avons mangé", "Nous avons mangé" );
        assert.equal( V("manger").t("pc").pe(3).n("p"), "ont mangé", "Ils ont mangé" );

        assert.equal( V("manger").t("ip").pe(2).n("s"), "mange", "Mange" );
        assert.equal( V("manger").t("ip").pe(1).n("p"), "mangeons", "Mangeons" );
        assert.equal( V("manger").t("ip").pe(2).n("p"), "mangez", "Mangez" );

        //auxiliaire forcé
        assert.equal( V("manger").t("pc").aux("avoir"), "a mangé", "Il a mangé");
        assert.equal( V("manger").t("pc").aux("être"), "est mangé", "Il est mangé");
//        assert.equal( , "", "" );
    });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "Conjugation EN", function( assert ) {

            assert.equal( V("have").pe(2), "have", "You have" );
            assert.equal( V("have").pe(3), "has", "He has" );
            assert.equal( V("have").pe(3).n("p"), "have", "They have" );
            
            assert.equal( V("be").pe(2), "are", "You are" );
            assert.equal( V("be").pe(3), "is", "He is" );
            assert.equal( V("be").pe(3).n("p"), "are", "They are" );
            
            assert.equal( V("be").t("ps").pe(2), "were", "You were" );
            assert.equal( V("be").t("ps").pe(3), "was", "He was" );
            assert.equal( V("be").t("ps").pe(3).n("p"), "were", "They were" );

            assert.equal( V("be").t("ip"), "be", "Be");
        });
    });
});