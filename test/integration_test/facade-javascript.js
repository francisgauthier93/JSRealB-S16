JSrealLoader({
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    var pom = NP(D("le"),N("pomme"));
    var gars = NP(D('le'),N('garçon')).n('p');
    var aime = V('aimer');

    var apple = NP(D("the"),N("apple"));
    var boy = NP(D('a'),N('boy'));
    var love = V('love');

    QUnit.test( "JavaScript FR", function( assert ) {
        assert.equal(pom,'la pomme', 'Utilisation de var');
        assert.equal(pom.clone(),'la pomme', 'Utilisation de var + clone');
        assert.equal(pom.clone().n('p'),'les pommes', 'Utilisation de var + clone + transformations');
        assert.equal(aime.clone().t('f'),'aimera', 'Utilisation de var + clone + transformations');
        assert.equal(pom,'la pomme', 'Utilisation de var');
        assert.equal(aime, 'aime','Utilisation de var');

        //ADD
        assert.equal(S().add(pom),'La pomme.', 'add')
        assert.equal(CP(C('et'),NP(D('le'),N('fruit'))).add(pom).add(gars),'le fruit, la pomme et les garçons', 'add (2 fois)');
        assert.equal(S(VP().add(aime).add(pom)).add(gars,0),'Les garçons aiment la pomme.', 'add 3 fois + position');
   });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "JavaScript EN", function( assert ) {
            assert.equal(apple,'the apple', 'Utilisation de var');
            assert.equal(apple.clone(),'the apple', 'Utilisation de var + clone');
            assert.equal(apple.clone().n('p'),'the apples', 'Utilisation de var + clone + transformations');
            assert.equal(love.clone().t('f'),'will love', 'Utilisation de var + clone + transformations');
            assert.equal(apple,'the apple', 'Utilisation de var');
            assert.equal(love, 'loves','Utilisation de var');

            //ADD
            assert.equal(S().add(apple),'The apple.', 'add')
            assert.equal(CP(C('and'),NP(D('a'),N('fruit'))).add(apple).add(boy),'a fruit, the apple and a boy', 'add (2 fois)');
            assert.equal(S(VP().add(love).add(apple)).add(boy,0),'A boy loves the apple.', 'add 3 fois + position');

        });
    });
});
