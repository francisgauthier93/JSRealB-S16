JSrealLoader( {
        language: "fr",
        lexiconUrl: URL.lexicon.fr,
        ruleUrl: URL.rule.fr,
        featureUrl: URL.feature
    }, function() {
    QUnit.test( "Syntagme FR", function( assert ) {
        // VP : Verbal Phrase
        assert.equal( S(NP(Pro("je")).pe(2), VP(V("être"), AP(A("intelligent")))).g("f"), "Tu es intelligente.", "1. VP" );
        assert.equal( S(NP(Pro("je")).pe(2), VP(V("travailler"), AdvP(Adv("bien")))), "Tu travailles bien.", "2. VP" );
        assert.equal( S(NP(D("le"), N("visiteur")), VP(V("dormir")).t("i"), NP(D("le"), N("matin"))), "Le visiteur dormait le matin.", "3. VP" );
        assert.equal( S(NP(Pro("je")).pe(3).g("f"), VP(V("manger"), NP(D("un"), N("gâteau")).n("p")).t("i")), "Elle mangeait des gâteaux.", "4. VP" );
        assert.equal( S(NP(D("ce"), N("gâteau")), VP(V("être")), AP(A("excellent"))), "Ce gâteau est excellent.", "5. VP" );
        assert.equal( S(NP(Pro("je").pe(1).n("p")), VP(V("mettre"), NP(D("le"), N("courrier"), PP(P("sur"), NP(D("le"), N("table")))))), "Nous mettons le courrier sur la table.", "6. VP" );
        assert.equal( S(NP(Pro("je").pe(1)), VP(V("parler"), PP(P("à"), NP(D("un"), N("fille"))))), "Je parle à une fille.", "7. VP" );
        assert.equal( S(NP(Pro("je").pe(3).n("p")), VP(V("arrêter"), AdvP(Adv("rapidement")), NP(D("le"), N("discussion"))).t("ps")), "Ils arrêtèrent rapidement la discussion.", "8. VP" );
        assert.equal( S(NP(D("le"), N("petit")).g("f"), VP(V("garder"), NP(D("le"), N("montre")))), "La petite garde la montre.", "9. VP" );
        assert.equal( S(NP(Pro("je")).pe(3), VP(V("refuser")).t("f")), "Il refusera.", "10. VP" );
        assert.equal( S(Pro("je"),VP(V("manger"),NP(D("un"),N("pomme"),V("laisser").t("pp"),PP(P("par"),N("terre"))))),"Il mange une pomme laissée par terre.","11.VP + NP(avec pp accordé seul) + PP");
        assert.equal( NP(D("le"),N("fenêtre").n("p"),V("ouvrir").t("pp")),"les fenêtres ouvertes","12. NP(avec pp accordé seul)");

        // AP : Adjective Phrase
        assert.equal( AP(A("grand").g("f")), "grande", "1. AP" );
        assert.equal( AP(A("content").g("f")), "contente", "2. AP" );
        assert.equal( AP(AdvP(Adv("très")), A("grand").g("f")), "très grande", "3. AP" );
        
        // AdvP : Adverbial Phrase
        assert.equal( AdvP(Adv("évidemment")), "évidemment", "1. AdvP" );
        assert.equal( AdvP(Adv("fort")), "fort", "2. AdvP" );
        assert.equal( AdvP(Adv("rapidement")), "rapidement", "3. AdvP" );
        
        // PP : Prepositional Phrase
        assert.equal( PP(P("dans"), NP(D("le"), N("ville"))), "dans la ville", "1. PP");
        assert.equal( PP(P("de"), NP(D("ce"), N("femme"))), "de cette femme", "2. PP");
        assert.equal( PP(P("à"), NP(D("le"), N("maison"))), "à la maison", "3. PP");
        assert.equal( PP(P("par"), NP(D("le"), N("fenêtre")).n("p")), "par les fenêtres", "4. PP");
        assert.equal( PP(P("avec"), NP(D("mon"), N("femme"))), "avec sa femme", "5. PP");
        
        // CP : Coordinated Phrase
        assert.equal( CP(C("ou"), Pro('moi').pe(2), Pro('je').pe(3).g("f")), "toi ou elle", "0. CP" );
        assert.equal( CP(C("ou"), Pro('moi').pe(1), Pro('moi').pe(2), Pro('je').pe(3).g("f")), "moi, toi ou elle", "1. CP" );
        assert.equal( CP(C(";"), N("jeu").n("p"), N("jouet").n("p"), N("cadeau").n("p")), "jeux ; jouets ; cadeaux", "3. CP" );
        assert.equal( NP(D('le'), CP(C('-'), N('vaisseau'), N('mère'))).n('p'), "les vaisseaux-mères", "4. CP" );
        assert.equal( NP(D('un'), N('mur'), CP(A('rouge'), C('-'), A('orange'))), "un mur rouge-orange", "5. CP" );
        assert.equal( CP(NP(D("le"), N("garçon")), NP(D("le"), N("fille")), C("et")), "le garçon et la fille", "6. CP" );
        assert.equal( CP(NP(D("le"), N("garçon")), C("et"), NP(D("le"), N("fille"))), "le garçon et la fille", "7. CP" );
        assert.equal( CP(C("et"), NP(D("le"), N("garçon")), NP(D("le"), N("fille"))), "le garçon et la fille", "8. CP" );
        
        // SP : Propositional Phrase
        assert.equal(NP(D('le'), N('chose'), SP(Pro('dont'), NP(Pro('je').pe(2)), VP(V('parler')))), "la chose dont tu parles", "1. SP" );
        assert.equal( NP(D('le'),N('souris'),SP(Pro('que'),NP(D('le'), N('chat')), VP(V('manger')))), "la souris que le chat mange", "2. SP" );
        assert.equal( NP(Pro('ce'), SP(Pro('dont'),NP(Pro('je').pe(2)),VP(V('parler')))), "ce dont tu parles", "3. SP" );
        assert.equal( S( NP( D("le"), N("maison").n("p"), SP( Pro("que"), Pro("je").pe("1").n("p"), VP( V("rencontrer").t("pc"))))), "Les maisons que nous avons rencontrées.", "4. SP + pp(avoir)");
        assert.equal( S( NP( D("le"), N("fleur").n("p"), SP( Pro("que"), NP( D("le"), N("garçon").n("p")), 
            VP( Pro("je").pe(1).n("p"), V("offrir").t("pc")))), VP( V("être").t("pc"), A("joli"))), "Les fleurs que les garçons nous ont offertes ont été jolies.", "5. SP + pp(avoir) + pp(être)");
        //Problème avec la prochaine!
        //assert.equal(S( NP( N("pierre").n("p"), SP( Pro("qui"), VP( V("rouler")))), VP( V("amuser"), NP( N("mousse")))).typ({neg:true}),"Pierres qui roulent n'amusent pas mousse.", "6. SP(qui)");
        assert.equal(S( NP( D("le"), N("dame").n("p"), SP( P("à"), Pro("qui"), Pro("je").pe("1").n("s"), VP( V("parler").t("pc")))), VP(V("être").t("pc"), A("joli"))), "Les dames à qui j'ai parlé ont été jolies.", "7. SP(à qui)");

        // Composition
        assert.equal( NP(D("le"), A("petit"), N("chien").g("f"), A("blanc"), PP(P("de"), NP( D("mon").pe(1), N("voisin").g("f").n("p")) ) ), "la petite chienne blanche de mes voisines", "1. NP + PP" );
        assert.equal( NP(D("le"), N("père"), PP(P("de"), NP(D("mon").pe(1), N("fille")) ) ), "le père de ma fille", "2. NP + PP");
        assert.equal( AP(AdvP(Adv("très")), A("fier"), PP(P("de"), NP(D("mon").pe(3), N("famille")))), "très fier de sa famille", "3. AP + AdvP + PP + NP" );
        assert.equal( AdvP(Adv("conformément"), PP(P("à"), NP(D("le"), N("loi")))), "conformément à la loi", "4. AdvP + PP + NP" );
        assert.equal( S( NP(D("le"), N("peintre")), VP(V("réparer"), NP(D("le"), N("mur"))), PP(P("dans"), NP(D("le"), N("cour"))) ), "Le peintre répare le mur dans la cour.", "5. S + NP + VP + PP");

        assert.equal( S(NP(D("le"),N("pomme").n("p")),VP(V("être"),A("beau"))),"Les pommes sont belles.","Les pommes sont belles.")
        assert.equal( S(NP(D("le"),N("pomme")),VP(V("être"),CP(A("beau"),C("et"),A("joli")))),"La pomme est belle et jolie.","La pomme est belle et jolie")
    });

    JSrealLoader({
            language: "en",
            lexiconUrl: URL.lexicon.en,
            ruleUrl: URL.rule.en,
            featureUrl: URL.feature
        }, function() {
        QUnit.test( "Phrase EN", function( assert ) {
        // VP : Verbal Phrase
//        assert.equal( VP(), "", "1. VP" ); // he has been singing
        assert.equal( S(NP(D("a"), N("child")), VP(V("find"), NP(D("a"), N("cat"))).t("ps")), "A child found a cat.", "2. VP" );
        assert.equal( S(NP(Pro("I").pe(3)), VP(V("hate"), NP(N("soup")))), "He hates soup.", "3. VP" );
        assert.equal( S(NP(Pro("I").pe(3).g("f")), VP(V("eat"), NP(N("soup"))).t("ps")), "She ate soup.", "4. VP" );
        assert.equal( S(NP(Pro("I").pe(2)), VP(V("enjoy"), NP(D("a"), N("meat")))), "You enjoy a meat.", "5. VP" );
        assert.equal( S(NP(D("a"), N("girl")), VP(V("have"))), "A girl has.", "6. VP" );
//        assert.equal( VP(), "", "7. VP" );
//        assert.equal( VP(), "", "8. VP" );
//        assert.equal( VP(), "", "9. VP" );
//        assert.equal( VP(), "", "10. VP" );
        
        // AP : Adjective Phrase
        assert.equal( AP(Adv("extremely"), A("pleasant")), "extremely pleasant", "1. AP" );
        assert.equal( AP(Adv("much"), A("quick").f("co")), "much quicker", "2. AP" );
        assert.equal( AP(Adv("very"), A("hard")), "very hard", "3. AP" );
        
        // AdvP : Adverbial Phrase
        assert.equal( AdvP(Adv("very"), Adv("quietly")), "very quietly", "1. AdvP" );
        assert.equal( AdvP(Adv("extremely"), Adv("softly")), "extremely softly", "2. AdvP" );
        assert.equal( AdvP(Adv("totally"), Adv("abruptly")), "totally abruptly", "3. AdvP" );
        
        // PP : Prepositional Phrase
        assert.equal( PP(P("on"), NP(D("a"), N("table"))), "on a table", "1. PP");
        assert.equal( PP(P("by"), NP(D("a"), N("window"))), "by a window", "2. PP");
//        assert.equal( PP(P("in"), ), "", "3. PP"); // in the dark of night
        assert.equal( PP(P("for"), NP(D("a"), N("while"))), "for a while", "4. PP");
//        assert.equal( PP(P("against"), AdvP(Adv("all")), N("odds")), "against all odds", "5. PP");
        assert.equal( PP(P("of"), NP(A("great"), N("talent"))), "of great talent", "6. PP");
        assert.equal( PP(P("with"), NP(D("that"), N("key"))), "with that key", "7. PP");
        assert.equal( PP(P("of"), NP(N("piano"))), "of piano", "8. PP");
        
        // CP : Coordinated Phrase
        assert.equal( CP(C("or"), Pro('me').pe(1), Pro('I').pe(2), Pro('I').pe(3).g("f")), "me, you or she", "1. CP" );
        assert.equal( CP(C("and"), NP(N("cat")), NP(N("dog")), NP(N("snake"))).n("p"), "cats, dogs and snakes", "2. CP" );
        assert.equal( CP(C(","), NP(N("cat")), NP(N("dog")), NP(N("snake"))), "cat, dog, snake", "3. CP" );

        // SP : Propositional Phrase
        assert.equal( S( NP(D("the"), N("mouse"), SP( Adv("that"), NP( D("the"), N("cat")), VP( V("eat").t("ps"))))), "The mouse that the cat ate.", "1. SP");
        assert.equal( NP(D("a"), N("girl"), SP( Pro("who"), VP( V("play"), NP(N("soccer"))))), "a girl who plays soccer", "2. SP(who)");
        assert.equal( NP(D("the"), N("girl").n("p"), SP( Pro("who"), VP( V("play"), NP(N("soccer"))))), "the girls who play soccer", "2. SP(who)");
        });
    } ) ;
} ) ; 