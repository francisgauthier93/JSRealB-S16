JSrealLoader({
        language: "en",
        lexiconUrl: URL.lexicon.en,
        ruleUrl: URL.rule.en,
        featureUrl: URL.feature
    }, function() 
    {
        QUnit.test( "English Interrogative", function( assert ) {
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat"),NP(D("the"),N("mouse")))), "The cat eats the mouse.", "Simple sentence, no option");  
        	assert.equal(S(NP(D("the"),N("cat")),VP(V("eat"),NP(D("the"),N("mouse")))).typ({int:true}), "Does the cat eat the mouse?", "Interrogative sentence"); 
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat"),NP(D("the"),N("mouse")))).typ({int:'wos'}), "Who eats the mouse?", "Interrogative sentence (subject-who)");
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat"),NP(D("the"),N("mouse")))).typ({int:'wod'}), "Who does the cat eat?", "Interrogative sentence (direct object-who)");
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat"),NP(D("the"),N("mouse")))).typ({int:'wad'}), "What does the cat eat?", "Interrogative sentence (direct object-what)");               
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat"),NP(D("the"),N("mouse")),PP(P("to"),NP(D("my"),N("family"))))).typ({int:'woi'}), "To who does the cat eat the mouse?", "Interrogative sentence (indirect object-who)");
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat"),NP(D("the"),N("mouse")))).typ({int:'whe'}), "Where does the cat eat the mouse?", "Interrogative sentence (where)");               
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat"),NP(D("the"),N("mouse")))).typ({int:'how'}), "How does the cat eat the mouse?", "Interrogative sentence (how)");// 8
            //Different tense
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps"),NP(D("the"),N("mouse")))).typ({int:true}), "Did the cat eat the mouse?", "Interrogative sentence(past)");//9
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:true}), "Will the cat eat the mouse?", "Interrogative sentence(future)");//10
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'wad'}), "What will the cat eat?", "Interrogative sentence(wad,future)");//11
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'wos'}), "Who will eat the mouse?", "Interrogative sentence (subject-who)");//12
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'wod'}), "Who will the cat eat?", "Interrogative sentence (direct object-who)");//13
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'whe'}), "Where will the cat eat the mouse?", "Interrogative sentence(whe,future)");//14
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'how'}), "How will the cat eat the mouse?", "Interrogative sentence (how)"); //15
            //With other options
            //Perfect
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps").perf(true),NP(D("the"),N("mouse")))).typ({int:true}), "Did the cat had eaten the mouse?", "Interrogative/Perfect sentence(past)");//16
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f").perf(true),NP(D("the"),N("mouse")))).typ({int:true}), "Will the cat have eaten the mouse?", "Interrogative/Perfect sentence(future)");//17
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps").perf(true),NP(D("the"),N("mouse")))).typ({int:'wad'}), "What did the cat had eaten?", "Interrogative/Perfect sentence(wad,past)");//18
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f").perf(true),NP(D("the"),N("mouse")))).typ({int:'wad'}), "What will the cat have eaten?", "Interrogative/Perfect sentence(wad,future)");//19
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps").perf(true),NP(D("the"),N("mouse")))).typ({int:'wos'}), "Who had eaten the mouse?", "Interrogative/Perfect sentence (wos,past)");//20
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f").perf(true),NP(D("the"),N("mouse")))).typ({int:'wos'}), "Who will have eaten the mouse?", "Interrogative/Perfect sentence (wos, future)");//21
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps").perf(true),NP(D("the"),N("mouse")))).typ({int:'wod'}), "Who did the cat had eaten?", "Interrogative/Perfect sentence (wod, past)");//22
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f").perf(true),NP(D("the"),N("mouse")))).typ({int:'wod'}), "Who will the cat have eaten?", "Interrogative/Perfect sentence (wod, future)");//23
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps").perf(true),NP(D("the"),N("mouse")))).typ({int:'whe'}), "Where did the cat had eaten the mouse?", "Interrogative/Perfect sentence(whe,past)");//24
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f").perf(true),NP(D("the"),N("mouse")))).typ({int:'whe'}), "Where will the cat have eaten the mouse?", "Interrogative/Perfect sentence(whe,future)");//25
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps").perf(true),NP(D("the"),N("mouse")))).typ({int:'how'}), "How did the cat had eaten the mouse?", "Interrogative/Perfect sentence (how, past)");//26
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f").perf(true),NP(D("the"),N("mouse")))).typ({int:'how'}), "How will the cat have eaten the mouse?", "Interrogative/Perfect sentence (how, future)");//27
            //Negation
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps"),NP(D("the"),N("mouse")))).typ({int:true,neg:true}), "Did the cat not eat the mouse?", "Interrogative/Negative sentence(past)");//16
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:true,neg:true}), "Will the cat not eat the mouse?", "Interrogative/Negative sentence(future)");//17
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps"),NP(D("the"),N("mouse")))).typ({int:'wad',neg:true}), "What did the cat not eat?", "Interrogative/Negative sentence(wad,past)");//18
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'wad',neg:true}), "What will the cat not eat?", "Interrogative/Negative sentence(wad,future)");//19
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps"),NP(D("the"),N("mouse")))).typ({int:'wos',neg:true}), "Who did not eat the mouse?", "Interrogative/Negative sentence (wos,past)");//20
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'wos',neg:true}), "Who will not eat the mouse?", "Interrogative/Negative sentence (wos, future)");//21
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps"),NP(D("the"),N("mouse")))).typ({int:'wod',neg:true}), "Who did the cat not eat?", "Interrogative/Negative sentence (wod, past)");//22
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'wod',neg:true}), "Who will the cat not eat?", "Interrogative/Negative sentence (wod, future)");//23
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps"),NP(D("the"),N("mouse")))).typ({int:'whe',neg:true}), "Where did the cat not eat the mouse?", "Interrogative/Negative sentence(whe,past)");//24
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'whe',neg:true}), "Where will the cat not eat the mouse?", "Interrogative/Negative sentence(whe,future)");//25
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps"),NP(D("the"),N("mouse")))).typ({int:'how',neg:true}), "How did the cat not eat the mouse?", "Interrogative/Negative sentence (how, past)");//26
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f"),NP(D("the"),N("mouse")))).typ({int:'how',neg:true}), "How will the cat not eat the mouse?", "Interrogative/Negative sentence (how, future)");//27
            //Negation + perfect
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps").perf(true),NP(D("the"),N("mouse")))).typ({int:true,neg:true}), "Did the cat not eat the mouse?", "Interrogative/Negative/Perfect sentence(past)");//16
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f").perf(true),NP(D("the"),N("mouse")))).typ({int:true,neg:true}), "Will the cat not eat the mouse?", "Interrogative/Negative/Perfect sentence(future)");//17
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps").perf(true),NP(D("the"),N("mouse")))).typ({int:'wad',neg:true}), "What did the cat not eat?", "Interrogative/Negative/Perfect sentence(wad,past)");//18
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f").perf(true),NP(D("the"),N("mouse")))).typ({int:'wad',neg:true}), "What will the cat not eat?", "Interrogative/Negative/Perfect sentence (wad, future)");//23
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("ps").perf(true),NP(D("the"),N("mouse")))).typ({int:'whe',neg:true}), "Where did the cat not eat the mouse?", "Interrogative/Negative/Perfect sentence(whe,past)");//24
            assert.equal(S(NP(D("the"),N("cat")),VP(V("eat").t("f").perf(true),NP(D("the"),N("mouse")))).typ({int:'whe',neg:true}), "Where will the cat not eat the mouse?", "Interrogative/Negative/Perfect sentence(whe,future)");//25


        });
    }
);