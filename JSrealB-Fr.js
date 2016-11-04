/*
 * Bibliothèque JavaScript JSrealB
 * JSreal v1 http://daou.st/JSreal
 * 
 * v1 Par Nicolas Daoust, sous la direction de Guy Lapalme
 * Université de Montréal
 * 2013
 * 
 * v2 Par Paul Molins, sous la direction de Guy Lapalme
 * Version bilingue, approche systématique à base de tables de règles
 * Université de Montréal
 * 2015
 *
 * v3 Par Francis Gauthier, sous la direction de Guy Lapalme
 * Améliorations apportées à JSrealB
 * Université de Montréal
 * 2016
 */

/*
 * JSrealB Facade
 */
var JSrealE = function(elts, category, transformation) {
    this.unit = null;
    this.realization = null;
    this.category = category;
    this.fct = null;
    this.transformation = transformation || null;
    this.constructor = category;
    this.prop = {};
    this.defaultProp = {};
    this.childrenProp = {};
    this.defaultCtx = {};
    this.ctx = {};
    this.parent = null;
    this.elements = [];
    this.constituents = {head: undefined, modifier: [], subordinate: [], complement: []};
    this.initProp = {};

    var naturalDisplay = true;
    if(this.transformation === JSrealE.ruleType.date)
    {
        this.unit = elts;
    }
    else if(this.transformation === JSrealE.ruleType.number)
    {
        naturalDisplay = false;
        this.unit = elts;
    }
    else if(isString(elts))
    {
        this.unit = elts;
        this.initUnitProperty();
    }
    else if(Array.isArray(elts) || isObject(elts))
    {
        this.elements = elts;
        if(this.category == "SP") this.initUnitProperty();
    }
    
    this.initContext(naturalDisplay);
};

JSrealE.language = {
    english: "en",
    french: "fr"
};

JSrealE.ruleType = {
    conjugation: 1,
    declension: 2,
    regular: 3,
    date: 4,
    number: 5,
    none: 6
};

JSrealE.grammaticalFunction = {
    modifier: 1,
    head: 2,
    subordinate: 3,
    complement: 4
};

//// Init
JSrealE.prototype.initUnitProperty = function() {
    if(this.transformation !== JSrealE.ruleType.none)
    {
        this.defaultProp[JSrealB.Config.get("feature.number.alias")] = JSrealB.Config.get("feature.number.singular");
        this.defaultProp[JSrealB.Config.get("feature.owner.alias")] = JSrealB.Config.get("feature.owner.singular");
        
        if(this.category === JSrealB.Config.get("feature.category.word.verb")
                || this.category === JSrealB.Config.get("feature.category.phrase.verb"))
        {
            this.defaultProp[JSrealB.Config.get("feature.tense.alias")] = JSrealB.Config.get("feature.tense.indicative.present"); // Indicatif présent ou present tense
            this.defaultProp[JSrealB.Config.get("feature.cdInfo.alias")] = {};
        }
    
        // default gender
        var unitFeature = JSrealB.Module.Common.getWordFeature(this.unit, this.category, true);
        var unitGender = (unitFeature !== null) ? unitFeature[JSrealB.Config.get("feature.gender.alias")] : undefined;
        if(unitGender !== undefined)
        {
            this.defaultProp[JSrealB.Config.get("feature.gender.alias")] = unitGender;
        }
        else
        {
            this.defaultProp[JSrealB.Config.get("feature.gender.alias")] = JSrealB.Config.get("feature.gender.masculine");
        }
        
        // default person
        var unitPerson = (unitFeature !== null) ? unitFeature[JSrealB.Config.get("feature.person.alias")] : undefined;
        if(unitPerson !== undefined)
        {
            this.defaultProp[JSrealB.Config.get("feature.person.alias")] = unitPerson;
        }
        else
        {
            this.defaultProp[JSrealB.Config.get("feature.person.alias")] = JSrealB.Config.get("feature.person.p3");        
        }

        //adjective position
        if(this.category === JSrealB.Config.get("feature.category.word.adjective")){
            var adjLex = JSrealB.Config.get("lexicon")[this.unit];
            if(adjLex != undefined){
                adjLex= adjLex[JSrealB.Config.get("feature.category.word.adjective")];
                if(adjLex[JSrealB.Config.get("feature.antepose.alias")] != undefined &&
                     adjLex[JSrealB.Config.get("feature.antepose.alias")] == JSrealB.Config.get("feature.antepose.before")){
                    this.defaultProp[JSrealB.Config.get("feature.antepose.alias")] = JSrealB.Config.get("feature.antepose.before");
                }
                else{
                    this.defaultProp[JSrealB.Config.get("feature.antepose.alias")] = JSrealB.Config.get("feature.antepose.default");
                }
            }
        }
        
    }
};

JSrealE.prototype.initContext = function(naturalDisplay) {
    this.ctx[JSrealB.Config.get("feature.display_option.alias")] = {};
    this.ctx[JSrealB.Config.get("feature.sentence_type.alias")] = {};
    this.ctx[JSrealB.Config.get("feature.html.alias")] = [];
    this.ctx[JSrealB.Config.get("feature.typography.surround")] = [];
    this.defaultCtx[JSrealB.Config.get("feature.display_option.alias")] = {};
    this.defaultCtx[JSrealB.Config.get("feature.display_option.alias")][JSrealB.Config.get("feature.display_option.natural")] = naturalDisplay;
    this.defaultCtx[JSrealB.Config.get("feature.display_option.alias")][JSrealB.Config.get("feature.display_option.relative_time")] = false;
    this.defaultCtx[JSrealB.Config.get("feature.display_option.alias")][JSrealB.Config.get("feature.display_option.raw")] = false;
    this.defaultCtx[JSrealB.Config.get("feature.display_option.alias")][JSrealB.Config.get("feature.display_option.max_precision")] = 2;
    this.defaultCtx[JSrealB.Config.get("feature.display_option.alias")][JSrealB.Config.get("feature.display_option.determiner")] = true;
};

//// Operations / Construction
JSrealE.prototype.getProp = function(propName) {
    var propValue = this.prop[propName];
    
    if(propValue === undefined)
    {
        return this.getDefaultProp(propName);
    }
    
    return propValue;
};

JSrealE.prototype.getDefaultProp = function(propName) {
    var defaultPropValue = this.defaultProp[propName];
    
    if(defaultPropValue === undefined)
    {
        return null;
    }
    
    return defaultPropValue;
};

JSrealE.prototype.getChildrenProp = function(propName) {
    var propValue = this.childrenProp[propName];
    
    if(propValue === undefined)
    {
        return null;
    }
    
    return propValue;
};

JSrealE.prototype.setProp = function(propName, propValue) {
    
    if(this.prop[propName] === undefined)
        this.prop[propName] = propValue;
    
    return this;
};

JSrealE.prototype.setDefaultProp = function(propName, propValue) {
    this.defaultProp[propName] = propValue;
    
    return this;
};

JSrealE.prototype.setChildrenProp = function(propName, propValue) {
    this.childrenProp[propName] = propValue;
    
    return this;
};

JSrealE.prototype.getCtx = function(ctxName) {
    var ctxValue = fetchFromObject(this.ctx, ctxName);
    
    if(ctxValue === undefined)
    {
        return this.getDefaultCtx(ctxName);
    }
    
    return ctxValue;
};

JSrealE.prototype.getDefaultCtx = function(ctxName) {
    var defaultCtxValue = fetchFromObject(this.defaultCtx, ctxName);
    
    if(defaultCtxValue === undefined)
    {
        return null;
    }
    
    return defaultCtxValue;
};

JSrealE.prototype.setCtx = function(ctxName, ctxValue) {
    if(fetchFromObject(this.ctx, ctxName) === undefined)
        fetchFromObject(this.ctx, ctxName, ctxValue);
    
    return this;
};

JSrealE.prototype.addCtx = function(ctxName, ctxValue) {
    if(Array.isArray(fetchFromObject(this.ctx, ctxName))){
        fetchFromObject(this.ctx, ctxName).push(ctxValue);
    }
    return this;
}

JSrealE.prototype.addConstituent = function(element, grammaticalFunction) {
    switch(grammaticalFunction)
    {
        case JSrealE.grammaticalFunction.modifier:
            element.fct = JSrealE.grammaticalFunction.modifier;
            this.constituents.modifier.push(element);
        break;
        case JSrealE.grammaticalFunction.head:
            if(this.constituents.head === undefined
                    || this.constituents.head === null)
            {
                element.fct = JSrealE.grammaticalFunction.head;
                this.constituents.head = element;
                break;
            }
        case JSrealE.grammaticalFunction.subordinate:
            element.fct = JSrealE.grammaticalFunction.subordinate;
            this.constituents.subordinate.push(element);
        break;
        case JSrealE.grammaticalFunction.complement:
            element.fct = JSrealE.grammaticalFunction.complement;
            this.constituents.complement.push(element);
        break;
    }
};

JSrealE.prototype.setInitProp = function(propName, propValue) {
    this.initProp[propName] = propValue;

    return this;
}

JSrealE.prototype.getInitProp = function(propName){
    var propValue = this.initProp[propName];
    
    if(propValue === undefined)
    {
        return null;
    }

    return propValue;
}

/**
 * Propagation from parent to child
 * @param {type} target is a child
 * @param {type} propList to propagate
 * @param {type} valueList to propagate
 */
JSrealE.prototype.topDownFeaturePropagation = function(target, propList, valueList) {
    if(propList !== undefined && valueList !== undefined && propList.length !== valueList.length)
    {
        return false;
    }
    
    var groupPropNameList = (propList === undefined) ? Object.keys(this.prop).concat(Object.keys(this.defaultProp)) : propList;

    var j, nbGroupProp;
    for(j = 0, nbGroupProp = groupPropNameList.length; j < nbGroupProp; j++)
    {
        target.setProp(groupPropNameList[j], 
                ((valueList === undefined) ? this.getProp(groupPropNameList[j]) : valueList[j]));
    }
    
    return true;
};

/**
 * Propagation from element to element on same level
 * @param {type} target is a sibling
 * @param {type} propList to propagate
 * @param {type} valueList to propagate
 */
JSrealE.prototype.siblingFeaturePropagation = function(target, propList, valueList) {
    if(propList !== undefined && valueList !== undefined && propList.length !== valueList.length)
    {
        return false;
    }
    
    var groupPropNameList = (propList === undefined) ? Object.keys(this.prop)
            .concat(Object.keys(this.defaultProp)).concat(Object.keys(this.childrenProp)) : propList;

    var j, nbGroupProp;
    for(j = 0, nbGroupProp = groupPropNameList.length; j < nbGroupProp; j++)
    {
        if(valueList !== undefined)
        {
            target.setDefaultProp(groupPropNameList[j], valueList[j]);
        }
        else if(this.getChildrenProp(groupPropNameList[j]) !== null)
        {
            target.setDefaultProp(groupPropNameList[j], this.getChildrenProp(groupPropNameList[j]));
        }
        else
        {
            target.setDefaultProp(groupPropNameList[j], this.getProp(groupPropNameList[j]));
        }
    }
    
    return true;
};

/**
 * Propagation from child to parent
 * @param {type} target is a parent
 * @param {type} propList to propagate
 * @param {type} valueList to propagate
 */
JSrealE.prototype.bottomUpFeaturePropagation = function(target, propList, valueList) {
    if(propList !== undefined && valueList !== undefined && propList.length !== valueList.length)
    {
        return false;
    }
    
    var groupPropNameList = (propList === undefined) ? Object.keys(this.prop).concat(Object.keys(this.defaultProp)).concat(Object.keys(this.childrenProp)) : propList;
    
    var j, nbGroupProp;
    for(j = 0, nbGroupProp = groupPropNameList.length; j < nbGroupProp; j++)
    {
        if(valueList !== undefined)
        {
            target.setChildrenProp(groupPropNameList[j], valueList[j]);
        }
        else if(this.getChildrenProp(groupPropNameList[j]) !== null)
        {
            target.setChildrenProp(groupPropNameList[j], this.getChildrenProp(groupPropNameList[j]));
        }
        else
        {
            target.setChildrenProp(groupPropNameList[j], this.getProp(groupPropNameList[j]));
        }
    }
    
    return true;
};

//ajout clone pour réutiliser un objet facilement sans la référence
JSrealE.prototype.toObject = function() {

    //Pour ajouter des features au clone, ajouter les setInitProp dans les features voulus
    var nativeString = this.category
    if(this.unit != null){
        nativeString += "\(\""+this.unit+"\"\)";
        for(prop in this.initProp){
            nativeString += "."+prop+"\(\""+this.initProp[prop]+"\"\)";
        }
    }
    else{
        nativeString += "\(";
        for(var i = 0, imax=this.elements.length; i < imax; i++){
            nativeString += this.elements[i].toObject()
            if(i < imax-1) nativeString += ",";
        }
        nativeString += "\)";
    }
    return nativeString;
}
JSrealE.prototype.clone = function(){
    var native = this.toObject();
    var native2 = eval(native);
    return native2;
}

//// Word Features / Properties
// tense
JSrealE.prototype.t = function(tense) {
    if(!contains(JSrealB.Config.get("feature.tense"), tense))
    {
        throw JSrealB.Exception.invalidInput(tense, "tense");
    }
    this.setInitProp(JSrealB.Config.get("feature.tense.alias"),tense)
    return this.setProp(JSrealB.Config.get("feature.tense.alias"), tense);
};
// person
JSrealE.prototype.pe = function(person) {
    if(!isNumeric(person) || person < 1 || person > 3)
    {
        throw JSrealB.Exception.invalidInput(person, "person");
    }
    this.setInitProp(JSrealB.Config.get("feature.person.alias"),person)
    return this.setProp(JSrealB.Config.get("feature.person.alias"), (isString(person) ? intVal(person) : person));
};
 // grammatical gender
JSrealE.prototype.g = function(grammaticalGender) {
    if(!contains(JSrealB.Config.get("feature.gender"), grammaticalGender))
    {
        throw JSrealB.Exception.invalidInput(grammaticalGender, "gender");
    }
    this.setInitProp(JSrealB.Config.get("feature.gender.alias"),grammaticalGender);
    return this.setProp(JSrealB.Config.get("feature.gender.alias"), grammaticalGender);
};
// grammatical number
JSrealE.prototype.n = function(grammaticalNumber) {
    if(!contains(JSrealB.Config.get("feature.number"), grammaticalNumber))
    {
        throw JSrealB.Exception.invalidInput(grammaticalNumber, "number");
    }
    this.setInitProp(JSrealB.Config.get("feature.number.alias"),grammaticalNumber)
    return this.setProp(JSrealB.Config.get("feature.number.alias"), grammaticalNumber);
};
// form (superlative / comparative)
JSrealE.prototype.f = function(form) {
    if(!contains(JSrealB.Config.get("feature.form"), form))
    {
        throw JSrealB.Exception.invalidInput(form, "form");
    }
    return this.setProp(JSrealB.Config.get("feature.form.alias"), form);
};
// owner
JSrealE.prototype.ow = function(owner) {
    if(!contains(JSrealB.Config.get("feature.owner"), owner))
    {
        throw JSrealB.Exception.invalidInput(owner, "owner");
    }
    this.setInitProp(JSrealB.Config.get("feature.owner.alias"),owner);
    return this.setProp(JSrealB.Config.get("feature.owner.alias"), owner);
};
//adjectif anteposé
JSrealE.prototype.pos = function(antepose) {
    if(!contains(JSrealB.Config.get("feature.antepose"), antepose))
    {
        throw JSrealB.Exception.invalidInput(antepose, "antéposé")
    }
    return this.setProp(JSrealB.Config.get("feature.antepose.alias"), antepose);
}
//// Typography / Html / Context
// first char in upper case
JSrealE.prototype.cap = function(ucf) {
    if(!isBoolean(ucf) && ucf !== undefined)
    {
        throw JSrealB.Exception.invalidInput(ucf, "ucf");
    }
    return this.setCtx(JSrealB.Config.get("feature.typography.ucfist"), (ucf === undefined || ucf === true));
};
// punctuation before an element
JSrealE.prototype.b = function(punctuation) {
    return this.setCtx(JSrealB.Config.get("feature.typography.before"), punctuation);
};
// punctuation after an element
JSrealE.prototype.a = function(punctuation) {
    return this.setCtx(JSrealB.Config.get("feature.typography.after"), punctuation);
};
// punctuation around an element
JSrealE.prototype.en = function(punctuation) {
    return this.addCtx(JSrealB.Config.get("feature.typography.surround"), punctuation);
};
//Liaison forçée en français
JSrealE.prototype.lier = function() {
    return this.setCtx(JSrealB.Config.get("feature.liaison.alias"),true);
};
//Ajout types de phrases
JSrealE.prototype.typ = function(optionList){
    if(optionList !== undefined && isObject(optionList))
    {
        var optionKeyList = Object.keys(optionList);
        for(var i = 0, length = optionKeyList.length; i < length; i++)
        {
            if(JSrealB.Config.get("feature.sentence_type.context_wise").indexOf(optionKeyList[i])>=0){
                this.setCtx(JSrealB.Config.get("feature.sentence_type.alias") 
                    + "." + optionKeyList[i], optionList[optionKeyList[i]]);
            }
            else{
                this.setProp(JSrealB.Config.get("feature.verb_option.alias") 
                        + "." + optionKeyList[i], optionList[optionKeyList[i]]);
                this.setInitProp(JSrealB.Config.get("feature.verb_option.alias") 
                        + "." + optionKeyList[i], optionList[optionKeyList[i]]);
            }
            
        }        
        return this;
    }
    
    return null;
}
//temps perfect (anglais)
JSrealE.prototype.perf = function(t_f){
    if(typeof t_f != "boolean"){
        throw JSrealB.Exception.invalidInput(t_f, "perfect tense");
    }
    if(t_f){
        this.setProp(JSrealB.Config.get("feature.verb_option.alias") 
                + "." + JSrealB.Config.get("feature.verb_option.perfect"), true);
        this.setInitProp(JSrealB.Config.get("feature.verb_option.alias") 
                + "." + JSrealB.Config.get("feature.verb_option.perfect"), true);
    }
    return this;
}   
//Auxiliaires forcés
JSrealE.prototype.aux = function(a){
    try{
        if(!contains(JSrealB.Config.get("rule.compound.aux"), a)){
            throw JSrealB.Exception.invalidInput(a, "auxiliary");
        }
        return this.setProp(JSrealB.Config.get("rule.compound.alias"),a);
    }
    catch(e){return this;}//english
}
// Natural
JSrealE.prototype.nat = function(natural) {
    if(!isBoolean(natural) && natural !== undefined)
    {
        throw JSrealB.Exception.invalidInput(natural, "natural");
    }
    
    return this.setCtx(JSrealB.Config.get("feature.display_option.alias")
            + "." + JSrealB.Config.get("feature.display_option.natural"), 
                (natural === undefined || natural === true));
};
// Display option
JSrealE.prototype.dOpt = function(optionList) {
    if(optionList !== undefined && isObject(optionList))
    {
        var optionKeyList = Object.keys(optionList);
        for(var i = 0, length = optionKeyList.length; i < length; i++)
        {
            this.setCtx(JSrealB.Config.get("feature.display_option.alias") 
                    + "." + optionKeyList[i], optionList[optionKeyList[i]]);
        }
        
        return this;
    }
    
    return null;
};
JSrealE.prototype.tag = function(elt, attr) {
    var tag = [elt,attr];
    //this.addCtx(JSrealB.Config.get("feature.html.element"), elt);
    //this.addCtx(JSrealB.Config.get("feature.html.attribute"), attr);
    this.addCtx(JSrealB.Config.get("feature.html.alias"), tag);
    return this;
};
//// Agreement
JSrealE.prototype.sortWord = function() {}; // Abstract

JSrealE.prototype.phraseToElementPropagation = function(element) {
    if(element.fct === JSrealE.grammaticalFunction.modifier)
    {
        this.topDownFeaturePropagation(element);
    }
    else if(element.fct === JSrealE.grammaticalFunction.head)
    {
        this.topDownFeaturePropagation(element);
    }
    else if(element.fct === JSrealE.grammaticalFunction.subordinate)
    {
        if(this.constituents.head === null)
        {
            this.topDownFeaturePropagation(element);
        }
    }
    
    return this;
};

JSrealE.prototype.elementToElementPropagation = function(element) {
    if(element.fct === JSrealE.grammaticalFunction.modifier) 
    {
        if(this.constituents.head !== null)
        {
            element.siblingFeaturePropagation(this.constituents.head);
        }
    }
    else if(element.fct === JSrealE.grammaticalFunction.head)
    {
        for(var i = 0, length = this.constituents.subordinate.length; i < length; i++)
        {
            element.siblingFeaturePropagation(this.constituents.subordinate[i]);
        }
    }
};

JSrealE.prototype.elementToPhrasePropagation = function(element) {
    if(element.fct === JSrealE.grammaticalFunction.head)
    {
        element.bottomUpFeaturePropagation(this);
    }
};
//// Transformation
JSrealE.prototype.toString = function() {
    return this.real();
};

JSrealE.prototype.real = function() {
    if(this.elements.length > 0) // group
    {
        this.sortWord();
        if(this.constituents.head !== undefined)
        {
            var eltList = this.createRealizationList();          

            this.realizeGroup(eltList);

            this.modifyStructure();

            this.realization = this.printElements();
          
            return this.typography(this.html(this.phonetic(this.realization)));
        }
        else
        {
            throw JSrealB.Exception.headWordNotFound(this.category);
        }
    }
    else // terminal element
    {
        var realization = this.realizeTerminalElement();
        return this.typography(this.html(this.phonetic(realization)));
    }
};


JSrealE.prototype.createRealizationList = function() {
    var eltList = [];
    if(this.constituents.modifier !== undefined && this.constituents.modifier.length > 0)
        eltList = eltList.concat(this.constituents.modifier);
    
    if(this.constituents.head !== undefined && this.constituents.head !== null)
        eltList.push(this.constituents.head);
    
    if(this.constituents.subordinate !== undefined && this.constituents.subordinate.length > 0)
        eltList = eltList.concat(this.constituents.subordinate);
    
    if(this.constituents.complement !== undefined && this.constituents.complement.length > 0)
        eltList = eltList.concat(this.constituents.complement);

    return eltList;
};


JSrealE.prototype.realizeGroup = function(elementList) {
    var i, length;
    var e = null;
    //console.log(this);
    for(i = 0, length = elementList.length; i < length; i++)
    {
        e = elementList[i];
        
        e.parent = this;//.category;
        
        this.phraseToElementPropagation(e);

        e.realization = (e instanceof JSrealE) ? e.real() : "";
        
        this.elementToElementPropagation(e);
        this.elementToPhrasePropagation(e);
    }
};

JSrealE.prototype.add = function(childElement, pos){
    if(pos == undefined){
        var pos = this.elements.length;
    }
    this.constituents = {head: undefined, modifier: [], subordinate: [], complement: []};
    
    this.addNewElement(pos,childElement);

    this.sortWord();

    this.resetProp(false);

    return this;
}

JSrealE.prototype.deleteElement = function(elemIndex) {
    var imax = this.elements.length;
    for(var i = elemIndex; i < imax; i++){
        this.elements[i] = this.elements[i+1];
    }
    delete this.elements[i+1];
    this.elements.length -=1;
}


JSrealE.prototype.addNewElement = function(elemIndex, elementAdd) {
    if(elementAdd instanceof JSrealE){
        elementAdd.parent = this;
    }
    var imax = this.elements.length;
    var temp = this.elements[elemIndex];
    this.elements[elemIndex] = elementAdd;
    for(var i =elemIndex+1; i<imax+1; i++){
        var temp2 = this.elements[i];
        this.elements[i] = temp;
        temp = temp2;
    }
    this.elements.length +=1;
}


JSrealE.prototype.getTreeRoot = function(strict) {
    strict = strict || true;
    if(this.category == JSrealB.Config.get("feature.category.phrase.sentence"))
        return this;
    else if(!strict && this.category == JSrealB.Config.get("feature.category.phrase.propositional")){
        return this;
    }else if(this.parent!= null){
        return this.parent.getTreeRoot(strict);
    }

    throw "Could not find tree root (S or SP)";
}


JSrealE.prototype.resetProp = function(recursive) {
    
    this.childrenProp ={}
    if(this.category == "VP") this.initUnitProperty(); //reset defaultProp   
    this.prop = {}

    for(var p in this.initProp){
        //remettre les propriétés initiales dictées par l'utilisateur dans le nouvel arbre
        this.setProp(p,this.initProp[p])
    }
    this.prop["vOpt.pas"]=false; //empêche une récursion infinie

    if(this.elements.length > 0){
        this.constituents = {head: undefined, modifier: [], subordinate: [], complement: []};
        //this.sortWord()  // il y en a un dans chaque appel de real()
    }    
    //this.defaultProp = {}
    if(recursive){
        var imax = this.elements.length
        for(var i = 0; i < imax; i++){

            var child = this.elements[i];
            if(child instanceof JSrealE){
                child.resetProp(recursive);    
            }            
        }
    }
}

var getSubject = function(sObject){
    if(sObject.category == JSrealB.Config.get("feature.category.phrase.sentence") 
        || sObject.category == JSrealB.Config.get("feature.category.phrase.propositional")){
        var elemList = sObject.elements;
        var imax = elemList.length;
        var SubjPos = -1;
        for(var i = 0; i < imax; i++){
            if(elemList[i].category == JSrealB.Config.get("feature.category.phrase.noun")
                    || (elemList[i].category == JSrealB.Config.get("feature.category.word.pronoun") && elemList[i].unit == JSrealB.Config.get("rule.usePronoun.S"))){
                SubjPos = i;
            }
            if(elemList[i].category == JSrealB.Config.get("feature.category.phrase.verb")){
                //on essaie de trouver le sujet avant le VP. Évite d'effacer un complément de phrase qui serait un NP
                break;
            }
        }
        return SubjPos;
    }
    else{
        throw "Not a Sentence type, could not find subject";
    }
}
    
var getGroup = function(sObject,groupAlias){
    var elemList = sObject.elements;
    var imax = elemList.length;
    var gPos = -1;
    for(var i = 0; i < imax; i++){
        if(elemList[i].category == groupAlias){
            gPos = i;
            return gPos;
        }
    }
    return gPos;
}

JSrealE.prototype.modifyStructure = function() {

    var elemList = this.elements;
    var change = false;
    var imax = elemList.length;
    //console.log(this)
    
    //Passif (inversion du sujet et de l'objet direct)
    if(this.getChildrenProp(JSrealB.Config.get("feature.verb_option.alias")+".pas") == true){
        if(this.category == JSrealB.Config.get("feature.category.phrase.verb")){
            var parent = this.getTreeRoot();
            var verbe = this.constituents.head;
            this.recursion = (this.recursion == null)?1:this.recursion+1; //help to debug infinite recursion
            if(this.recursion != null && this.recursion > 10){
                JSrealB.Logger.alert("Could not resolve the passive tense of "+verbe.unit);
                this.childrenProp[JSrealB.Config.get("feature.verb_option.alias")+".pas"] = false;
                return ""; // probably infinite recursion 
            } 

            //get subject
            var subjectPos = getSubject(parent);
            
            //get CD
            var CDpos = getGroup(this, JSrealB.Config.get("feature.category.phrase.noun"));
            var VPos = getGroup(this, JSrealB.Config.get("feature.category.word.verb"))

            if(subjectPos!= -1 && CDpos != -1){
                var suj= parent.elements[subjectPos];
                if(suj.category == JSrealB.Config.get("feature.category.word.pronoun")) suj.unit = JSrealB.Config.get("rule.usePronoun."+JSrealB.Config.get("feature.category.word.pronoun")); 
                var cd = elemList[CDpos];
                //inversion
                parent.elements[subjectPos] = cd;
                elemList[CDpos] = suj;

                verbe.setInitProp("vOpt.pas",true);
                verbe.setInitProp("vOpt.hasSubject",true);
                
                parent.resetProp(true);
                change = true;
            }
            else if(subjectPos != -1){
                var suj= parent.elements[subjectPos];
                if(suj.category == JSrealB.Config.get("feature.category.word.pronoun")) suj.unit = JSrealB.Config.get("rule.usePronoun."+JSrealB.Config.get("feature.category.word.pronoun"));
                this.addNewElement(VPos+1,parent.elements[subjectPos]);
                parent.deleteElement(subjectPos);

                verbe.setInitProp("vOpt.pas",true);
                verbe.setInitProp("vOpt.hasSubject",true);
                
                parent.resetProp(true);
                change = true;

            }
            else if(CDpos != -1){
                var VPpos = getGroup(parent,JSrealB.Config.get("feature.category.phrase.verb"));
                parent.addNewElement(VPpos,elemList[CDpos]);//will bump the verb and place the cd just before
                this.deleteElement(CDpos);

                verbe.setInitProp("vOpt.pas",true);

                parent.resetProp(true);
                change = true;
            }
        }
    }
    //Pronominalisation d'un groupe du nom
    if(this.getCtx(JSrealB.Config.get("feature.toPronoun.alias")) == true){
        try{
            var parent = this.parent;
            var np = getGroup(parent,JSrealB.Config.get("feature.category.phrase.noun"));
            var pro = JSrealB.Config.get("rule.usePronoun."+parent.category);
            var pronoun = new Pro(pro).pe(this.getChildrenProp(JSrealB.Config.get("feature.person.alias")))
                                        .n(this.getChildrenProp(JSrealB.Config.get("feature.number.alias")))
                                        .g(this.getChildrenProp(JSrealB.Config.get("feature.gender.alias")));
            var cdInfo = {n:this.getChildrenProp(JSrealB.Config.get("feature.number.alias")),g:this.getChildrenProp(JSrealB.Config.get("feature.gender.alias"))}
            parent.deleteElement(np);
            switch(parent.category){
                case JSrealB.Config.get("feature.category.phrase.sentence"):
                case JSrealB.Config.get("feature.category.phrase.prepositional"):    
                    //Sujet ou objet indirect
                    parent.addNewElement(np,pronoun);
                    this.ctx[JSrealB.Config.get("feature.toPronoun.alias")] = false;
                    //parent.resetProp(true);
                break;
                case JSrealB.Config.get("feature.category.phrase.verb"):
                    //Objet direct
                    if(JSrealB.Config.get("language")==JSrealE.language.english){
                        parent.addNewElement(np,pronoun);
                        parent.resetProp(true);
                    }
                    else{
                        var vp = getGroup(parent,JSrealB.Config.get("feature.category.word.verb"));
                        parent.addNewElement(vp,pronoun);
                        parent.resetProp(true);
                        var vp = getGroup(parent,JSrealB.Config.get("feature.category.word.verb"));
                        parent.elements[vp].setProp(JSrealB.Config.get("feature.cdInfo.alias"),cdInfo);
                    }                    
                break;
            }
            change =true;
        }
        catch(e){
            console.log("Cette pronominalisation n'est pas supportée: "+e)
        }
    }
    //Impératif (retrait du Sujet)
    if(this.getChildrenProp(JSrealB.Config.get("feature.tense.alias")) == JSrealB.Config.get("feature.tense.imperative.present")){
        if(this.category == JSrealB.Config.get("feature.category.phrase.sentence")){
            var NPpos = getSubject(this);
            if(NPpos != -1){
                this.deleteElement(NPpos);
                change = true;     
            }
        }
    }

    //Interrogatif (français)
    var int = this.getCtx(JSrealB.Config.get("feature.sentence_type.alias"))[JSrealB.Config.get("feature.sentence_type.interrogative")];
    if(int!= undefined){
        if(int!= false){
            if(!contains(JSrealB.Config.get("feature.sentence_type.interro_prefix"),int) || int == true)int = 'base';

            change = this.interrogationForm(int);
        }
    }    

    if(change){
        var racine = this.getTreeRoot();
        var newStringFromRacine = racine.toString();
        return newStringFromRacine;  
    }
    return "";
};


//Ajout fonction pour ordonner les groupes du nom avec adjectifs
JSrealE.prototype.arrangeNP = function (elemList) {
    var nounIndex = -1;
    var adjIndexes = [];
    for(var i = 0, j = 0, length = elemList.length; i < length; i++)
    {
        var eCategory = elemList[i].category;
        if(eCategory == JSrealB.Config.get("feature.category.word.noun"))
        {
            nounIndex = i;
        }
        else if(eCategory == JSrealB.Config.get("feature.category.word.adjective") || eCategory == JSrealB.Config.get("feature.category.phrase.adjective"))
        {
            adjIndexes.push(i);
        }
    }
    if(adjIndexes == []){
        //no adjective
        return elemList;
    }
    for(var i=0; i < adjIndexes.length; i++){
        var adjIndex = adjIndexes[i];
        var adj = elemList[adjIndex];
        if(elemList[adjIndex].getProp(JSrealB.Config.get("feature.antepose.alias")) == JSrealB.Config.get("feature.antepose.before")){
            if(adjIndex > nounIndex){
                this.deleteElement(adjIndex);
                this.addNewElement(nounIndex,adj);
            }
        }
        else if(elemList[adjIndex].getProp(JSrealB.Config.get("feature.antepose.alias")) == JSrealB.Config.get("feature.antepose.after")){
            if(adjIndex < nounIndex){
                this.deleteElement(adjIndex);
                this.addNewElement(nounIndex,adj);
            }
        }
    }
    return elemList;
}

JSrealE.prototype.printElements = function() {
    var elementList = this.elements;
    var separator = " ";
    var lastSeparator = " ";

    if(this.category === JSrealB.Config.get("feature.category.phrase.noun") && JSrealB.Config.get("language")==JSrealE.language.french){
        //s'assurer que le nom et l'adjectif sont dans le bon ordre 
        elementList = this.arrangeNP(elementList);
    }
    
    // COORDINATED PHRASE
    var conjunction = this.getCtx(JSrealB.Config.get("feature.category.word.conjunction"));
    if(this.category === JSrealB.Config.get("feature.category.phrase.coordinated")
            && conjunction !== null)
    {
        if(JSrealB.Module.Punctuation.isValid(conjunction))
        {
            separator = JSrealB.Module.Punctuation.after("", conjunction);
            lastSeparator = separator;
        }
        else 
        {
            separator = ", ";
            lastSeparator = " " + conjunction + " ";
        }

        // we remove conjunction from elementList
        var newElementList = [];
        for(var i = 0, j = 0, length = elementList.length; i < length; i++)
        {
            if(elementList[i].category !== JSrealB.Config.get("feature.category.word.conjunction"))
            {
                newElementList[j++] = elementList[i];
            }
        }
        elementList = newElementList;
    }
    
    var result = this.printEachElement(elementList, separator, lastSeparator);

    var addFullStop = false;
    var upperCaseFirstLetter = false;
    
    if(this.parent === null
        && this.category === JSrealB.Config.get("feature.category.phrase.sentence"))
    {
        addFullStop = (this.getCtx(JSrealB.Config.get("feature.typography.surround")).length == 0);
        upperCaseFirstLetter = (this.getCtx(JSrealB.Config.get("feature.typography.ucfist")) === null);

        var lastPunctuation = "";
        var interro = this.getCtx(JSrealB.Config.get("feature.sentence_type.interrogative"));
        if(interro == true){
          lastPunctuation += JSrealB.Config.get("rule.sentence_type.int.punctuation");
          // if(this.getCtx("firstAux")!=null)result= this.getCtx("firstAux")+" "+result;  
        } 
        var exclama = this.getCtx(JSrealB.Config.get("feature.sentence_type.alias"))[JSrealB.Config.get("feature.sentence_type.exclamative")];
        if(exclama == true) lastPunctuation += JSrealB.Config.get("rule.sentence_type.exc.punctuation");
        if(JSrealB.Config.get("language")=="en" && lastPunctuation=="?!")lastPunctuation="?"; //No double punctuation un English
        if(lastPunctuation == undefined){
            lastPunctuation += JSrealB.Config.get("rule.sentence_type.dec.punctuation");
        }

    }
    
    result = phraseFormatting(result, upperCaseFirstLetter, addFullStop, lastPunctuation);
    
    return result;
};

JSrealE.prototype.printEachElement = function(elementList, separator, lastSeparator) {
    var result = "";
    var i, listLength;
    var currentSeparator = "";
    var elm = null;
    for(i = 0, listLength = elementList.length; i < listLength; i++)
    {
        elm = elementList[i];
        
        if(i === listLength - 1) // dernier
        {
            currentSeparator = "";
        }
        else if(elm instanceof JSrealE && elm.getCtx(JSrealB.Config.get("feature.liaison.alias")) == true)
        {
            currentSeparator = "-";
        }
        else if(i === listLength - 2) // avant dernier
        {
            currentSeparator = lastSeparator;
        }        
        else
        {
            currentSeparator = separator;
        }

        if(elm instanceof JSrealE)
        {
            if(elm.realization !== null && elm.realization !== undefined)
            {
                result += elm.realization + currentSeparator;
            }
            else if(elm.unit !== null && elm.unit !== undefined)
            {
                result += "[[" + elm.unit + "]]" + currentSeparator;
            }
            else
            {
                JSrealB.Logger.alert("Undefined unit and realization attributes of element : " + JSON.stringify(elm));
            }
        }
        else if(isString(elm))
        {
            result += elm + currentSeparator;
        }
    }
    
    return result;
};

JSrealE.prototype.realizeTerminalElement = function() {
    if(this.elements.length === 0)
    {
        if(this.transformation === JSrealE.ruleType.declension)
        {
            return this.realizeDeclension();
        }
        else if(this.transformation === JSrealE.ruleType.conjugation)
        {
            var conjugation = this.realizeConjugation();
            //La forme interrogative anglaise met le premier auxiliaire en face
            try{
                var intCtx = this.getTreeRoot(true).getCtx(JSrealB.Config.get("feature.sentence_type.alias")+"."+JSrealB.Config.get("feature.sentence_type.interrogative"))
                if(JSrealB.Config.get("language")=="en" && (intCtx==true || contains(JSrealB.Config.get("feature.sentence_type.interro_prefix"),intCtx) 
                    || this.getTreeRoot(true).getCtx("firstAux")!=null)){
                    conjugation = this.putAuxInFront(conjugation);
                }
            }catch(e){console.warn("Error while moving aux:"+e)}
            return conjugation;
        }
        else if(this.transformation === JSrealE.ruleType.regular)
        {
            return this.realizeRegularTransformation();
        }
        else if(this.transformation === JSrealE.ruleType.none)
        {
            return this.unit;
        }
        else if(this.transformation === JSrealE.ruleType.date)
        {
            return this.realizeDate();
        }
        else if(this.transformation === JSrealE.ruleType.number)
        {
            return this.realizeNumber();
        }
        else
        {
            return "[[" + this.unit + "]]";
        }
    }
    
    return null;
};

JSrealE.prototype.putAuxInFront = function(conjug) {
    //création de token, comme pour l'élision
    var mots=conjug.split(" ");
    var htmlTagRegex =/\s*(<[^>]*>)|\s+/ig;
    var mots = conjug.split(htmlTagRegex);
    for(var i = 0, length1 = mots.length; i < length1; i++) { if(mots[i] === undefined) mots.splice(i, 1); } // fix : remove undefined
    var length2=mots.length;
    if(length2>=2){
        var tokens=mots.map(function(mot){return new Tokn(mot)});
    }
    else{
	   var tokens = [];
	   tokens[0]=new Tokn(mots[0]);
    }
    var roote = this.getTreeRoot();
    
    roote.setCtx("firstAux",tokens[0].toString());
    tokens.shift();
    newMots = "";
        for(var j = 0, length3 = tokens.length; j < length3; j++)
        {
            newMots += tokens[j] + ((tokens[j].mot.charAt(0) === "<" 
                    || (j+1 < length3 && tokens[j+1].mot.slice(0, 2) === "</")
                    || j+1 >= length3) ? "" : " ");
        }
    return newMots;
    
};

JSrealE.prototype.realizeConjugation = function() {
    var tense = this.getProp(JSrealB.Config.get("feature.tense.alias"));
    if( tense == JSrealB.Config.get("feature.tense.imperative.present")){
        this.defaultProp[JSrealB.Config.get("feature.person.alias")] = JSrealB.Config.get("feature.person.p2");
    }
    var person = this.getProp(JSrealB.Config.get("feature.person.alias"));
    var number = this.getProp(JSrealB.Config.get("feature.number.alias"));

    var gender = this.getProp(JSrealB.Config.get("feature.gender.alias"));
    var verbOptions = { neg: this.getProp(JSrealB.Config.get("feature.verb_option.alias")+"."+JSrealB.Config.get("feature.verb_option.negation")),
                        pas: this.getProp(JSrealB.Config.get("feature.verb_option.alias")+"."+JSrealB.Config.get("feature.verb_option.passive")) || 
                            this.getInitProp(JSrealB.Config.get("feature.verb_option.alias")+"."+JSrealB.Config.get("feature.verb_option.passive")),
                        prog:this.getProp(JSrealB.Config.get("feature.verb_option.alias")+"."+JSrealB.Config.get("feature.verb_option.progressive")),
                        perf:this.getProp(JSrealB.Config.get("feature.verb_option.alias")+"."+JSrealB.Config.get("feature.verb_option.perfect")),
                        hasSubject:this.getProp(JSrealB.Config.get("feature.verb_option.alias")+".hasSubject")};

    try{
        verbOptions.interro = this.getTreeRoot(true).getCtx(JSrealB.Config.get("feature.sentence_type.alias")
                                                              +"."+JSrealB.Config.get("feature.sentence_type.interrogative"));
        if(this.getTreeRoot(true).getCtx("firstAux")!=null)verbOptions.interro = "old";
    }catch(e){}

    var aux = this.getProp(JSrealB.Config.get("rule.compound.alias"));
    try{
        if(contains(JSrealB.Config.get("rule.compound.aux"),aux)){
            var auxF=aux;
        }
    }
    catch(e){var auxF="";/*english doesn't have rule.compund.aux*/}

    var cdProp = this.getProp(JSrealB.Config.get("feature.cdInfo.alias"));
    if(this.getInitProp(JSrealB.Config.get("feature.verb_option.alias")+"."+JSrealB.Config.get("feature.verb_option.passive")) == true){
        verbOptions.pas = true;
    }
    if(!(verbOptions.prog == true || verbOptions.pas == true || verbOptions.perf == true)){
        verbOptions.native = true; //needed for simple tense negative in english 
    }
    if(number === JSrealB.Config.get("feature.number.plural"))
    {
        person += 3;
    }
    return JSrealB.Module.Conjugation.conjugate(this.unit, tense, person, gender, verbOptions, cdProp, auxF);
};

JSrealE.prototype.getFirst = function(alias) {
    for(var i = 0, imax = this.elements.length; i < imax; i++){
        if(this.elements[i].category == alias || alias == "any"){
            return this.elements[i];
        }
    }
    return null;
}

JSrealE.prototype.realizeDeclension = function() {
    var feature = {};
    feature[(JSrealB.Config.get("feature.gender.alias"))] = this.getProp(JSrealB.Config.get("feature.gender.alias"));
    feature[(JSrealB.Config.get("feature.number.alias"))] = this.getProp(JSrealB.Config.get("feature.number.alias"));
    feature[(JSrealB.Config.get("feature.form.alias"))] = this.getProp(JSrealB.Config.get("feature.form.alias"));
    feature[(JSrealB.Config.get("feature.person.alias"))] = this.getProp(JSrealB.Config.get("feature.person.alias"));
    feature[(JSrealB.Config.get("feature.owner.alias"))] = this.getProp(JSrealB.Config.get("feature.owner.alias"));

    return JSrealB.Module.Declension.decline(this.unit, this.category, feature);
};

JSrealE.prototype.realizeRegularTransformation = function() {
    return JSrealB.Module.RegularRule.apply(this.unit, this.category);
};

JSrealE.prototype.realizeDate = function() {
    var date;
    if(this.unit instanceof Date)
    {
        date = this.unit;
    }
    else if(typeof this.unit === "string"
            && this.unit.length > 0
            && (new Date(this.unit)).toString() === "Invalid Date")
    {
        throw JSrealB.Exception.wrongDate(this.unit);
    }
    else if(typeof this.unit === "string")
    {
        date = new Date(this.unit);
    }
    else
    {
        date = new Date();
    }
    
    if(this.getCtx(JSrealB.Config.get("feature.display_option.alias") 
            + "." + JSrealB.Config.get("feature.display_option.relative_time")))
    {
        return JSrealB.Module.Date.toRelativeTime(date, this.getCtx(JSrealB.Config.get("feature.display_option.alias")));
    }
    else if(this.getCtx(JSrealB.Config.get("feature.display_option.alias") 
            + "." + JSrealB.Config.get("feature.display_option.natural")))
    {
        return JSrealB.Module.Date.toWord(date, this.getCtx(JSrealB.Config.get("feature.display_option.alias")));
    }
    else
    {
        return JSrealB.Module.Date.formatter(date, this.getCtx(JSrealB.Config.get("feature.display_option.alias")));
    }
};

JSrealE.prototype.realizeNumber = function() {
    var currentElement = this;
    var number = this.unit;

    
    var updateGrammaticalNumber = function(grammaticalNumber) {
        currentElement.setDefaultProp(JSrealB.Config.get("feature.number.alias"), grammaticalNumber);
    }
    
    if(this.getCtx(JSrealB.Config.get("feature.display_option.alias")
            + "." + JSrealB.Config.get("feature.display_option.raw")))
    {
        return number.toString();
    }
    else if(this.getCtx(JSrealB.Config.get("feature.display_option.alias") 
            + "." + JSrealB.Config.get("feature.display_option.natural")))
    {   
        try{
            if(this.getProp(JSrealB.Config.get("feature.gender.alias"))){
                var numGender = this.getProp(JSrealB.Config.get("feature.gender.alias"));
            }
            else if(this.parent != null){
                var noyau = this.parent.constituents.head;
                if(noyau !== null){
                    var numGender = noyau.getProp(JSrealB.Config.get("feature.gender.alias"));
                }else{var numGender = "m"}
            }else{var numGender = "m"}

        return JSrealB.Module.Number.toWord(number, 
                this.getCtx(JSrealB.Config.get("feature.display_option.alias")
                + "." + JSrealB.Config.get("feature.display_option.max_precision")), 
                updateGrammaticalNumber,
                JSrealB.Config.get("language"), 
                numGender).toString();
        }
        catch(e){
            console.warn("Error with number to word:"+e)
        }
        
    }
    else
    {   //enters here     
        return JSrealB.Module.Number.formatter(number, 
                this.getCtx(JSrealB.Config.get("feature.display_option.alias")
                + "." + JSrealB.Config.get("feature.display_option.max_precision")), 
                updateGrammaticalNumber).toString();
    }
};

JSrealE.prototype.typography = function(str) {
    var result = str;
    if(this.getCtx(JSrealB.Config.get("feature.typography.ucfist")) === true)
    {
        result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    
    var pcBefore = this.getCtx(JSrealB.Config.get("feature.typography.before"));
    if(pcBefore !== null)
    {
        result = JSrealB.Module.Punctuation.before(result, pcBefore);
    }
    
    var pcAfter = this.getCtx(JSrealB.Config.get("feature.typography.after"));
    if(pcAfter !== null)
    {
        result = JSrealB.Module.Punctuation.after(result, pcAfter);
    }
    
    var pcSurround = this.getCtx(JSrealB.Config.get("feature.typography.surround")); //liste de surround
    if(pcSurround.length > 0){
        for(var i=0; i < pcSurround.length; i++){
            result = JSrealB.Module.Punctuation.surround(result, pcSurround[i]);    
        }        
    }
    
    return trim(result);
};

JSrealE.prototype.html = function(content) {
    var output = content;
    
    var htmltags = this.getCtx(JSrealB.Config.get("feature.html.alias")); //liste de paires elm/attr
    
    var addTag = function(elt, attr){
        var attrStr = "";
        if(attr !== null && attr !== undefined)
        {
            var attrKeyList = Object.keys(attr);
            var length = attrKeyList.length;
            for(var i = 0; i < length; i++)
            {
                attrStr += " " + attrKeyList[i] + '="' + attr[attrKeyList[i]] + '"';
            }
        }
        return "<" + elt + attrStr + ">" + output + "</" + elt + ">";

    }

    if(htmltags.length > 0)
    {
        if(Array.isArray(htmltags)){
            //this.setCtx("htmlTags",elt.length);
            for(var i=0; i < htmltags.length; i++){
            
                var elt = htmltags[i][0];
                var attr = htmltags[i][1];
                output = addTag(elt, attr);
            }
        }
        else{
            output = addTag(elts, attrs);                
        }
        
    }
    return output;
};

JSrealE.prototype.phonetic = function(content) {
    var newContent = content;

    // patch pour l'élision et la contraction en français et un peu en anglais (a => an)

    var mots=newContent.split(" ");
    var htmlTagRegex =/\s*(<[^>]*>)|\s+/ig;
    var mots = newContent.split(htmlTagRegex);
    for(var i = 0, length1 = mots.length; i < length1; i++) { if(mots[i] === undefined) mots.splice(i, 1); } // fix : remove undefined
    var length2=mots.length;
    if(length2>=2){
         // crée des Tokens qui devraient venir d'ailleurs...
        var tokens=mots.map(function(mot){return new Tokn(mot)});
            
        if(JSrealB.Config.get("language")=="fr"){
            tokens = eliderMots([tokens.shift()],tokens);
        }
        else{
            tokens = aToAn([tokens.shift()],tokens);
        }
        newContent = "";
        for(var j = 0, length3 = tokens.length; j < length3; j++)
        {
            //if(tokens[j].mot=="")continue;
            newContent += tokens[j] + ((tokens[j].mot.charAt(0) === "<" 
                    || (j+1 < length3 && tokens[j+1].mot.slice(0, 2) === "</")
                    || j+1 >= length3) ? "" : " ");
        }
    }
    

    return newContent;
};

//// Utils
var phraseFormatting = function(str, upperCaseFirstLetter, addFullStop, lastPunctuation, prefix) {
    lastPunctuation = lastPunctuation || ".";
    prefix = prefix || null;
    // replace multiple spaces with a single space
    var newString = str.replace(/\s{2,}/g, ' ');
    

    if(prefix!=null){
        //ajout d'un prefixe ex.: Est-ce que
        newString = prefix+" "+newString;
    }

    if(upperCaseFirstLetter)
    {
        var stringWithoutLeftHtml = stripLeftHtml(newString);
        newString = ((newString.charAt(0) === "<") ? newString.slice(0, newString.indexOf(stringWithoutLeftHtml)) : "") 
            + stringWithoutLeftHtml.charAt(0).toUpperCase() + stringWithoutLeftHtml.slice(1); // first char in upper case
    }
    
    if(addFullStop)
    {
        if(JSrealB.Module.Punctuation.isValid(lastPunctuation)){
            newString = JSrealB.Module.Punctuation.after(newString, lastPunctuation);
        }
        else{
            newString = JSrealB.Module.Punctuation.after(newString, "."); // add full stop
        }
    }
    
    newString = trim(newString);
    
    return newString;
};

//// "module cheap" d'élision en français

// règles de http://www.aidenet.eu/grammaire01b.htm
// Tokn au lieu de Token utilisé dans IDE...
function Tokn(mot){ // normalement on aurait besoin du lemme et de la catégorie 
    this.mot=mot;
    this.capitalized=false;
    var c=mot.charAt(0);
    if(c==c.toUpperCase()){
        c=c.toLowerCase();
        this.mot=c+this.mot.substring(1);
        this.capitalized=true;
    }
    var e=mot.charAt(mot.length-1);
    try{
        var end = JSrealB.Config.get("lexicon")[e]["Pc"]
        if(end == undefined){
            this.end = "";
        }
        else{
            this.end=e;
            this.mot=this.mot.slice(0,-1);
        }
        
    }
    catch(e){
        this.end="";
    }
    this.elidable=JSrealB.Config.get("rule.elision.elidables").indexOf(this.mot)>=0;
    this.voyelleOuHmuet=false;
    if(JSrealB.Config.get("rule.elision.voyelles").indexOf(c)>=0){
        this.voyelleOuHmuet=true;
        this.hAn=true;
        return;
    }
    //Ajout d'un attribut pour avoir accès au lexique du mot
    try{
        this.lex=JSrealB.Config.get("lexicon")[this.mot];
    }
    catch(e){
        //ajouter un warning ici peut-être
        this.lex="";
    }
    if(c==="h"){
        if (this.lex){// on devrait avoir l'info de la catégorie... et sur le lemme.
            // ici on cherche dans la première en supposant que le mot est un lemme 

            for (cat in this.lex){
                if(this.lex[cat].hAn){ // herb, hour ,honor... en anglais
                    this.hAn=true;
                    break;
                }
                if (!this.lex[cat].h){
                    this.voyelleOuHmuet=true;
                    break;
                }
            }
        }
        else
        {
            this.voyelleOuHmuet=true;
        }
    }
}

Tokn.prototype.toString = function (){
    if (this.capitalized){
        return this.mot.charAt(0).toUpperCase()+this.mot.substring(1)+this.end;
    }
    return this.mot+this.end;
}

// pour la mise au point
function showTokens(tokens){
    return "["+tokens.map(function(token){return token.toString()}).join(",")+"]";
}

function aToAn(prevTokens, tokens){
    //place un 'an' devant les mots commençant par des voyelles. Ceci est une simplification de la règle actuelle. ex: a unique place, an hour ne fonctionne pas
    if(tokens.length == 0){
        return prevTokens;
    }
    var lastTokenId=((prevTokens[prevTokens.length-1]).mot.charAt(0) !== "<") ? prevTokens.length-1 : prevTokens.length-2;
    var lastToken=prevTokens[lastTokenId];
    if (lastToken.mot == "a" && tokens[0].hAn){
        lastToken.mot = "an";
        if(this)
        prevTokens.push(tokens.shift());
    }
    else{
        prevTokens.push(tokens.shift());
    }
    return aToAn(prevTokens,tokens); 
}

function removeLastLetter(str){return str.substring(0,str.length-1)}
function remplaceToken(tokens,i,newMot){
    tokens[i].mot=newMot;
    tokens.splice(i+1,1);//enlever le prochain token
}

function contracter(tokens){
    // appliquer les contractions à le=> au, "à les"=> aux, "de le"=>du, "de les"=>"des", "de des"=> "de", "des autres"=>"d'autres", "si il(s)"=> "s'il(s)"
    for(var i=0;i<tokens.length-1;i++){
        var motI=tokens[i].mot;
        var motI1=tokens[i+1].mot;
        if(motI=="à"){
            if(motI1=="le")remplaceToken(tokens,i,"au") 
            else if (motI1=="les")remplaceToken(tokens,i,"aux")
        } else if (motI=="de"){
            if(motI1=="le")remplaceToken(tokens,i,"du") 
            else if (motI1=="les") remplaceToken(tokens,i,"des")
            else if (motI1=="des") remplaceToken(tokens,i,"de")
            else if (motI1=="autres") remplaceToken(tokens,i,"d'autres")
        } else if (motI=="des"){
            if (motI1=="autres") remplaceToken(tokens,i,"d'autres")
        } else if (motI=="si"){
            if(motI1=="il")remplaceToken(tokens,i,"s'il")
            else if(motI1=="ils")remplaceToken(tokens,i,"s'ils")
        }
    }
    return tokens;
}

function eliderMots(prevTokens,tokens){
    if (tokens.length==0) 
        return contracter(prevTokens);
    var lastTokenId=((prevTokens[prevTokens.length-1]).mot.charAt(0) !== "<") ? prevTokens.length-1 : prevTokens.length-2;
    var lastToken=prevTokens[lastTokenId];
    if (lastToken.elidable && tokens[0].voyelleOuHmuet){ 
        if (["ma","ta","sa"].indexOf(lastToken.mot)>=0){ // ma=>mon,ta=>ton,sa=>son
            lastToken.mot=lastToken.mot.charAt(0)+"on";
            prevTokens.push(tokens.shift());
        } else if(["nouveau","beau"].indexOf(lastToken.mot)>=0){ // nouveau -> nouvel, beau -> bel
            lastToken.mot=lastToken.mot.substring(0,lastToken.mot.length-2)+"l";
            prevTokens.push(tokens.shift());
        } 
        else if (lastToken.mot=="ce"){// ce => cet (On vérifie que le mot suivant n'est pas un verbe...)
            
            if(contains(JSrealB.Config.get("rule.elision.elisionEtre.verbe"),tokens[0].mot) ||
                contains(JSrealB.Config.get("rule.elision.elisionEtre.aux"),tokens[0].mot) &&
                        contains(JSrealB.Config.get("rule.elision.elisionEtre.pp"),tokens[1].mot)) {
                tokens[0].mot=removeLastLetter(lastToken.mot)+"'"+tokens[0].mot;  //"ce" => "c'"
                tokens[0].capitalized=lastToken.capitalized;
                prevTokens.splice(lastTokenId, 1);
                prevTokens.push(tokens.shift());
            }
            else{
                lastToken.mot = "cet";
                prevTokens.push(tokens.shift());
            }
            
        
        } else {// remplace la dernière lettre par ' et on colle le prochain mot
    //            lastToken.mot=removeLastLetter(lastToken.mot)+"'"+tokens.shift(); // Edit by Paul
    //            lastToken.elidable=false;                                 // Edit by Paul
            tokens[0].mot=removeLastLetter(lastToken.mot)+"'"+tokens[0].mot;
            tokens[0].capitalized=lastToken.capitalized;
            prevTokens.splice(lastTokenId, 1);
            prevTokens.push(tokens.shift());
        }

    } else {
    prevTokens.push(tokens.shift());
    }
    return eliderMots(prevTokens,tokens);
}

//// Word category
var N = function(unit) {
    return new JSrealE(unit, JSrealB.Config.get("feature.category.word.noun"), JSrealE.ruleType.declension);
};

var A = function(unit) {
    return new JSrealE(unit, JSrealB.Config.get("feature.category.word.adjective"), JSrealE.ruleType.declension);
};

var Pro = function(unit) {
    return new JSrealE(unit, JSrealB.Config.get("feature.category.word.pronoun"), JSrealE.ruleType.declension);
};

var D = function(unit) {
    return new JSrealE(unit, JSrealB.Config.get("feature.category.word.determiner"), JSrealE.ruleType.declension);
};

var V = function(unit) {

    return new JSrealE(unit, JSrealB.Config.get("feature.category.word.verb"), JSrealE.ruleType.conjugation);
};

V.prototype.putAuxInFront = function(conjug) {
    //création de token, comme pour l'élision
    var mots=conjug.split(" ");
    var htmlTagRegex =/\s*(<[^>]*>)|\s+/ig;
    var mots = conjug.split(htmlTagRegex);
    for(var i = 0, length1 = mots.length; i < length1; i++) { if(mots[i] === undefined) mots.splice(i, 1); } // fix : remove undefined
    var length2=mots.length;
    if(length2>=2){
        var tokens=mots.map(function(mot){return new Tokn(mot)});
    }
    console.log(mots);
    return conjug;
};

var Adv = function(unit) {
    if(JSrealB.Config.get("language") === JSrealE.language.english)
    {
        return new JSrealE(unit, JSrealB.Config.get("feature.category.word.adverb"), JSrealE.ruleType.declension);
    }
    
    return new JSrealE(unit, JSrealB.Config.get("feature.category.word.adverb"), JSrealE.ruleType.regular);
};

var P = function(unit) {
    return new JSrealE(unit, JSrealB.Config.get("feature.category.word.preposition"), JSrealE.ruleType.regular);
};

var C = function(unit) {
    return new JSrealE(unit, JSrealB.Config.get("feature.category.word.conjunction"), JSrealE.ruleType.none);
};

//// Phrase
/// Sentence
var S = function(childrenElt) {
    if(!(this instanceof S))
    {
        if(JSrealB.Config.get("language") === JSrealE.language.french)
        {
            return new S_FR(arguments);
        }
        else
        {
            return new S_EN(arguments);
        }
    }    
    JSrealE.call(this, childrenElt, JSrealB.Config.get("feature.category.phrase.sentence"));
};
extend(JSrealE, S);

S.prototype.sortWord = function() {
    this.constituents.head = null;
    
    var eS;
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        eS = this.elements[i];

        switch(eS.category)
        {
            case JSrealB.Config.get("feature.category.phrase.verb"):
            case JSrealB.Config.get("feature.category.word.verb"): // essai pour rendre le programme pour souple.
                this.addConstituent(eS, JSrealE.grammaticalFunction.head);
            break;
            case JSrealB.Config.get("feature.category.phrase.noun"):
            case JSrealB.Config.get("feature.category.phrase.coordinated"):
            case JSrealB.Config.get("feature.category.word.pronoun"):
                if(this.constituents.head === null) // before verb
                {
                        this.addConstituent(eS, JSrealE.grammaticalFunction.modifier);
                    break;
                }
            case JSrealB.Config.get("feature.category.phrase.adjective"):
            case JSrealB.Config.get("feature.category.phrase.adverb"):
                this.addConstituent(eS, JSrealE.grammaticalFunction.subordinate);
            break;
            default:
                this.addConstituent(eS, JSrealE.grammaticalFunction.complement);
        }
    }

    return this;
};

///Propositional phrase
var SP = function(childrenElt) {
    if(!(this instanceof SP))
    {
        return new SP(arguments);
    }

    JSrealE.call(this, childrenElt, JSrealB.Config.get("feature.category.phrase.propositional"), JSrealE.ruleType.none)
}
extend(JSrealE, SP);

SP.prototype.sortWord = function() { 
    //same as sentence from here
    this.constituents.head = null;
    
    var eSP;
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        eSP = this.elements[i];

        switch(eSP.category)
        {
            case JSrealB.Config.get("feature.category.phrase.verb"):
                this.addConstituent(eSP, JSrealE.grammaticalFunction.head);
            break;
            case JSrealB.Config.get("feature.category.phrase.noun"):
            case JSrealB.Config.get("feature.category.phrase.coordinated"):
            case JSrealB.Config.get("feature.category.word.pronoun"):
                if(this.constituents.head === null) // before verb
                {
                        this.addConstituent(eSP, JSrealE.grammaticalFunction.modifier);
                    break;
                }
            case JSrealB.Config.get("feature.category.phrase.adjective"):
            case JSrealB.Config.get("feature.category.phrase.adverb"):
                this.addConstituent(eSP, JSrealE.grammaticalFunction.subordinate);
            break;
            default:
                this.addConstituent(eSP, JSrealE.grammaticalFunction.complement);
        }
    }

}
var S_FR = function(childrenElt) {
    S.call(this, childrenElt);
};
extend(S, S_FR);

var S_EN = function(childrenElt) {
    S.call(this, childrenElt);
};
extend(S, S_EN);

S_FR.prototype.interrogationForm = function(int) {
    switch(int){
    case JSrealB.Config.get("feature.sentence_type.interro_prefix.default"):
    case JSrealB.Config.get("feature.sentence_type.interro_prefix.yesOrNo"):
    case JSrealB.Config.get("feature.sentence_type.interro_prefix.where"):
    case JSrealB.Config.get("feature.sentence_type.interro_prefix.how"):
        break;
    case JSrealB.Config.get("feature.sentence_type.interro_prefix.whoSubject"):
        var sujP = getSubject(this); //subject position
        if(sujP != -1){
            this.deleteElement(sujP);
        }
        break;
    case JSrealB.Config.get("feature.sentence_type.interro_prefix.whoDirect"):
    case JSrealB.Config.get("feature.sentence_type.interro_prefix.whatDirect"):
        var vP = getGroup(this,JSrealB.Config.get("feature.category.phrase.verb"));
        var cdP = getGroup(this.elements[vP],JSrealB.Config.get("feature.category.phrase.noun"));
        var vvP = getGroup(this.elements[vP],JSrealB.Config.get("feature.category.word.verb"));
        var proP = getGroup(this.elements[vP],JSrealB.Config.get("feature.category.word.pronoun"));
        if(vP != -1 && cdP != -1){
            this.elements[vP].deleteElement(cdP);
        } 
        if(vP != -1 && proP != -1 && vvP != -1 && proP < vvP){
            //object direct pronominalisé
            this.elements[vP].deleteElement(proP);
        }
        break;
    case JSrealB.Config.get("feature.sentence_type.interro_prefix.whoIndirect"):
        var vP = getGroup(this,JSrealB.Config.get("feature.category.phrase.verb"));
        var ciP = getGroup(this.elements[vP],JSrealB.Config.get("feature.category.phrase.prepositional"));
        if(vP != -1 && ciP != -1){
            this.elements[vP].deleteElement(ciP);
        } 
        break;
    }
    this.addNewElement(0,JSrealB.Config.get("rule.sentence_type.int.prefix")[int]);
    fetchFromObject(this.ctx, JSrealB.Config.get("feature.sentence_type.alias")
        +"."+JSrealB.Config.get("feature.sentence_type.interrogative"), false); // set int:false (end recursion)
    this.setCtx(JSrealB.Config.get("feature.sentence_type.interrogative"),true); //for later use in punctuation

    return true;
}

S_EN.prototype.interrogationForm = function(int) {
    var change=false;
    switch(int){
        //remove specific part of phrase
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.where"):
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.how"):
            break;
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.whoSubject"):
            var sujP = getSubject(this); //subject position
            if(sujP != -1){
                this.deleteElement(sujP);
                change = true;
            }
            break;
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.whoDirect"):
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.whatDirect"):
            var vP = getGroup(this,JSrealB.Config.get("feature.category.phrase.verb"));
            var cdP = getGroup(this.elements[vP],JSrealB.Config.get("feature.category.phrase.noun"));
            if(vP != -1 && cdP != -1){
                this.elements[vP].deleteElement(cdP);
                change = true; 
            } 
            break;
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.whoIndirect"):
            var vP = getGroup(this,JSrealB.Config.get("feature.category.phrase.verb"));
            var ciP = getGroup(this.elements[vP],JSrealB.Config.get("feature.category.phrase.prepositional"));
            if(vP != -1 && ciP != -1){
                this.elements[vP].deleteElement(ciP);
                change = true; 
            } 
            break;
    }
    //Add prefix + first aux(from Ctx)
    switch(int){
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.whoDirect"):
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.whatDirect"):
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.whoIndirect"):
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.where"):
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.how"):
        case JSrealB.Config.get("feature.sentence_type.interro_prefix.whoSubject")://N'était pas là avant...
            var prefix = JSrealB.Config.get("rule.sentence_type.int.prefix")[int]+" "+this.getCtx("firstAux");
            this.addNewElement(0,prefix);
            break;
        default:
            if(this.getCtx("firstAux")!=null){
                this.addNewElement(0,this.getCtx("firstAux"));    
            }           
    }

    fetchFromObject(this.ctx, JSrealB.Config.get("feature.sentence_type.alias")
        +"."+JSrealB.Config.get("feature.sentence_type.interrogative"), false); // set int:false (end recursion)
    this.setCtx(JSrealB.Config.get("feature.sentence_type.interrogative"),true); //for later use in punctuation

    return change;
}
    

/// Coordinated Phrase
var CP = function(childrenElt) {
    if(!(this instanceof CP))
    {
        return new CP(arguments);
    }
    
    JSrealE.call(this, childrenElt, JSrealB.Config.get("feature.category.phrase.coordinated"));
};
extend(JSrealE, CP);

CP.prototype.sortWord = function() {
    this.constituents.head = null;
    
    var eCP;
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        eCP = this.elements[i];
        
        switch (eCP.category) {
            case JSrealB.Config.get("feature.category.word.conjunction"):
                this.setCtx(JSrealB.Config.get("feature.category.word.conjunction"), eCP.unit);
            break;
            case JSrealB.Config.get("feature.category.phrase.noun"):
            case JSrealB.Config.get("feature.category.word.noun"):
            case JSrealB.Config.get("feature.category.phrase.adjective"):
            case JSrealB.Config.get("feature.category.word.adjective"):
                this.addConstituent(eCP, JSrealE.grammaticalFunction.subordinate);
            break;
            default:
                this.addConstituent(eCP, JSrealE.grammaticalFunction.complement);
        }
    }
    
    return this;
};

CP.prototype.elementToPhrasePropagation = function(element) {    
    // Person
    var phrasePerson = this.getChildrenProp(JSrealB.Config.get("feature.person.alias"));
    var elementPerson = (element.elements.length > 0) 
        ? element.getChildrenProp(JSrealB.Config.get("feature.person.alias"))
        : element.getProp(JSrealB.Config.get("feature.person.alias"));

    if(phrasePerson === null)
    {
        element.bottomUpFeaturePropagation(this, [JSrealB.Config.get("feature.person.alias")]);
    }
    else if(phrasePerson === JSrealB.Config.get("feature.person.p1")
            || elementPerson === JSrealB.Config.get("feature.person.p1"))
    {
        element.bottomUpFeaturePropagation(this, [JSrealB.Config.get("feature.person.alias")], [JSrealB.Config.get("feature.person.p1")]);
    }
    else if (phrasePerson === JSrealB.Config.get("feature.person.p2")
            || elementPerson === JSrealB.Config.get("feature.person.p2"))
    {
        element.bottomUpFeaturePropagation(this, [JSrealB.Config.get("feature.person.alias")], [JSrealB.Config.get("feature.person.p2")]);
    }
    else
    {
        element.bottomUpFeaturePropagation(this, [JSrealB.Config.get("feature.person.alias")], [JSrealB.Config.get("feature.person.p3")]);
    }
    
    // Number
    if(this.elements.length <= 2) // At least 1 coordinate + 2 elements
    {
        element.bottomUpFeaturePropagation(this, [JSrealB.Config.get("feature.number.alias")], [JSrealB.Config.get("feature.number.singular")]);
    }
    else
    {
        var conjunction = this.getCtx(JSrealB.Config.get("feature.category.word.conjunction"));
        if(conjunction == JSrealB.Config.get("rule.union")){
            element.bottomUpFeaturePropagation(this, [JSrealB.Config.get("feature.number.alias")], [this.getProp(JSrealB.Config.get("feature.number.alias")) || JSrealB.Config.get("feature.number.singular")]);
        }
        else{
        element.bottomUpFeaturePropagation(this, [JSrealB.Config.get("feature.number.alias")], [JSrealB.Config.get("feature.number.plural")]);

        }
    }
    
    // Gender
    var phraseGender = this.getChildrenProp(JSrealB.Config.get("feature.gender.alias"));
    var elementGender = (element.elements.length > 0) 
        ? element.getChildrenProp(JSrealB.Config.get("feature.gender.alias"))
        : element.getProp(JSrealB.Config.get("feature.gender.alias"));
    if(phraseGender === null)
    {
        element.bottomUpFeaturePropagation(this, [JSrealB.Config.get("feature.gender.alias")]);
    }
    else if(phraseGender !== elementGender)
    {
        element.bottomUpFeaturePropagation(this, [JSrealB.Config.get("feature.gender.alias")], [JSrealB.Config.get("feature.gender.masculine")]);
    }
    
    return this;
};

/// Verb Phrase VP
var VP = function(childrenElt) {
    if(!(this instanceof VP))
    {
        if(JSrealB.Config.get("language") === JSrealE.language.french)
        {
            return new VP_FR(arguments);
        }
        else
        {
            return new VP_EN(arguments);
        }
    }
    
    JSrealE.call(this, childrenElt, JSrealB.Config.get("feature.category.phrase.verb"));
};
extend(JSrealE, VP);

VP.prototype.sortWord = function() {
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        var eVP = this.elements[i];
        switch(eVP.category)
        {          
            case JSrealB.Config.get("feature.category.word.verb"):
                this.addConstituent(eVP, JSrealE.grammaticalFunction.head);
            break;
            case JSrealB.Config.get("feature.category.phrase.adjective"):
            case JSrealB.Config.get("feature.category.word.adjective"):
            //essai pour les cas "jolie et belle"
            case JSrealB.Config.get("feature.category.phrase.coordinated"):
                this.addConstituent(eVP, JSrealE.grammaticalFunction.subordinate);
            break;
            default:
                this.addConstituent(eVP, JSrealE.grammaticalFunction.complement);
        }
    }
    
    return this;
};

var VP_FR = function(childrenElt) {
    VP.call(this, childrenElt);
};
extend(VP, VP_FR);

var VP_EN = function(childrenElt) {
    VP.call(this, childrenElt);
};
extend(VP, VP_EN);

/// Noun Phrase
var NP = function(childrenElt) {
    if(!(this instanceof NP))
    {
        if(JSrealB.Config.get("language") === JSrealE.language.french)
        {
            return new NP_FR(arguments);
        }
        else
        {
            return new NP_EN(arguments);
        }
    }
    
    JSrealE.call(this, childrenElt, JSrealB.Config.get("feature.category.phrase.noun"));
};
extend(JSrealE, NP);

NP.prototype.sortWord = function() {};

var NP_FR = function(childrenElt) {
    NP.call(this, childrenElt);
};
extend(NP, NP_FR);

NP_FR.prototype.sortWord = function() {
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        var eNP = this.elements[i];
        
        switch (eNP.category) {
            case JSrealB.Config.get("feature.numerical.alias"):
                this.addConstituent(eNP, JSrealE.grammaticalFunction.modifier);
            break;
            case JSrealB.Config.get("feature.category.phrase.noun"):
            case JSrealB.Config.get("feature.category.word.noun"):
            case JSrealB.Config.get("feature.category.word.pronoun"):
            case JSrealB.Config.get("feature.category.phrase.coordinated"):
                if(this.constituents.head === undefined)
                {
                    this.addConstituent(eNP, JSrealE.grammaticalFunction.head);
                }
                else
                {
                    this.addConstituent(eNP, JSrealE.grammaticalFunction.complement);
                }
            break;
            case JSrealB.Config.get("feature.category.word.determiner"):
            case JSrealB.Config.get("feature.category.word.adverb"):
            case JSrealB.Config.get("feature.category.phrase.adverb"):
            case JSrealB.Config.get("feature.category.word.adjective"):
            case JSrealB.Config.get("feature.category.phrase.adjective"):
            case JSrealB.Config.get("feature.category.phrase.propositional"): // only gender of head word in french?
            //ajout pour accord du participe passé employé seul
            case JSrealB.Config.get("feature.category.word.verb"):
                this.addConstituent(eNP, JSrealE.grammaticalFunction.subordinate);
            break;
            default:
                this.addConstituent(eNP, JSrealE.grammaticalFunction.complement);
        }
    }
    
    return this;
};

//Element to element propagation needs to be a little different for subordinate
NP.prototype.elementToElementPropagation = function(element) {
    if(element.fct === JSrealE.grammaticalFunction.modifier) 
    {
        if(this.constituents.head !== null)
        {
            element.siblingFeaturePropagation(this.constituents.head);
        }
    }
    else if(element.fct === JSrealE.grammaticalFunction.head)
    {
        if(this.constituents.modifier.length > 0)
        {
            for(var i = 0, length = this.constituents.modifier.length; i < length; i++){
                element.siblingFeaturePropagation(this.constituents.modifier[i]);    
            }            
        }
           
        for(var i = 0, length = this.constituents.subordinate.length; i < length; i++)
        {
            if(this.constituents.subordinate[i].category == "SP"){
                var groupPropNameList = Object.keys(element.prop).concat(Object.keys(element.defaultProp));

                var j, nbGroupProp;
                var npInfo = {};
                for(j = 0, nbGroupProp = groupPropNameList.length; j < nbGroupProp; j++)
                {   
                    npInfo[groupPropNameList[j]] = element.getProp(groupPropNameList[j])
                }
                //var pronomSub = this.constituents.subordinate[i].getProp(JSrealB.Config.get("feature.propositional.pronoun.alias"));
                if(JSrealB.Config.get("language") === JSrealE.language.french){
                    var pronomSub = this.constituents.subordinate[i].getFirst("Pro");
                    if(pronomSub.unit == JSrealB.Config.get("rule.propositional.base")){
                        this.constituents.subordinate[i].setProp(JSrealB.Config.get("feature.cdInfo.alias"),npInfo);
                    }
                    else if(pronomSub.unit == JSrealB.Config.get("rule.propositional.subject")){
                        for(var key in npInfo){
                            pronomSub.setProp(key,npInfo[key]);
                        } 
                    }
                }
                else{
                    var firstWord = this.constituents.subordinate[i].getFirst("any");
                    if(firstWord.unit == JSrealB.Config.get("rule.propositional.subject")){
                        for(var key in npInfo){
                            firstWord.setProp(key,npInfo[key]);
                        }
                    }
                }
                
                
            }
            else{
                element.siblingFeaturePropagation(this.constituents.subordinate[i]);
            }
            
        }
    }
};

NP.prototype.pro = function() {
    return this.setCtx(JSrealB.Config.get("feature.toPronoun.alias"),true);
}

var NP_EN = function(childrenElt) {
    NP.call(this, childrenElt);
};
extend(NP, NP_EN);

NP_EN.prototype.sortWord = function() {
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        var eNP = this.elements[i];
        
        switch (eNP.category) {
            case JSrealB.Config.get("feature.numerical.alias"):
                this.addConstituent(eNP, JSrealE.grammaticalFunction.modifier);
            break;
            case JSrealB.Config.get("feature.category.word.noun"):
            case JSrealB.Config.get("feature.category.phrase.noun"):
            case JSrealB.Config.get("feature.category.word.pronoun"):
            case JSrealB.Config.get("feature.category.phrase.coordinated"):
                this.addConstituent(eNP, JSrealE.grammaticalFunction.head);
            break;
            case JSrealB.Config.get("feature.category.word.determiner"):
            case JSrealB.Config.get("feature.category.phrase.propositional"):
                this.addConstituent(eNP, JSrealE.grammaticalFunction.subordinate);
            break;
            default:
                this.addConstituent(eNP, JSrealE.grammaticalFunction.complement);
        }
    }
    
    return this;
};

/// Adjective Phrase AP
var AP = function(childrenElt) {
    if(!(this instanceof AP))
    {
        if(JSrealB.Config.get("language") === JSrealE.language.french)
        {
            return new AP_FR(arguments);
        }
        else
        {
            return new AP_EN(arguments);
        }
    }
    
    JSrealE.call(this, childrenElt, JSrealB.Config.get("feature.category.phrase.adjective"));
};
extend(JSrealE, AP);

AP.prototype.sortWord = function() {
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        var eAP = this.elements[i];
        
        switch (eAP.category)
        {
            case JSrealB.Config.get("feature.category.phrase.adjective"):
            case JSrealB.Config.get("feature.category.word.adjective"):
                this.addConstituent(eAP, JSrealE.grammaticalFunction.head);
            break;
            case JSrealB.Config.get("feature.category.word.adverb"):
            case JSrealB.Config.get("feature.category.phrase.adverb"):
            case JSrealB.Config.get("feature.category.word.preposition"):
            case JSrealB.Config.get("feature.category.phrase.prepositional"):
            case JSrealB.Config.get("feature.category.phrase.propositional"):
            default:
                this.addConstituent(eAP, JSrealE.grammaticalFunction.complement);
        }
    }
    return this;
};

var AP_FR = function(childrenElt) {
    AP.call(this, childrenElt);
};
extend(AP, AP_FR);

var AP_EN = function(childrenElt) {
    AP.call(this, childrenElt);
};
extend(AP, AP_EN);

/// Adverbial Phrase AdvP
var AdvP = function(childrenElt) {
    if(!(this instanceof AdvP))
    {
        if(JSrealB.Config.get("language") === JSrealE.language.french)
        {
            return new AdvP_FR(arguments);
        }
        else
        {
            return new AdvP_EN(arguments);
        }
    }
    
    JSrealE.call(this, childrenElt, JSrealB.Config.get("feature.category.phrase.adverb"));
};
extend(JSrealE, AdvP);

AdvP.prototype.sortWord = function() {};

var AdvP_FR = function(childrenElt) {
    AdvP.call(this, childrenElt);
};
extend(AdvP, AdvP_FR);

AdvP_FR.prototype.sortWord = function() {
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        var eAdv = this.elements[i];
        
        switch (eAdv.category)
        {
            case JSrealB.Config.get("feature.category.phrase.adverb"):
            case JSrealB.Config.get("feature.category.word.adverb"):
                this.addConstituent(eAdv, JSrealE.grammaticalFunction.head);
            break;
            case JSrealB.Config.get("feature.category.word.preposition"):
            case JSrealB.Config.get("feature.category.phrase.prepositional"):
            case JSrealB.Config.get("feature.category.phrase.propositional"):
            default:
                this.addConstituent(eAdv, JSrealE.grammaticalFunction.complement);
        }
    }
    return this;
};

var AdvP_EN = function(childrenElt) {
    AdvP.call(this, childrenElt);
};
extend(AdvP, AdvP_EN);

AdvP_EN.prototype.sortWord = function() {
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        var eAdv = this.elements[i];
        
        switch (eAdv.category)
        {
            case JSrealB.Config.get("feature.category.word.adverb"):                
                this.addConstituent(eAdv, JSrealE.grammaticalFunction.head); // Manner
            break;
            case JSrealB.Config.get("feature.category.phrase.adverb"):
            case JSrealB.Config.get("feature.category.word.preposition"):
            case JSrealB.Config.get("feature.category.phrase.prepositional"):
            case JSrealB.Config.get("feature.category.phrase.propositional"):
            default:
                this.addConstituent(eAdv, JSrealE.grammaticalFunction.complement);
        }
    }
    return this;
};

/// Prepositional Phrase PP
var PP = function(childrenElt) {
    if(!(this instanceof PP))
    {
        if(JSrealB.Config.get("language") === JSrealE.language.french)
        {
            return new PP_FR(arguments);
        }
        else
        {
            return new PP_EN(arguments);
        }
    }
    
    JSrealE.call(this, childrenElt, JSrealB.Config.get("feature.category.phrase.prepositional"));
};
extend(JSrealE, PP);

PP.prototype.sortWord = function() {
    for (var i = 0, imax = this.elements.length; i < imax; i++)
    {
        var ePP = this.elements[i];
        
        switch (ePP.category) {
            case JSrealB.Config.get("feature.category.word.preposition"):
                this.addConstituent(ePP, JSrealE.grammaticalFunction.head);
            break;
            case JSrealB.Config.get("feature.category.word.verb"):
            case JSrealB.Config.get("feature.category.phrase.verb"):
            default:
                this.addConstituent(ePP, JSrealE.grammaticalFunction.complement);
        }
    }
    
    return this;
};

var PP_FR = function(childrenElt) {
    PP.call(this, childrenElt);
};
extend(PP, PP_FR);

var PP_EN = function(childrenElt) {
    PP.call(this, childrenElt);
};
extend(PP, PP_EN);

//// Date
var DT = function(date) {
    if(!(this instanceof DT))
    {
        return new DT(date);
    }
    
    JSrealE.call(this, date, JSrealB.Config.get("feature.date.alias"), JSrealE.ruleType.date);
};
extend(JSrealE, DT);

//// Number
var NO = function(number) {
    if(!(this instanceof NO))
    {
        return new NO(number);
    }
    
    JSrealE.call(this, number, JSrealB.Config.get("feature.numerical.alias"), JSrealE.ruleType.number);
};
extend(JSrealE, NO);


/*
 * JSrealB
 */
var JSrealB = (function() {
    return {
        init: function(language, lexicon, rule, feature) {
            this.Config.set({
                language: language,
                lexicon: lexicon,
                rule: rule,
                feature: feature,
                isDevEnv: true,
                printTrace: false,
                //ajout db
                db : null
            });
        }
    };
})();

/**
 * Modules
 */
JSrealB.Module = {};

//// Punctuation Module
JSrealB.Module.Punctuation = (function() {
    var positionType = {
        start: 1,
        end: 2
    };
    
    var removeIncompatiblePunctuation = function(sentence, posType, pInfo) {
        var result = "";
        
        if(posType === positionType.start)
        {
            result = ltrim(sentence);
            var firstChar = "";
            var previousResult = result;
            do
            {
                firstChar = result.charAt(0);
                if(isPunctuationMark(firstChar)
                        && pInfo[JSrealB.Config.get("feature.typography.complementary")] === undefined
                        && getPunctuationInfo(firstChar)[JSrealB.Config.get("feature.typography.complementary")] === undefined)
                {
                    result = result.substring(1);
                }

                previousResult = result;
            } while(previousResult !== result);
            result = ltrim(result);
        }
        else if(posType === positionType.end)
        {
            result = rtrim(sentence);
            var lastChar = "";
            var previousResult = result;
            do
            {
                lastChar = result.charAt(result.length-1);
                if(isPunctuationMark(lastChar)
                        && pInfo[JSrealB.Config.get("feature.typography.complementary")] === undefined
                        && getPunctuationInfo(lastChar)[JSrealB.Config.get("feature.typography.complementary")] === undefined)
                {
                    result = result.substring(0, result.length - 1);
                }

                previousResult = result;
            } while(previousResult !== result);
            result = rtrim(result);
        }
        
        return result;
    };
    
    var isPunctuationMark = function(punctuation) {
        return (typeof JSrealB.Config.get("lexicon")[punctuation] !== "undefined"
            && typeof JSrealB.Config.get("lexicon")[punctuation][JSrealB.Config.get('feature.category.word.punctuation')] !== "undefined");
    };
    
    var getPunctuationInfo = function(punctuation) {
        var pInfo = null;
        
        if(!isPunctuationMark(punctuation))
        {
            throw JSrealB.Exception.wrongPunctuation(punctuation);
        }
        
        pInfo = JSrealB.Config.get("lexicon")[punctuation][JSrealB.Config.get('feature.category.word.punctuation')];
        
        return pInfo;
    };
    
    var getRuleTable = function(tableId) {
        var ruleTable = JSrealB.Config.get("rule")["punctuation"][tableId];
        
        if(ruleTable === undefined)
        {
            throw JSrealB.Exception.tableNotExists("unknown", tableId);
        }
        
        return ruleTable;
    };
    
    var applyBefore = function(sentence, punctuation) {
        var pInfo = getPunctuationInfo(punctuation);
        var ruleTable = getRuleTable(pInfo["tab"][0]);
        
        return ruleTable[JSrealB.Config.get("feature.typography.before")] 
                + punctuation 
                + ruleTable[JSrealB.Config.get("feature.typography.after")] 
                + removeIncompatiblePunctuation(sentence, positionType.start, pInfo);
    };
    
    var applyAfter = function(sentence, punctuation) {
        var pInfo = getPunctuationInfo(punctuation);
        var ruleTable = getRuleTable(pInfo["tab"][0]);
        
        return removeIncompatiblePunctuation(sentence, positionType.end, pInfo)
                + ruleTable[JSrealB.Config.get("feature.typography.before")] 
                + punctuation 
                + ruleTable[JSrealB.Config.get("feature.typography.after")];
    };
    
    var surround = function(sentence, punctuation) {
        var result = sentence;
        var pInfo = getPunctuationInfo(punctuation);
        
        if(pInfo["tab"].length > 1)
        {
            var tmpRuleTable = null;
            var ruleTable1 = getRuleTable(pInfo["tab"][0]);
            var ruleTable2 = getRuleTable(pInfo["tab"][1]);
            
            // Inversement si necessaire
            if(ruleTable1[JSrealB.Config.get("feature.typography.position.alias")] 
                    !== JSrealB.Config.get("feature.typography.position.left"))
            {
                tmpRuleTable = ruleTable1;
                ruleTable1 = ruleTable2;
                ruleTable2 = tmpRuleTable;
            }
            
            result = trim(result);
            result = ruleTable1[JSrealB.Config.get("feature.typography.before")]
                    + punctuation + ruleTable1[JSrealB.Config.get("feature.typography.after")]
                    + result
                    + ruleTable2[JSrealB.Config.get("feature.typography.before")]
                    + punctuation + ruleTable2[JSrealB.Config.get("feature.typography.after")];
        }
        else if(pInfo[JSrealB.Config.get("feature.typography.complementary")] !== undefined)
        {
            var complementary = pInfo[JSrealB.Config.get("feature.typography.complementary")];
            var ruleTable = getRuleTable(pInfo["tab"][0]);
            
            var leftPunctuation = punctuation;
            var rightPunctuation = complementary;
            
            if(ruleTable[JSrealB.Config.get("feature.typography.position.alias")] 
                    !== JSrealB.Config.get("feature.typography.position.left"))
            {
                leftPunctuation = complementary;
                rightPunctuation = punctuation;
            }
            
            var resultWithPcBefore = applyBefore(trim(result), leftPunctuation);
            var resultWithPcBeforeAndAfter = applyAfter(resultWithPcBefore, rightPunctuation);
            
            if(trim(result) !== trim(resultWithPcBefore)
                    && trim(resultWithPcBefore) !== resultWithPcBeforeAndAfter)
            {
                result = trim(result);
                result = resultWithPcBeforeAndAfter;
            }
        }
        else
        {
            throw JSrealB.Exception.pcMarkNotSupported(punctuation);
        }
        
        return result;
    };
    
    return {
        before: function(sentence, punctuation) {
            try
            {
                return applyBefore(sentence, punctuation);
            }
            catch(err)
            {
                return "[[" + sentence + "]]";
            }
        },
        after: function(sentence, punctuation) {
            try
            {
                return applyAfter(sentence, punctuation);
            }
            catch(err)
            {
                return "[[" + sentence + "]]";
            }
        },
        surround: function(sentence, punctuation) {
            try
            {
                return surround(sentence, punctuation);
            }
            catch(err)
            {
                return "[[" + sentence + "]]";
            }
        },
        isValid: function(punctuation) {
            return isPunctuationMark(punctuation);
        }
    };
})();

//// Declension Module (Nouns, Adjectives, Pronouns) + Determinant agreement
JSrealB.Module.Declension = (function() {
    var applyEnding = function(unit, feature, declensionTable) {
        
        if(feature.g == JSrealB.Config.get("feature.gender.either")){ 
            //quelques mots français du lexique peuvent s'accorder dans les deux genres.
            feature.g = JSrealB.Config.get("feature.gender.masculine");
        }

        var declension = getValueByFeature(declensionTable.declension, feature);
                

        if(declension !== null)
        {
            return stem(unit, declensionTable.ending) + declension;
        }
        else
        {
            return false;
        }
    };
    
    var decline = function(unit, category, feature) {
        var unitInfo = JSrealB.Module.Common.getWordFeature(unit, category);

        if(feature === undefined) { feature = {}; }
        
        var declensionTable = [];
        for(var i = 0, length = unitInfo.tab.length; i < length; i++)
        {
            declensionTable[i] = JSrealB.Config.get("rule").declension[unitInfo.tab[i]];
        }
        
        // gender
        if(feature[JSrealB.Config.get("feature.gender.alias")] !== undefined
                && unitInfo[JSrealB.Config.get("feature.gender.alias")] !== undefined)
        {
            // if gender is "x", we choose masculine
            if(unitInfo[JSrealB.Config.get("feature.gender.alias")] === JSrealB.Config.get("feature.gender.either"))
            {
                feature[JSrealB.Config.get("feature.gender.alias")] = JSrealB.Config.get("feature.gender.masculine");
            }
        }
        if(JSrealB.Config.get("language")=="fr" && feature.g == JSrealB.Config.get("feature.gender.neuter")
                && category!= JSrealB.Config.get("feature.category.word.pronoun")) //Cas spécial avec les pronoms neutres en français
            {
                feature[JSrealB.Config.get("feature.gender.alias")] = JSrealB.Config.get("feature.gender.masculine");
            }
        
        if(declensionTable.length > 0)
        {
            var result = false;
            var j = 0;
            do
            {
                result = applyEnding(unit, feature, declensionTable[j]);
                
                j++;
            } while(result === false && j < declensionTable.length); 
            // pour les homonymes qui se distinguent par le genre (ex: barbe en francais)
            
            if(result === false)
            {
                throw JSrealB.Exception.wrongDeclension(unit, category, JSON.stringify(feature));
            }
            
            return result;
        }
        else
        {
            throw JSrealB.Exception.tableNotExists(unit, unitInfo.tab);
        }
    };
    
    return {
        decline: function(unit, category, feature) {
            var declinedUnit = null;

            try
            {
                declinedUnit = decline(unit, category, feature);
            }
            catch(err)
            {
                return "[[" + unit + "]]";
            }

            return declinedUnit;
        }
    };
})();

//// Conjugation Module (Verbs)
JSrealB.Module.Conjugation = (function(){
    var applyEnding = function(unit, tense, person, gender, conjugationTable, verbOptions, cdProp, auxF) {
        verbOptions = verbOptions || {};
        cdProp = cdProp || {};
        
        //français
        try{
            if(JSrealB.Config.get("language")==JSrealE.language.french){
                //francais
                if(auxF != undefined){
                    var aux = auxF;
                }
                else{
                var auxTab = JSrealB.Module.Common.getWordFeature(unit, JSrealB.Config.get('feature.category.word.verb'))["aux"]; //av,êt ou aê
                var aux = JSrealB.Config.get("rule.compound.aux")[auxTab];
                }
                //if(aux == "être") verbOptions.pas = false; //un verbe d'état ne se met pas au passif
                if(verbOptions.neg == true ||
                    (typeof verbOptions.neg == "string" && contains(JSrealB.Config.get("rule.verb_option.neg.autres"),verbOptions.neg)))
                {
                    var verb = JSrealB.Config.get("rule.verb_option.neg.prep1")+" ";
                    if(verbOptions.neg == true && tense != JSrealB.Config.get("feature.tense.base")){
                        verbOptions.neg = JSrealB.Config.get("rule.verb_option.neg.prep2");
                    }
                    else if(tense == JSrealB.Config.get("feature.tense.base")){
                        verb += JSrealB.Config.get("rule.verb_option.neg.prep2")+" ";
                        verbOptions.neg = "";
                    }
                }
                else{
                    var verb = verbOptions.neg = "";
                }
                
                if(conjugationTable[(JSrealB.Config.get('feature.tense.alias'))][tense] !== undefined ){
                     //temps simple
                     verb += conjugSimpleFR(unit, tense, person, gender, conjugationTable, verbOptions, cdProp)
                }
                else{
                    
                    verb += conjugFR(unit, aux, tense, person, gender, conjugationTable, verbOptions, cdProp)
                }
                
                verb += (verbOptions.pas == true && verbOptions.hasSubject == true)?" par":"";
                return verb;

            }
            else{
                //anglais
                //catch simple tense first
                if(tense == JSrealB.Config.get("feature.tense.imperative.present")) tense = JSrealB.Config.get("feature.tense.base");
                if(conjugationTable[(JSrealB.Config.get('feature.tense.alias'))][tense] !== undefined && verbOptions.native == true){
                    //special case: be native and negative
                    if(unit == 'be'){
                        return applySimpleEnding(unit, tense, person, conjugationTable)+((verbOptions.neg == true)?" "+JSrealB.Config.get("rule.verb_option.neg.prep1"):"");
                    }
                    if(verbOptions.prog == true || verbOptions.pas == true || verbOptions.perf == true){
                        //not simple
                        return conjugEN(unit, tense, person, conjugationTable, verbOptions);
                    }
                    return conjugSimpleEN(unit, tense, person, conjugationTable, verbOptions);
                }
                else{
                    return conjugEN(unit, tense, person, conjugationTable, verbOptions);
                }
                
            }
        }
        catch(e){
            throw JSrealB.Exception.wrongTense(unit, tense);
        }

        throw JSrealB.Exception.wrongTense(unit, tense);    
    };

    var applySimpleEnding = function(unit, tense, person, conjugationTable){
        //temps simple anglais et français
        if(person === null || typeof conjugationTable.t[tense] === 'string')
        {
            return stem(unit, conjugationTable.ending) 
                    + conjugationTable.t[tense];
        }
        else if(conjugationTable.t[tense][person-1] !== undefined
                && conjugationTable.t[tense][person-1] !== null)
        {
            return stem(unit, conjugationTable.ending) 
                    + conjugationTable.t[tense][person-1];
        }
        else
        {
            throw JSrealB.Exception.wrongPerson(unit, person);
        }
    };

    var conjugSimpleFR = function(unit, tense, person, gender, conjugationTable, verbOptions, cdProp){
        verbOptions = verbOptions || {};
        cdProp = cdProp || {};

        if(verbOptions.pas == true || verbOptions.prog == true){
            var verb = conjugate(JSrealB.Config.get("rule.verb_option.prog.aux"), tense, person, conjugationTable)
            if(!verbOptions.prog == true) var aux = JSrealB.Config.get("rule.verb_option.prog.aux");
        }
        else{
            if(tense == JSrealB.Config.get("feature.tense.participle.past")){ // accord pp seul
                verb = applySimpleEnding(unit, tense, person, conjugationTable);
                var declTable = JSrealB.Config.get("rule.declension")["n28"];
                var featureAux = {"g":gender,"n":(person>3)?JSrealB.Config.get("feature.number.plural"):JSrealB.Config.get("feature.number.singular")};
                var declension = getValueByFeature(declTable.declension, featureAux);
                if(declension !== null)
                {
                    var verb = stem(verb, declTable.ending) + declension;
                }
                else{
                    return verb;
                }
            }
            else{
                verb = applySimpleEnding(unit, tense, person, conjugationTable);
            }
            
        }
        verb += (verbOptions.neg != "")?" ":"";
        verb += (tense != JSrealB.Config.get("feature.tense.base"))?verbOptions.neg:""; 
        verb += (verbOptions.prog == true)?" "+JSrealB.Config.get("rule.verb_option.prog.keyword"):"";
        verb += (verbOptions.pas == true && verbOptions.prog == true)?" "+JSrealB.Config.get("rule.verb_option.prog.aux"):"";
        
        if(verbOptions.pas == true || verbOptions.prog == true){
            if(verbOptions.pas == true) verb += " "+conjugatePPAvecAvoirEtre(unit, person, gender,JSrealB.Config.get("feature.tense.participle.past"),
                                                    {},JSrealB.Config.get("rule.verb_option.prog.aux"));
            else verb += " "+applySimpleEnding(unit, JSrealB.Config.get("feature.tense.base"), person, conjugationTable);
        }

        return verb;
    };


    var conjugFR = function(unit, aux, tense, person, gender, conjugationTable, verbOptions, cdProp){
        verbOptions = verbOptions || {};
        cdProp = cdProp || {};

        var verb = (verbOptions.prog == true)?conjugate(JSrealB.Config.get("rule.verb_option.prog.aux"),JSrealB.Config.get('rule.compound')[tense]["progAuxTense"],person)
                                                :conjugate(aux,JSrealB.Config.get('rule.compound')[tense]["auxTense"],person);
        //options
        verb += (verbOptions.neg != "")?" ":""
        verb += verbOptions.neg 
        verb += (verbOptions.prog == true)?" "+JSrealB.Config.get("rule.verb_option.prog.keyword"):"";
        if(verbOptions.pas == true){
            verb +=" "+conjugate(JSrealB.Config.get("rule.compound.aux.êt"),(verbOptions.prog == true)?JSrealB.Config.get("feature.tense.base"):JSrealB.Config.get("feature.tense.participle.past"),person);
            aux = JSrealB.Config.get("rule.compound.aux.êt");
        }
        //participe
        if(verbOptions.prog == true && !verbOptions.pas == true){ verb += " "+applySimpleEnding(unit,JSrealB.Config.get("feature.tense.base"),person, conjugationTable)}
        else{ verb += " "+conjugatePPAvecAvoirEtre(unit, person, gender, JSrealB.Config.get("feature.tense.participle.past"), cdProp, aux);}

        return verb;

    };

    var conjugatePPAvecAvoirEtre = function(unit, person, gender, tense, cdProp, aux){
        cdProp = cdProp || {};
        var pp = conjugate(unit,tense,person);
        var declTable = JSrealB.Config.get("rule.declension")["n28"];
        if(aux == JSrealB.Config.get("rule.compound.aux.êt")){
            var featureAux = {"g":gender,"n":(person>3)?"p":"s"};
        }else{
            if(cdProp == undefined) return pp;
            var featureAux = {"g":cdProp.g, "n":cdProp.n};
        }
        var declension = getValueByFeature(declTable.declension, featureAux);
        if(declension !== null)
        {
            var ppConjugue = stem(pp, declTable.ending) + declension;
        }
        else{
            return pp;
        }
        return ppConjugue;
    };

    var conjugSimpleEN = function(unit, tense, person, conjugationTable, verbOptions){
        verbOptions = verbOptions || {};
        //temps simple - present, past ou future
        if(conjugationTable[(JSrealB.Config.get('feature.tense.alias'))][tense] !== undefined)
        {
            if(verbOptions.interro == true || contains(JSrealB.Config.get("feature.sentence_type.interro_prefix"),verbOptions.interro) || verbOptions.interro=="old"){
                var verb = (tense==JSrealB.Config.get("feature.tense.base"))?"":conjugate("do",tense,person);
                verb+=(verbOptions.neg == true)?" "+JSrealB.Config.get("rule.verb_option.neg.prep1"):"";
                return verb+" "+conjugate(unit, "b", person);
            }
            else if(verbOptions.neg == true){
                var verb = (tense==JSrealB.Config.get("feature.tense.base"))?"":conjugate("do",tense,person);
                verb += " "+JSrealB.Config.get("rule.verb_option.neg.prep1")+" "+conjugate(unit, "b", person);
                return verb;
            }
            else{
                //present and past no negation
                return applySimpleEnding(unit, tense, person, conjugationTable);
            }
        }
        else if(tense == "f"){
            var aux = JSrealB.Config.get('rule.compound.future.aux');
            var verb = conjugate(aux, "b", person); //will
            verb += (verbOptions.neg == true)?" not":"";
            verb += " "+applySimpleEnding(unit,"b",person, conjugationTable);
            return verb;
        }            
        else{
            throw JSrealB.Exception.wrongTense(unit, tense);
        }

    }

    var conjugEN = function(unit, tense, person, conjugationTable, verbOptions){
        verbOptions = verbOptions || {};
        
        var sub = (verbOptions.hasSubject == true);
        verbOptions.hasSubject = false;
        //parTense
        if(verbOptions.pas == true) var parTense = JSrealB.Config.get("rule.compound.passive.participle");
        else if(verbOptions.prog == true) var parTense = JSrealB.Config.get("rule.compound.continuous.participle");
        else if(verbOptions.perf == true) var parTense = JSrealB.Config.get("rule.compound.perfect.participle");
        else var parTense = tense;
        //1st auxiliary
        if(verbOptions.pas == true){

            verbOptions.pas = false;
            var aux = conjugate(JSrealB.Config.get("rule.compound.passive.aux"), tense, person, "", verbOptions);
        }
        else if(verbOptions.prog == true){
            verbOptions.prog = false;
            var aux = conjugate(JSrealB.Config.get("rule.compound.continuous.aux"), tense, person, "", verbOptions);
        }
        else if(verbOptions.perf == true){
            verbOptions.perf = false;
            var aux = conjugate(JSrealB.Config.get("rule.compound.perfect.aux"), tense, person, "", verbOptions);
        }
        else if(verbOptions.neg == true){
            if(tense == "f"){
                return conjugSimpleEN(unit,tense, person, conjugationTable, verbOptions);
            }
            else{
                return conjugSimpleEN(unit, tense, person, conjugationTable)+" "+JSrealB.Config.get("rule.verb_option.neg.prep1");
            }
        }
        else{
            return conjugSimpleEN(unit, tense, person, conjugationTable);
        }     

        var verb = aux+" "+conjugate(unit, parTense, person)
        verb += (sub)?" by":"";

        return verb;
    }

    var conjugate = function(unit, tense, person, gender, verbOptions, cdProp, auxF) {
        gender = gender || "";
        verbOptions = verbOptions || {};
        cdProp = cdProp || {};
        auxF = auxF || undefined;

        var verbInfo = JSrealB.Module.Common.getWordFeature(unit, JSrealB.Config.get('feature.category.word.verb'));
        var conjugationTable = JSrealB.Config.get("rule").conjugation[verbInfo.tab];

        if(conjugationTable !== undefined)
        {   
            if(tense == 'ip') verbOptions.prog = false;//cause une erreur pour l'impératif au passif 

            return applyEnding(unit, tense, person, gender, conjugationTable, verbOptions, cdProp, auxF);
            // }
            
        }
        else
        {
            throw JSrealB.Exception.tableNotExists(unit, verbInfo.tab);
        }
    };

    return {
        conjugate: function(verb, tense, person, gender, verbOptions, cdProp, auxF) {
            var conjugatedVerb = null;

            try
            {
                conjugatedVerb = conjugate(verb, tense, person, gender, verbOptions, cdProp, auxF);
            }
            catch(err)
            {
                return "[[" + verb + "]]";
            }

            return conjugatedVerb;
        }
    };

})();

// Regular rule Application Module (only 1 rule, no choice)
JSrealB.Module.RegularRule = (function() {
    var applyEnding = function(unit, feature, ruleTable) {
        var newEnding = getValueByFeature(ruleTable.option, feature);

        if(newEnding !== null)
        {
            return stem(unit, ruleTable.ending) + newEnding;
        }
        else
        {
            return false;
        }
    };
    
    var apply = function(unit, category, feature) {
        var unitInfo = JSrealB.Module.Common.getWordFeature(unit, category);
        var ruleTable = [];
        for(var i in unitInfo.tab)
        {
            ruleTable[i] = JSrealB.Config.get("rule").regular[unitInfo.tab[i]];
        }
        
        if(ruleTable.length > 0)
        {
            var result = false;
            var j = 0;
            do
            {
                result = applyEnding(unit, feature, ruleTable[j]);
                
                j++;
            } while(result === false && j < ruleTable.length); 
            
            if(result === false)
            {
                throw JSrealB.Exception.wrongRule(unit, JSON.stringify(feature));
            }
            
            return result;
        }
        else
        {
            throw JSrealB.Exception.tableNotExists(unit, unitInfo.tab);
        }
    };
    
    return {
        apply: function(unit, category, feature) {
            var correctUnit = null;

            try
            {
                var properfeature = (feature === undefined) ? {} : feature;
                correctUnit = apply(unit, category, properfeature);
            }
            catch(err)
            {
                return "[[" + unit + "]]";
            }

            return correctUnit;
        }
    };
})();


JSrealB.Module.Common = (function() {
    var getUnitInfo = function(unit, category, avoidException) {
        var info = JSrealB.Config.get("lexicon")[unit];
        if(info !== undefined)
        {
            if(info[category] !== undefined)
            {
                return info[category];
            }
            else
            {
                if(avoidException === undefined || avoidException === false)
                    throw JSrealB.Exception.wordNotExists(unit, category);
                else
                    return null;
            }
        }
        else
        {
            if(avoidException === undefined || avoidException === false)
                throw JSrealB.Exception.wordNotExists(unit);
            else
                return null;
        }
    };
    
    return {
        getWordFeature: function(unit, category, avoidException) {
            return getUnitInfo(unit, category, avoidException);
        }
    };
})();

JSrealB.Module.Date = (function() {
    var year, month, date, day, hour, minute, second, customValue;
    
    var getYear = function() { return year; };
    var getMonth = function() { return month; };
    var getDate = function() { return date; };
    var getDay = function() { return day; };
    var getHour = function() { return hour; };
    var getMinute = function() { return minute; };
    var getSecond = function() { return second; };
    var getCustomValue = function() { return customValue; };
    
    var applyTextualDateRule = function(i, cat) {
        if(isNumeric(i))
        {
            var list = JSrealB.Config.get("rule").date.text[cat];

            if(list !== undefined && list[i] !== undefined)
            {
                return list[i];
            }
            else
            {
                throw JSrealB.Exception.wrongDate(cat);
            }
        }
        
    };
    
    var numberToMonth = function(n) {
        try
        {
            return applyTextualDateRule(n, "month");
        }
        catch(e)
        {
            return "[[" + n + "]]";
        }
    };
    
    var numberToDay = function(n) {
        try
        {
            return applyTextualDateRule(n, "weekday");
        }
        catch(e)
        {
            return "[[" + n + "]]";
        }
    };
    
    var numberWithLeadingZero = function(digit) {
        if(isNumeric(digit))
        {
            var number = getInt(digit).toString();
            if(number.length < 2)
            {
                number = "0" + number;
            }
            
            return number.toString();
        }
        
        return "[[" + digit + "]]";
    };
    
    var numberWithoutLeadingZero = function(digit) {
        if(isNumeric(digit))
        {
            return getInt(digit).toString();
        }
        
        return "[[" + digit + "]]";
    };
    
    var numberToMeridiem = function(n) {
        return applyTextualDateRule(((getInt(n) < 12) ? 0 : 1), "meridiem");
    };
    
    var numberTo12hour = function(n) {
        if(isNumeric(n))
        {
            return numberWithLeadingZero(getInt(n) >= 12 ? (getInt(n) - 12) : n);
        }
        
        return "[[" + n + "]]";
    };
    
    var doNothing = function(s) {
        return s;
    };
    
    //// Based on format of strftime [linux]
    var format = {
        Y: {
            param: getYear,
            func: numberWithoutLeadingZero
        },
        F: {
            param: getMonth,
            func: numberToMonth
        },
        m: {
            param: getMonth,
            func: numberWithLeadingZero
        },
        d: {
            param: getDate,
            func: numberWithLeadingZero
        },
        j: {
            param: getDate,
            func: numberWithoutLeadingZero
        },
        l: {
            param: getDay,
            func: numberToDay
        },
        A: {
            param: getHour,
            func: numberToMeridiem
        },
        h: {
            param: getHour,
            func: numberTo12hour
        },
        H: {
            param: getHour,
            func: numberWithLeadingZero
        },
        i: {
            param: getMinute,
            func: numberWithLeadingZero
        },
        s: {
            param: getSecond,
            func: numberWithLeadingZero
        },
        x: {
            param: getCustomValue,
            func: doNothing
        }
    };
    
    var getPatternKey = function(elementDisplayed, allElementList, separator) {
        var key = "";
        
        for(var i = 0, length = allElementList.length; i < length; i++)
        {
            if((allElementList[i] !== "second")
                    || getInt(eval(allElementList[i])) !== 0)
            {
                key += (elementDisplayed !== undefined
                        && elementDisplayed[allElementList[i]] !== undefined 
                        && elementDisplayed[allElementList[i]] === false) ? "" : allElementList[i] + separator;
            }
        }
        
        key =  trim(key);
        
        return (key.length > 0) ? key.substring(0, key.length - 1) : null;
    };
    
    var singlePatternRealization = function(pattern) {
        if(format[pattern] !== undefined)
        {
            return format[pattern].func(format[pattern].param());
        }
        
        return "[[" + pattern + "]]";
    };
    
    var patternRealization = function(pattern) {
        var c, realization = "", singlePattern = null;
        for(var i = 0, length = pattern.length; i < length; i++)
        {
            c = pattern.charAt(i);
            
            if(c === "[")
            {
                singlePattern = "";
            }
            else if(c === "]")
            {
                realization += singlePatternRealization(singlePattern);
                singlePattern = null;
            }
            else if(singlePattern !== null)
            {
                singlePattern += c;
            }
            else
            {
                realization += c;
            }
        }
        
        return realization;
    };
    
    var setFullDate = function(oDate) {
        year   = oDate.getFullYear();
        month  = oDate.getMonth() + 1;
        date   = oDate.getDate(); // month day
        day    = oDate.getDay(); // weekday
        hour   = oDate.getHours();
        minute = oDate.getMinutes();
        second = oDate.getSeconds();
    };
    
    var removeDeterminer = function(date, displayDeterminer) {
        var newDate = date;
        if(displayDeterminer !== undefined
                && displayDeterminer === false)
        {
            var pos = newDate.indexOf("[");
            if(pos >= 0)
            {
                newDate = newDate.substring(pos);
            }
        }
        
        return newDate;
    };
    
    var dateRealization = function(oDate, patternTable, firstPatternKey, secondPatternKey, displayDeterminer) {        
        var firstPart = "";
        if(firstPatternKey !== null
                && patternTable[firstPatternKey] !== undefined)
        {
            var firstPattern = removeDeterminer(patternTable[firstPatternKey], displayDeterminer);
            firstPart = patternRealization(firstPattern);
        }
        
        var secondPart = "";
        if(secondPatternKey !== null
                && patternTable[secondPatternKey] !== undefined)
        {
            var secondPattern = removeDeterminer(patternTable[secondPatternKey], displayDeterminer);
            secondPart = patternRealization(secondPattern);
        }
        
        return trim(firstPart + " " + secondPart);
    };
    
    var toWord = function(oDate, elementDisplayed) {
        setFullDate(oDate);
        
        var firstPatternKey = getPatternKey(elementDisplayed, ["year", "month", "date", "day"], "-");
        var secondPatternKey = getPatternKey(elementDisplayed, ["hour", "minute", "second"], ":");
        
        var patternTable = JSrealB.Config.get("rule").date.format.natural;
        
        return dateRealization(oDate, patternTable, firstPatternKey, secondPatternKey, 
                ((elementDisplayed !== undefined) ? elementDisplayed.det : undefined));
    };
    
    var formatter = function(oDate, elementDisplayed) {
        setFullDate(oDate);
        
        var firstPatternKey = getPatternKey(elementDisplayed, ["year", "month", "date", "day"], "-");
        var secondPatternKey = getPatternKey(elementDisplayed, ["hour", "minute", "second"], ":");
        
        var patternTable = JSrealB.Config.get("rule").date.format.non_natural;
        
        return dateRealization(oDate, patternTable, firstPatternKey, secondPatternKey);
    };
    
    var realDayDiff = function(oDate1, oDate2) {
        var timeDiff = oDate1.getTime() - oDate2.getTime();
        var diffDays = timeDiff / (1000 * 3600 * 24);

        return getFloat(diffDays);
    };
    
    var relativeDayDiff = function(oDate1, oDate2) {
        var tmpDate = new Date();
        
        var nbDayDiff = getInt(Math.ceil(realDayDiff(oDate1, oDate2)));
        
        tmpDate.setDate(tmpDate.getDate() + nbDayDiff);
        
        if(tmpDate.getDate() !== oDate1.getDate())
        {
            nbDayDiff--;
        }
        
        return nbDayDiff;
    };
    
    var toRelativeTime = function(oDate, elementDisplayed) {
        setFullDate(oDate);
        var today = new Date();
        
        var patternKey = relativeDayDiff(oDate, today);
        var patternTable = JSrealB.Config.get("rule").date.format.relative_time;
        
        if(patternTable[patternKey] === undefined)
        {
            customValue = Math.abs(patternKey);
            patternKey = (patternKey < 0) ? "-" : "+";
        }
        
        return dateRealization(oDate, patternTable, patternKey.toString(), null);
    };
    
    return {
        toWord: function(oDate, elementDisplayed) {
            return toWord(oDate, elementDisplayed);
        },
        formatter: function(oDate, elementDisplayed) {
            return formatter(oDate, elementDisplayed);
        },
        toRelativeTime: function(oDate, elementDisplayed) {
            return toRelativeTime(oDate, elementDisplayed);
        }
    };
})();

//Functions from JSreal used to convert num to string (words)

// Fonctions importées de JSreal



JSrealB.Module.Number = (function() {
    var toWord = function(rawNumber, maxPrecision, grammaticalNumber,lang, gender) {
        // throw "TODO";
        var lang = lang || "fr";
        
        if(grammaticalNumber !== undefined)
        {
            grammaticalNumber(getGrammaticalNumber(getNumberFormat(rawNumber, maxPrecision, ".", "")));
        }

        var formattedNumber = formatter(rawNumber, maxPrecision, grammaticalNumber);

        var numberLettres = enToutesLettres(parseInt(rawNumber),lang == "en", gender)

        if( lang == "fr" && numberLettres == "un" && gender == "f"){
            numberLettres += "e";
        }

        return numberLettres;

    };
    
    var getNumberFormat = function(number, decimals, dec_point, thousands_sep) {
        // discuss at: http://phpjs.org/functions/number_format/
        // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        number = (number + '')
                .replace(/[^0-9+\-Ee.]/g, '');
        var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                sep = (typeof thousands_sep === 'undefined') ? '' : thousands_sep,
                dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
                s = '',
                toFixedFix = function (n, prec) {
                    var k = Math.pow(10, prec);
                    return '' + (Math.round(n * k) / k)
                            .toFixed(prec);
                };
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
                .split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '')
                .length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1)
                    .join('0');
        }
        return s.join(dec);
    };
    
    var formatter = function(rawNumber, maxPrecision, grammaticalNumber) {
        var precision = (maxPrecision === undefined) ? 2 : maxPrecision;
        var numberTable = JSrealB.Config.get("rule").number;
        precision = nbDecimal(rawNumber) > precision ? precision : nbDecimal(rawNumber);
        
        var formattedNumber = getNumberFormat(rawNumber, precision, numberTable.symbol.decimal, numberTable.symbol.group);
        
        if(grammaticalNumber !== undefined)
        {
            grammaticalNumber(getGrammaticalNumber(getNumberFormat(rawNumber, precision, ".", "")));
        }

        return formattedNumber;
    };
    
    var getGrammaticalNumber = function(rawNumber) {
        var properNumber = getInt(rawNumber);
        return (properNumber >= -1 && properNumber <= 1) ? 
                JSrealB.Config.get("feature.number.singular") : JSrealB.Config.get("feature.number.plural");
    };
    
    var isValid = function(s)
    {
        return s !== undefined && isNumeric(s);
    };

    //Fonctions pour la sortie en lettres:


    //Fonction EnToutesLettres par Guy Lapalme , légèrement modifiée par Francis pour accomoder le genre

    function enToutesLettres(s,en){
        var trace=false; // utile pour la mise au point

        // expressions des unités pour les "grands" nombres >1000 
        // expressions donnent les formes [{singulier, pluriel}...]
        //  noms de unités selon l'échelle courte présentée dans le Guide Antidote
        // elle diffère de celle présentée dans http://villemin.gerard.free.fr/TABLES/NbLettre.htm
        var unitesM=[ {sing:"mille"         ,plur:"mille"}        // 10^3
                     ,{sing:"un million"    ,plur:"millions"}     // 10^6
                     ,{sing:"un milliard"   ,plur:"milliards"}    // 10^9
                     ,{sing:"un trillion"   ,plur:"trillions"}    // 10^12
                     ,{sing:"un quatrillion",plur:"quatrillions"} // 10^15
                     ,{sing:"un quintillion",plur:"quintillions"} // 10^18
                    ];
        var unitsM =[ {sing:"one thousand"      ,plur:"thousand"}    // 10^3
                     ,{sing:"one million"       ,plur:"million"}     // 10^6
                     ,{sing:"one billion"       ,plur:"billion"}     // 10^9
                     ,{sing:"one trillion"      ,plur:"trillion"}    // 10^12
                     ,{sing:"one quatrillion"   ,plur:"quatrillion"} // 10^15
                     ,{sing:"one quintillion"   ,plur:"quintillion"} // 10^18
                    ];

        var maxLong=21;  // longueur d'une chaîne de chiffres traitable (fixé par la liste unitesM)

        // séparer une chaine en groupes de trois et complétant le premier groupe avec des 0 au début
        function splitS(s){
            if(s.length>3)
                return splitS(s.slice(0,s.length-3)).concat([s.slice(s.length-3)]);
            else if (s.length==1)s="00"+s;
            else if (s.length==2)s="0"+s
            return [s];
        }
        // est-ce que tous les triplets d'une liste correspondent Ã  0 ?
        function tousZero(ns){
            if(ns.length==0)return true;
            return (ns[0]=="000")&&tousZero(ns.slice(1));
        }

        // création d'une liste de triplets de chiffres
        function grouper(ns){ // ns est une liste de chaines de 3 chiffres
            var l=ns.length;
            if(trace)console.log("grouper:"+l+":"+ns);
            var head=ns[0];
            if(l==1)return centaines(head);
            var tail=ns.slice(1);
            if(head=="000")return grouper(tail);
            var uM=en?unitsM:unitesM;
            return (head=="001"?uM[l-2].sing:(grouper([head])+" "+uM[l-2].plur))+" "
                   +(tousZero(tail)?"":grouper(tail));
        }

        // traiter un nombre entre 0 et 999
        function centaines(ns){ // ns est une chaine d'au plus trois chiffres
            if(trace)console.log("centaines:"+ns);
            if(ns.length==1)return unites(ns);
            if(ns.length==2)return dizaines(ns);
            var c=ns[0];        // centaines
            var du=ns.slice(1); // dizaines+unités
            if(c=="0") return dizaines(du);
            var cent=en?"hundred":"cent"
            if(du=="00"){
                if(c=="1") return (en?"one ":"")+cent;
                return unites(c)+" "+cent+(en?"":"s");
            }
            if(c=="1") return (en?"one ":"")+cent+" "+dizaines(du);
            return unites(c)+" "+cent+(en?" and ":" ")+dizaines(du);
        }

        // traiter un nombre entre 10 et 99
        function dizaines(ns){// ns est une chaine de deux chiffres
            if(trace)console.log("dizaines:",ns);
            var d=ns[0]; // dizaines
            var u=ns[1]; // unités
            switch  (d){
                case "0": return unites(u);
                case "1":
                    return (en?["ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"]
                              :["dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf"])[+u];
                case "2": case "3": case "4": case "5": case "6":
                    var tens = (en?["twenty","thirty","forty","fifty","sixty"]
                    :["vingt","trente","quarante","cinquante","soixante"])[d-2];
                    if (u==0) return tens;
                    return tens + (u=="1" ? (en?"-one":" et un"): ("-"+unites(u)));
                case "7":
                    if(u==0) return en?"seventy":"soixante-dix"
                    return en?("seventy-"+unites(u)):("soixante-"+dizaines("1"+u));
                case "8":
                    if(u==0) return en?"eighty":"quatre-vingts";
                    return (en?"eighty-":"quatre-vingt-")+unites(u);
                case "9":
                    if(u==0) return en?"ninety":"quatre-vingt-dix";
                    return en?("ninety-"+unites(u)):("quatre-vingt-"+dizaines("1"+u));
            }
        }

        // traiter un chiffre entre 0 et 10
        function unites(u){ // u est une chaine d'un chiffre
            return (en?["zero","one","two","three","four","five","six","seven","eight","nine"]
                      :["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf"])[+u];// conversion
        }
        
    /// début de l'exécution de la fonction
        if(typeof s=="number")s=""+s; // convertir un nombre en chaÃ®ne
        if(!/^-?\d+$/.test(s))
            throw "nombreChaineEnLettres ne traite que des chiffres:"+s;
        var neg=false;
        if(s[0]=="-"){
            neg=true;
            s=s.slice(1);
        }
        if(s.length>maxLong)
            throw "nombreChaineEnLettres ne traite que les nombres d'au plus "+maxLong+" chiffres:"+s;
        return (neg?(en?"minus ":"moins "):"")+grouper(splitS(s)).trim();
    }

    // si l'orthographe française rectifiée est demandée, appliquer cette fonction à la sortie
    // de enToutesLettres() pour mettre des tirets à la place des espaces partout dans le nombre...
    function rectifiee(s){
        return s.replace(/ /g,"-");
    }
    
    return {
        formatter: function(rawNumber, maxPrecision, grammaticalNumber) {
            var formattedNumber = null;

            try
            {
                if(isValid(rawNumber))
                {
                    formattedNumber = formatter(rawNumber, maxPrecision, grammaticalNumber);
                }
                else
                {
                    throw JSrealB.Exception.wrongNumber(rawNumber);
                }

                return formattedNumber;
            }
            catch(e)
            {
                return "[[" + rawNumber + "]]";
            }
        },
        toWord: function(rawNumber, maxPrecision, grammaticalNumber, language, gender) {
            var numberToWord = null;

            try
            {
                if(isValid(rawNumber))
                {
                    numberToWord = toWord(rawNumber, maxPrecision, grammaticalNumber, language, gender);
                }
                else
                {
                    throw JSrealB.Exception.wrongNumber(rawNumber);
                }

                return numberToWord;
            }
            catch(e)
            {
                return "[[" + rawNumber + "]]";
            }
        },
        getGrammaticalNumber: function(rawNumber) {
            var grammaticalNumber = null;

            try
            {
                if(isValid(rawNumber))
                {
                    grammaticalNumber = getGrammaticalNumber(rawNumber);
                }
                else
                {
                    throw JSrealB.Exception.wrongNumber(rawNumber);
                }

                return grammaticalNumber;
            }
            catch(e)
            {
                return "[[" + rawNumber + "]]";
            }
        },
        getNumberFormat: function(number, decimals, dec_point, thousands_sep) {
            return getNumberFormat(number, decimals, dec_point, thousands_sep);
        },
        toRelativeNumber: function(rawNumber)
        {
            var numberToWord = null;

            try
            {
                if(isValid(rawNumber))
                {
                    //On veut seulement le nombre sans les décimales
                    numberToWord = toWord(rawNumber, 0, JSrealB.Config.get("feature.number.singular"));
                }
                else
                {
                    throw JSrealB.Exception.wrongNumber(rawNumber);
                }
                console.log(numberToWord);

                return numberToWord;
            }
            catch(e)
            {
                return "[[" + rawNumber + "]]";
            }
        }
    };
})();

/*
 * Utils
 */
var isString = function(s)
{
    return (typeof s === "string");
};

var isNumeric = function(n)
{
    return !isNaN(getFloat(n)) && isFinite(n);
};

// https://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
var nbDecimal = function(n) {
  var match = (''+n).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max(
       0,
       // Number of digits right of decimal point.
       (match[1] ? match[1].length : 0)
       // Adjust for scientific notation.
       - (match[2] ? +match[2] : 0));
};

var isBoolean = function(b) {
    return (b === true || b === false);
};

var isObject = function(o) {
    return (typeof o === "object" && !Array.isArray(o));
};

var getInt = function(n) {
    return parseInt(n, 10);
};

var getFloat = function(n) {
    return parseFloat(n, 10);
};

var intVal = function(str) {
    var numberTable = str.split(' ').join('').match(/-?\d+/);
    var output = (numberTable !== null) ? getInt(numberTable[0]) : null;
    return output;
};

var ltrim = function(str) {
    return str.replace(/^\s+/,"");
};

var rtrim = function(str) {
    return str.replace(/\s+$/,"");
};

var trim = function (str) {
    return str.replace(/^\s+|\s+$/g,"");
};

var stem = function(str, ending){
    if (ending.length > 0)
    {
        var start = str.length - ending.length;
        if (start < 0 || str.substring(start) !== ending)
        {
            throw JSrealB.Exception.wrongEnding(str, ending);
        }
        
        return str.substring(0, start);
    }
    return str;
};

var inArray = function(array, value)
{
    if(value === undefined) return false;
    
    return (array.indexOf(value) >= 0);
};

var contains = function(obj, value)
{
    if(Array.isArray(obj))
    {
        return inArray(obj, value);
    }
    else if(isObject(obj))
    {
        var typeOfValue = (typeof value);
        var valueOfObject = false;
        for(var prop in obj)
        {
            if(typeof obj[prop] === typeOfValue)
            {
                if(obj[prop] === value)
                {
                    valueOfObject = true;
                    break;
                }
            }
            else
            {
                valueOfObject = contains(obj[prop], value);
                if(valueOfObject) break;
            }
        }
        
        return valueOfObject;
    }
    else if(obj === value)
    {
        return true;
    }
    
    return false;
};

var stripLeftHtml = function(html)
{
    return html.replace(/^<([^>]+)>/i,"");
}

var fetchFromObject = function(obj, prop, value) {
    if(obj === undefined)
        return undefined;

    var _index = prop.indexOf('.');

    if(_index > -1)
        return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index+1), value);
    else if(value !== undefined)
        return obj[prop] = value;
    else
        return obj[prop];
};

var getValueByFeature = function(featureList, featureRequested) {
    var value = null;
    var i = 0;
    var featureLength = Object.keys(featureList).length;
    var j = 0;
    var currentFeatureList = {};
    var currentFeatureLength = 0;
    var featureRequestedLength = 0;
    var nbMatchedFeature = 0;
    var nbNotMatchedFeature = 0;
    var nbMissingFeature = 0;
    var bestSolution = null;
    var bestSolutionScore = 0;
    var bestSolutionErrorNb = 0;
    var bestSolutionMissingFeatureNb = 1000;
    var defaultValue = null;
    while(i < featureLength && value === null)
    {
        j = 0;
        nbMatchedFeature = 0;
        nbNotMatchedFeature = 0;
        nbMissingFeature = 0;
        currentFeatureLength = Object.keys(featureList[i]).length;
        currentFeatureList = Object.keys(featureRequested);
        featureRequestedLength = currentFeatureList.length;
        while(j < featureRequestedLength)
        {
            
            if(featureList[i].hasOwnProperty(currentFeatureList[j])
                    && (featureList[i][currentFeatureList[j]]
                            === featureRequested[currentFeatureList[j]]
                        || featureList[i][currentFeatureList[j]] === "x" // x accepts all values
                        )
                    && featureRequested[currentFeatureList[j]] !== null
                )
            {
                nbMatchedFeature++;
            }
            else if(featureList[i].hasOwnProperty(currentFeatureList[j]))
            {
                nbNotMatchedFeature++;
            }
            else
            {
                nbMissingFeature++;
            }
            
            j++;
        }
        
        // better solution : more matching features
        if(nbMatchedFeature >= currentFeatureLength - 1     // we remove "val" key
                && nbMatchedFeature > bestSolutionScore)
        {
            bestSolution = featureList[i];
            bestSolutionScore = nbMatchedFeature;
            bestSolutionMissingFeatureNb = nbMissingFeature;
        }
        // better solution : less not matching features
        else if(nbMatchedFeature >= currentFeatureLength - 1  // we remove "val" key
                && nbMatchedFeature === bestSolutionScore
                && nbNotMatchedFeature < bestSolutionErrorNb)
        {
            bestSolution = featureList[i];
            bestSolutionErrorNb = nbNotMatchedFeature;
            bestSolutionMissingFeatureNb = nbMissingFeature;
        }
        // better solution : 
        else if(nbMatchedFeature > 0
                && nbNotMatchedFeature === 0
                && nbMatchedFeature > bestSolutionScore
                && nbMissingFeature <= bestSolutionMissingFeatureNb)
        {
            bestSolution = featureList[i];
            bestSolutionErrorNb = nbNotMatchedFeature;
            bestSolutionMissingFeatureNb = nbMissingFeature;
        }
        
        
        if(nbMatchedFeature === featureRequestedLength
                || (featureLength === 1 && nbNotMatchedFeature === 0)) // if there is only 1 feature
        {
            value = featureList[i]['val'];
        }
        // Default Value
        else if(currentFeatureLength === 1 // only val
                && nbNotMatchedFeature === 0)
        {
            defaultValue = featureList[i]['val'];
        }

        i++;
    }

    return (value !== null) ? value : ((bestSolution !== null) ? bestSolution['val'] : defaultValue);
};

// https://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
function extend(base, sub) {
    // Avoid instantiating the base class just to setup inheritance
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
    // for a polyfill
    // Also, do a recursive merge of two prototypes, so we don't overwrite 
    // the existing prototype, but still maintain the inheritance chain
    var origProto = sub.prototype;
    sub.prototype = Object.create(base.prototype);
    for (var key in origProto) {
        sub.prototype[key] = origProto[key];
    }
    // Remember the constructor property was set wrong, let's fix it
    sub.prototype.constructor = sub;
    // In ECMAScript5+ (all modern browsers), you can make the constructor property
    // non-enumerable if you define it like this instead
    Object.defineProperty(sub.prototype, 'constructor', {
        enumerable: false,
        value: sub
    });
}

// simplification of JSrealB loading
//   dataDir: relative or absolute path to the data directory
//   language: "en" | "fr"
//   fn : function to call once loading is completed
function loadLanguage(dataDir,language,fn){
    JSrealLoader({
        language: language,
        lexiconUrl: dataDir+"lex-"+language+".json",
        ruleUrl: dataDir+"rule-"+language+".json",
        featureUrl: dataDir+"feature.json"
    }, 
    fn,
    function(mess){
        alert(mess)
    })
}
/**
 * HTTP Request
 */
JSrealB.Request = (function() {
    var createCORSRequest = function(method, url) {
        var xhr = new XMLHttpRequest();
        if (xhr.overrideMimeType)
        {
            xhr.overrideMimeType("application/json");
        }
        if ("withCredentials" in xhr) { // XHR for Chrome/Firefox/Opera/Safari.
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest !== "undefined") { // XDomainRequest for IE.
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            xhr = null; // CORS not supported.
        }
        return xhr;
    };
    
    var httpGetRequest = function(url, success, failure) {

        var request = createCORSRequest("GET", url);
        if (!request) {
            JSrealB.Logger.alert('HTTP Get Request not supported');
            return;
        }
        request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200 || request.status === 0)
                success(request.responseText);
            else if (failure)
                failure(request.status, request.statusText);
            }
        };
        request.send(null);
    };
    
    return {
        getJson: function(url, success, failure) {
            
            if(typeof url === "undefined")
            {
                failure(610, "Incorrect url: " + url);
                return;
            }
            
            httpGetRequest(
                url, 
                function(rawData) {
                    try
                    {
                        var json = JSON.parse(rawData);
                        success(json);
                    }
                    catch(error)
                    {
                        failure(611, "JSON parsing error: " + error + " with " + url);
                    }
                },
                failure);
        }
    };
})();

/*
 * Configuration
 */
JSrealB.Config = (function() {
    
    var config = {
        language: JSrealE.language.english,
        isDevEnv: false,
        printTrace: false,
        lexicon: {},
        rule: {},
        feature: {},
    };
    
    return {
        add: function(args) {
            var newSettings = {};
            for(var key in args)
            {
                if(config[key] === undefined)
                {
                    config[key] = args[key];
                    newSettings[key] = config[key];
                }
            }
            
            return newSettings;
        },
        set: function(args) {
            var newSettings = {};
            for(var key in args)
            {
                if(config[key] !== undefined)
                {
                    config[key] = args[key];
                    
                    newSettings[key] = config[key];
                }
            }
            
            return newSettings;
        },
        get: function(key) {
            var val = fetchFromObject(config, key);
            
            if(val !== undefined)
                return val;
            
            JSrealB.Logger.warning(key + " is not defined!");
            return null;
        }
    };
})();

/*
 * Exception
 */
JSrealB.Exception = (function() {
    
    var exceptionConfig = {
        exception: {
            4501: {
                "en": "doesn't exist in lexicon",
                "fr": "n'est pas présent dans le lexique"
            },
            4502: {
                "en": "isn't a valid number",
                "fr": "n'est pas un nombre bien formé"
            },
            4503: {
                "en": "has no rule with table id",
                "fr": "n'a pas de règle avec l'id"
            },
            4504: {
                "en": "has no ending",
                "fr": "n'a pas la terminaison"
            },
            4505: {
                "en": "doesn't conjugate in",
                "fr": "ne se conjugue pas au"
            },
            4506: {
                "en": "doesn't use this person or person doesn't exist, person =",
                "fr": "n'utilise pas cette personne ou cette personne n'existe pas, person ="
            },
            4507: {
                "en": "isn't a valid date, wrong format",
                "fr": "n'est pas une date dans un format valide"
            },
            4508: {
                "en": "doesn't decline with these properties, for category ",
                "fr": "ne se décline pas avec ces propriétés, pour la catégorie"
            },
            4509: {
                "en": "isn't a punctuation mark",
                "fr": "n'est pas un signe de ponctuation"
            },
            4510: {
                "en": "is not supported",
                "fr": "n'est pas supporté"
            },
            4512: {
                "en": "doesn't know rule with properties",
                "fr": "ne connait pas de règle avec les propriétés"
            },
            4513: {
                "en": "isn't a valid value for",
                "fr": "n'est pas une valeur valide pour"
            },
            4514: {
                "en": "has no headword",
                "fr": "n'a pas de noeud"
            }
        }
    };
    
    var exception = function(id, unit, info1, info2) {        
        var msg = unit + " " + exceptionConfig.exception[id][JSrealB.Config.get("language")];
        if(info1 !== undefined) msg += " " + info1;
        if(info2 !== undefined) msg += ", " + info2;
        
        JSrealB.Logger.warning(msg);
        
        return msg;
    };

    return {
        wordNotExists: function(u) {
            return exception(4501, u);
        },
        wrongNumber: function(u) {
            return exception(4502, u);
        },
        wrongDate: function(u) {
            return exception(4507, u);
        },
        tableNotExists: function(u, tableId) {
            return exception(4503, u, tableId);
        },
        wrongEnding: function(u, ending) {
            return exception(4504, u, ending);
        },
        wrongTense: function(u, tense) {
            return exception(4505, u, tense);
        },
        wrongDeclension: function(u, category, feature) {
            return exception(4508, u, category, feature);
        },
        wrongRule: function(u, feature) {
            return exception(4512, u, feature);
        },
        wrongPerson: function(u, p) {
            return exception(4506, u, p);
        },
        wrongPunctuation: function(u) {
            return exception(4509, u);
        },
        pcMarkNotSupported: function(u) {
            return exception(4510, u);
        },
        invalidInput: function(u, i) {
            return exception(4513, u, i);
        },
        headWordNotFound: function(u) {
            return exception(4514, u);
        }
    };
})();

/*
 * Logger
 */
JSrealB.Logger = (function() {
    var debug = function(message) {
        if(JSrealB.Config.get("isDevEnv"))
        {
            console.log('%cDebug: ' + message, 'background: #CEE3F6; color: black');
        }
    };
    
    var info = function(message) {
        console.log(message);
    };
    
    var warning = function(message) {
        if(message!="rule.compound.aux is not defined!")console.warn(message);

        if(JSrealB.Config.get("printTrace"))
        {
            console.trace();
        }
    };
    
    var alert = function(message) {
        console.error(message);
        
        if(JSrealB.Config.get("printTrace"))
        {
            console.trace();
        }
    };
    
    return {
        print: function(object) {
            print(object);
        },
        debug: function(message) {
            debug(message);
        },
        info: function(message) {
            info(message);
        },
        warning: function(message) {
            warning(message);
        },
        alert: function(message) {
            alert(message);
        }
    };
})();

/**
 * 
 * Initialization
 */
var JSrealBResource = {en: {}, fr: {}, common: {}};

var JSrealLoader = function(resource, done, fail) {
    
    var language = resource.language;

    // Checks language
    if(language === undefined
            || Object.keys(JSrealBResource).indexOf(language) < 0)
    {
        fail("Undefined or wrong language");
        return;
    }
    
    // Uses cache
    if(typeof JSrealBResource[language]["lexicon"] !== "undefined"
            && typeof JSrealBResource[language]["rule"] !== "undefined"
            && typeof JSrealBResource.common.feature !== "undefined")
    {
        JSrealB.init(language, JSrealBResource[language]["lexicon"], 
            JSrealBResource[language]["rule"], JSrealBResource.common.feature);
        done();
        return;
    }
    
    var lexiconUrl = resource.lexiconUrl;
    var ruleUrl = resource.ruleUrl;
    var featureUrl = resource.featureUrl;
    
    JSrealB.Request.getJson(
        lexiconUrl,
        function(lexicon)
        {
            JSrealBResource[language]["lexicon"] = lexicon;
            JSrealB.Request.getJson(
                ruleUrl,
                function(rule)
                {
                    JSrealBResource[language]["rule"] = rule;
                    if(typeof JSrealBResource.common.feature !== "undefined")
                    {
                        JSrealB.init(language, lexicon, rule, 
                            JSrealBResource.common.feature);
                        done();
                    }
                    else
                    {
                        JSrealB.Request.getJson(
                            featureUrl,
                            function(feature)
                            {
                                JSrealBResource.common.feature = feature;

                                JSrealB.init(language, lexicon, rule, feature);

                                done();
                            }, 
                            function(status, error) {
                                JSrealB.Logger.alert("Dictionary loading : " 
                                        + status + " : " + error);
                                if(fail) fail(error);
                            }
                        );
                    }
                }, 
                function(status, error) {
                    JSrealB.Logger.alert("Rule loading : " + status + " : " + error);
                    if(fail) fail(error);
                }
            );
        }, 
        function(status, error) {
            JSrealB.Logger.alert("Lexicon loading : " + status + " : " + error);
            if(fail) fail(error);
        }
    );
};////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// Lexicon Fr                                                                     //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

var lexiconFr = {
    " ": {
        "Pc": {
            "tab": ["pc1"]
        }
    },
    ".": {
        "Pc": {
            "tab": ["pc4"]
        }
    },
    "...": {
        "Pc": {
            "tab": ["pc4"]
        }
    },
    ",": {
        "Pc": {
            "tab": ["pc4"]
        }
    },
    ";": {
        "Pc": {
            "tab": ["pc2"]
        }
    },
    ":": {
        "Pc": {
            "tab": ["pc2"]
        }
    },
    "!": {
        "Pc": {
            "tab": ["pc4"]
        }
    },
    "?": {
        "Pc": {
            "tab": ["pc4"]
        }
    },
    "?!": {
        "Pc": {
            "tab": ["pc4"]
        }
    },
    "-": {
        "Pc": {
            "tab": ["pc1"]
        }
    },
    "\"": {
        "Pc": {
            "compl": "\"",
            "tab": ["pc5","pc6"]
        }
    },
    "*": {
        "Pc": {
            "compl": "*",
            "tab": ["pc5","pc6"]
        }
    },
    "(": {
        "Pc": {
            "compl": ")",
            "tab": ["pc5"]
        }
    },
    ")": {
        "Pc": {
            "compl": "(",
            "tab": ["pc6"]
        }
    },
    "[": {
        "Pc": {
            "compl": "]",
            "tab": ["pc5"]
        }
    },
    "]": {
        "Pc": {
            "compl": "[",
            "tab": ["pc6"]
        }
    },
    "{": {
        "Pc": {
            "compl": "}",
            "tab": ["pc5"]
        }
    },
    "}": {
        "Pc": {
            "compl": "{",
            "tab": ["pc6"]
        }
    },
    "être": {
        "V": {
            "tab": "v136",
            "aux": ["av"]
        },
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "avoir": {
        "V": {
            "tab": "v135",
            "aux": ["av"]
        },
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "que": {
        "Pro": {
            "tab": ["pn22","pn31"]
        }
    },
    "de": {
        "P": {
            "tab": ["ppe"]
        }
    },
    "à": {
        "P": {
            "tab": ["pp"]
        }
    },
    "par": {
        "P": {
            "tab": ["pp"]
        }
    },
    "au": {
        "D": {
            "tab": ["d2"]
        }
    },
    "le": {
        "D": {
            "tab": ["d1"]
        },
        "Pro": {
            "g": "m",
            "tab": ["d1"]
        }
    },
    "un": {
        "D": {
            "tab": ["d4"]
        }
    },
    "du": {
        "D": {
            "tab": ["d3"]
        }
    },
    "ce": {
        "D": {
            "tab": ["d7"]
        },
        "Pro": {
            "g": "n",
            "tab": ["pn14"]
        }
    },
    "mon": {
        "D": {
            "tab": ["d5"]
        }
    },
    "ton": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "son": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "notre": {
        "D": {
            "tab": ["d6"]
        }
    },
    "je": {
        "Pro": {
            "tab": ["pn1"]
        }
    },
    "me": {
        "Pro": {
            "tab": ["pn2","pn3","pn6"]
        }
    },
    "moi": {
        "Pro": {
            "tab": ["pn4","pn7"]
        }
    },
    "moi-même": {
        "Pro": {
            "tab": ["pn8"]
        }
    },
    "y": {
        "Pro": {
            "tab": ["pn11"]
        }
    },
    "en": {
        "Pro": {
            "tab": ["pn10"]
        }
    },
    "soi-même": {
        "Pro": {
            "tab": ["pn9"]
        }
    },
    "ça": {
        "Pro": {
            "g": "n",
            "tab": ["pn18"]
        }
    },
    "ceci": {
        "Pro": {
            "g": "n",
            "tab": ["pn16"]
        }
    },
    "cela": {
        "Pro": {
            "g": "n",
            "tab": ["pn19"]
        }
    },
    "celui": {
        "Pro": {
            "g": "m",
            "tab": ["pn15"]
        }
    },
    "celui-ci": {
        "Pro": {
            "g": "m",
            "tab": ["pn17"]
        }
    },
    "celui-là": {
        "Pro": {
            "g": "m",
            "tab": ["pn20"]
        }
    },
    "personne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rien": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "qui": {
        "Pro": {
            "tab": ["pn21","pn21","pn30","pn30"]
        }
    },
    "quoi": {
        "Pro": {
            "g": "n",
            "tab": ["pn29","pn29"]
        }
    },
    "dont": {
        "Pro": {
            "tab": ["pn23"]
        }
    },
    "où": {
        "Pro": {
            "tab": ["pn27","pn27"]
        }
    },
    "lequel": {
        "Pro": {
            "tab": ["pn24","pn24"]
        }
    },
    "auto": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "gars": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "amant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "clinique": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "même": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "premier": {
        "A": {
            "pos": "pre",
            "tab": ["n39"]
        }
    },
    "ne": {
        "Adv": {
            "tab": ["ave"]
        }
    },
    "pas": {
        "Adv": {
            "tab": ["av"]
        },
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "un peu": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "activement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "abaisser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "abandonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "abattre": {
        "V": {
            "tab": "v87",
            "aux": ["av"]
        }
    },
    "abbé": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "abeille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "abîme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "abîmer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "abondamment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "abondance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "abondant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "abord": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "aborder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "aboutir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "aboyer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "abri": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "abriter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "absence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "absent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "absolu": {
        "A": {
            "tab": ["n28"]
        }
    },
    "absolument": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "abuser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "accabler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "accepter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "accident": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "acclamation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "acclamer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "accompagner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "accomplir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "accord": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "accorder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "accourir": {
        "V": {
            "tab": "v57",
            "aux": ["aê"]
        }
    },
    "accrocher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "accueil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "accueillir": {
        "V": {
            "tab": "v51",
            "aux": ["av"]
        }
    },
    "accuser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "acharner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "achat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "acheminer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "acheter": {
        "V": {
            "tab": "v11",
            "aux": ["av"]
        }
    },
    "acheteur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "achever": {
        "V": {
            "tab": "v25",
            "aux": ["av"]
        }
    },
    "acide": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "acier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "acquérir": {
        "V": {
            "tab": "v39",
            "aux": ["av"]
        }
    },
    "acquitter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "acte": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "actif": {
        "A": {
            "tab": ["n46"]
        }
    },
    "action": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "activer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "activité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "actuel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "actuellement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "adieu": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "admettre": {
        "V": {
            "tab": "v89",
            "aux": ["av"]
        }
    },
    "administration": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "administrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "admirable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "admiration": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "admirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "adopter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "adorer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "adoucir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "adresse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "adresser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "adroit": {
        "A": {
            "tab": ["n28"]
        }
    },
    "adversaire": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "aérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "affaiblir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "affaire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "affairé": {
        "A": {
            "tab": ["n28"]
        }
    },
    "affection": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "affectionner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "affectueusement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "affectueux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "affiche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "affliger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "affreux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "agacer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "âge": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "âgé": {
        "A": {
            "tab": ["n28"]
        }
    },
    "agent": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "agile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "agir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "agitation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "agiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "agréable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "agréablement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "agréer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "agrément": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "agrémenter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "aide": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "aider": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "aigu": {
        "A": {
            "tab": ["n45"]
        }
    },
    "aiguille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "aiguiser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "aile": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ailleurs": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "aimable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "aimer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "aîné": {
        "A": {
            "tab": ["n28"]
        }
    },
    "ainsi": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "air": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "aire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "aisance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "aise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "aisé": {
        "A": {
            "tab": ["n28"]
        }
    },
    "aisément": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "ajouter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "alcool": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "alcoolique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "alentours": {
        "N": {
            "g": "m",
            "tab": ["n1"]
        }
    },
    "alerte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "aligner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "aliment": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "allée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "allégresse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "allemand": {
        "A": {
            "tab": ["n28"]
        }
    },
    "aller": {
        "V": {
            "tab": "v137",
            "aux": ["êt"]
        }
    },
    "allonger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "allumer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "allumette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "allure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "alors": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "alouette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "amateur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ambulance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "âme": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "amende": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "amener": {
        "V": {
            "tab": "v24",
            "aux": ["av"]
        }
    },
    "amer": {
        "A": {
            "tab": ["n39"]
        }
    },
    "américain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "ami": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "amical": {
        "A": {
            "tab": ["n47"]
        }
    },
    "amicalement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "amitié": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "amour": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ample": {
        "A": {
            "tab": ["n25"]
        }
    },
    "amusant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "amusement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "amuser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "ancien": {
        "A": {
            "tab": ["n49"]
        }
    },
    "âne": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ange": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "anglais": {
        "A": {
            "tab": ["n27"]
        }
    },
    "angle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "angoisse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "animal": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "animation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "animer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "anneau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "année": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "anniversaire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "annonce": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "annoncer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "annuel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "anticiper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "anxiété": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "anxieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "août": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "apaiser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "apercevoir": {
        "V": {
            "tab": "v63",
            "aux": ["av"]
        }
    },
    "apostolique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "apôtre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "apparaître": {
        "V": {
            "tab": "v101",
            "aux": ["aê"]
        }
    },
    "apparence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "apparition": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "appartement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "appartenir": {
        "V": {
            "tab": "v52",
            "aux": ["av"]
        }
    },
    "appel": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "appeler": {
        "V": {
            "tab": "v7",
            "aux": ["av"]
        }
    },
    "appétissant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "appétit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "applaudir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "application": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "appliquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "apporter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "apprécier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "apprendre": {
        "V": {
            "tab": "v90",
            "aux": ["av"]
        }
    },
    "apprêter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "approche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "approcher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "approuver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "appui": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "appuyer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "après": {
        "P": {
            "tab": ["pp"]
        }
    },
    "après-midi": {
        "N": {
            "g": "m",
            "tab": ["n24"]
        }
    },
    "araignée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "arbitre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "arbre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "arbuste": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "architecte": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ardent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "ardeur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ardoise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "argent": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "argenter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "arme": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "armée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "armer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "armoire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "arracher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "arranger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "arrêt": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "arrêter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "arrière": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "arrivée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "arriver": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "arrondir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "arrondissement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "arroser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "art": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "article": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "artiste": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "aspirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "assaut": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "assembler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "asseoir": {
        "V": {
            "tab": "v74",
            "aux": ["av"]
        }
    },
    "assez": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "assidu": {
        "A": {
            "tab": ["n28"]
        }
    },
    "assiette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "assister": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "associer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "assurer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "astre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "atelier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "atmosphère": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "attachement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "attacher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "attaque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "attaquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "attarder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "atteindre": {
        "V": {
            "tab": "v97",
            "aux": ["av"]
        }
    },
    "atteler": {
        "V": {
            "tab": "v7",
            "aux": ["av"]
        }
    },
    "attendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "attente": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "attentif": {
        "A": {
            "tab": ["n46"]
        }
    },
    "attention": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "attentivement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "attester": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "attirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "attrait": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "attraper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "attribuer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "attrister": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "aube": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "aubépine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "auberge": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "augmenter": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "aujourd'hui": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "aumône": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "auparavant": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "auprès": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "aurore": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "aussi": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "aussitôt": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "autant": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "autel": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "auteur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "automne": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "automobile": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "autoriser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "autorité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "autre": {
        "A": {
            "pos": "pre",
            "tab": ["n25"]
        }
    },
    "autrefois": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "autrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "avaler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "avance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "avancer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "avant": {
        "P": {
            "tab": ["pp"]
        }
    },
    "avantage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "avantageux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "avec": {
        "P": {
            "tab": ["pp"]
        }
    },
    "avenir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "aventure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "aventurer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "avenue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "averse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "avertir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "aveugle": {
        "A": {
            "tab": ["n25"]
        }
    },
    "aviateur": {
        "N": {
            "g": "m",
            "tab": ["n56"]
        }
    },
    "avion": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "avis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "aviser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "avoine": {
        "N": {
            "g": "m",
            "tab": ["n17"]
        }
    },
    "avouer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "avril": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "azur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "azuré": {
        "A": {
            "tab": ["n28"]
        }
    },
    "bagage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "baguette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "baigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bâiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "baiser": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "baisser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bal": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "balancer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "balançoire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "balayer": {
        "V": {
            "tab": "v4",
            "aux": ["av"]
        }
    },
    "balcon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "balle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ballon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bambin": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "banane": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "banc": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bande": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bandit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "banque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "banquier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "baptême": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "baptiser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "barbe": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "barque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "barquette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "barrage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "barre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "barreau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "barrière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bas": {
        "A": {
            "tab": ["n50"]
        }
    },
    "basse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "basse-cour": {
        "N": {
            "g": "f",
            "tab": ["nI"]
        }
    },
    "bassin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bataille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bateau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "bâtiment": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bâtir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "bâton": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "battre": {
        "V": {
            "tab": "v87",
            "aux": ["av"]
        }
    },
    "bavarder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bazar": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "beau": {
        "A": {
            "pos": "pre",
            "tab": ["n108"]
        }
    },
    "beaucoup": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "beauté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bébé": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bec": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bêche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "belge": {
        "A": {
            "tab": ["n25"]
        }
    },
    "bénédiction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bénir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "berceau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "bercer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "béret": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "berger": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "bergère": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "besogne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "besoin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bétail": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bête": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "betterave": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "beurre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bibelot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bibliothèque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bicyclette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bien": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "bien-aimé": {
        "A": {
            "tab": ["n28"]
        }
    },
    "bien-être": {
        "N": {
            "g": "m",
            "tab": ["n35"]
        }
    },
    "bienfaisant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "bienfait": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bienfaiteur": {
        "N": {
            "g": "m",
            "tab": ["n56"]
        }
    },
    "bienheureux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "bientôt": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "bienveillance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bienveillant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "bière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bijou": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "bille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "billet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bise": {
        "N": {
            "g": "m",
            "tab": ["n17"]
        }
    },
    "bizarre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "blanc": {
        "A": {
            "tab": ["n61"]
        }
    },
    "blancheur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "blanchir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "blé": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "blesser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "blessure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bleu": {
        "A": {
            "tab": ["n28"]
        }
    },
    "bleuet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bloc": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "blond": {
        "A": {
            "tab": ["n28"]
        }
    },
    "blottir": {
        "V": {
            "tab": "v58",
            "aux": ["êt"]
        }
    },
    "blouse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bluet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "boeuf": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "boire": {
        "V": {
            "tab": "v121",
            "aux": ["av"]
        }
    },
    "bois": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "boisson": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "boîte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "boiteux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "bon": {
        "A": {
            "pos": "pre",
            "tab": ["n49"]
        }
    },
    "bonbon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bond": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bondir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "bonheur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bonhomme": {
        "N": {
            "g": "m",
            "tab": ["n11"]
        }
    },
    "bonjour": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bonne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bonnet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bonsoir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bonté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bord": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "border": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bordure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "borne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bosquet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bossu": {
        "A": {
            "tab": ["n28"]
        }
    },
    "botte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bouche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "boucher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "boucle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "boucler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bouder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "boue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "boueux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "bouger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "bougie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "boulanger": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "boulangerie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "boule": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bouleau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "boulevard": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bouleverser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bouquet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bourdonnement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bourdonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bourgeois": {
        "N": {
            "g": "m",
            "tab": ["n27"]
        }
    },
    "bourgeon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bourgeonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bourgmestre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bourrasque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bourse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bousculer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "bout": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bouteille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "boutique": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bouton": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "branche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bras": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "brave": {
        "A": {
            "tab": ["n25"]
        }
    },
    "bravo": {
        "N": {
            "g": "m",
            "tab": ["n3","n87"]
        }
    },
    "brebis": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "brèche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "bref": {
        "A": {
            "tab": ["n38"]
        }
    },
    "brigand": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "brillant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "briller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "brin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "brindille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "brique": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "brise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "briser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "brochure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "broder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "brouillard": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "brouter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "broyer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "bruit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "brûlant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "brûler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "brume": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "brumeux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "brun": {
        "A": {
            "tab": ["n28"]
        }
    },
    "brusque": {
        "A": {
            "tab": ["n25"]
        }
    },
    "brusquement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "brut": {
        "A": {
            "tab": ["n28"]
        }
    },
    "brutal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "bruyamment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "bruyant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "bûcheron": {
        "N": {
            "g": "m",
            "tab": ["n49"]
        }
    },
    "buis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "buisson": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bulletin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "bureau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "but": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "butiner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "cabane": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cabine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cache-cache": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "cacher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "cadavre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cadeau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "cadet": {
        "A": {
            "tab": ["n51"]
        }
    },
    "cadran": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cadre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "café": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cage": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cahier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "caillou": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "caisse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "calcul": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "calculer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "calendrier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "calice": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "calme": {
        "A": {
            "tab": ["n25"]
        }
    },
    "calmer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "calvaire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "camarade": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "camion": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "camp": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "campagnard": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "campagne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "canal": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "canard": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "canif": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "canne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "canon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "canot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cantique": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "capable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "capitaine": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "capital": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "capitale": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "caprice": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "carabine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "caractère": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "caresse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "caresser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "carnet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "carotte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "carré": {
        "A": {
            "tab": ["n28"]
        }
    },
    "carreau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "carrefour": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "carrière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "carrousel": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cartable": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "carte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "carton": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cas": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "casquette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "casser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "catastrophe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "catéchisme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cathédrale": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "catholique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "cause": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "causer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "cave": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "caverne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "céder": {
        "V": {
            "tab": "v30",
            "aux": ["av"]
        }
    },
    "ceinture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "célèbre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "célébrer": {
        "V": {
            "tab": "v20",
            "aux": ["av"]
        }
    },
    "céleste": {
        "A": {
            "tab": ["n25"]
        }
    },
    "cendre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "centaine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "centime": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "centimètre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "central": {
        "A": {
            "tab": ["n47"]
        }
    },
    "centre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cercle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cérémonie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cerf": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cerise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cerisier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "certain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "certainement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "certes": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "cesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cesser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "chagrin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chaîne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chair": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chaise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chaland": {
        "N": {
            "g": "m",
            "tab": ["n3","n28"]
        }
    },
    "chaleur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chambre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chameau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "champ": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "changement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "changer": {
        "V": {
            "tab": "v3",
            "aux": ["aê"]
        }
    },
    "chanson": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chant": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chanter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "chanteur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "chantre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chapeau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "chapelet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chapelle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chapitre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "charbon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "charbonnage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "charge": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "charger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "chariot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "charitable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "charité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "charlatan": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "charmant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "charme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "charmer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "charrette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "charrue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chasse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chasser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "chasseur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "chat": {
        "N": {
            "g": "m",
            "tab": ["n51"]
        }
    },
    "château": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "chaud": {
        "A": {
            "tab": ["n28"]
        }
    },
    "chaudement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "chauffage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chauffer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "chauffeur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chauffeuse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chaume": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chaumière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chaussée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chausser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "chaussure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chaux": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "chef": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chef-d'oeuvre": {
        "N": {
            "g": "m",
            "tab": ["nI"]
        }
    },
    "chemin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cheminée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chemise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chêne": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cher": {
        "A": {
            "tab": ["n39"]
        }
    },
    "chercher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "chéri": {
        "A": {
            "tab": ["n28"]
        }
    },
    "chérir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "cheval": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "chevalier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chevalière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chevelure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chevet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cheveu": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "chèvre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chez": {
        "P": {
            "tab": ["pp"]
        }
    },
    "chien": {
        "N": {
            "g": "m",
            "tab": ["n49"]
        }
    },
    "chiffon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chiffre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "choc": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chocolat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "choeur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "choisir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "choix": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "chose": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "chou": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "chrétien": {
        "A": {
            "tab": ["n49"]
        }
    },
    "chrysanthème": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "chute": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ci-joint": {
        "A": {
            "tab": ["n28"]
        }
    },
    "ciel": {
        "N": {
            "g": "m",
            "tab": ["n9"]
        }
    },
    "cigarette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cime": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cimetière": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cinéma": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "circonstance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "circulation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "circuler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "cirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "cirque": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "citer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "citoyen": {
        "N": {
            "g": "m",
            "tab": ["n49"]
        }
    },
    "civil": {
        "A": {
            "tab": ["n28"]
        }
    },
    "clair": {
        "A": {
            "tab": ["n28"]
        }
    },
    "clairière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "clairon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "claquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "clarté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "classe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "classique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "clé": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "clef": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "clément": {
        "A": {
            "tab": ["n28"]
        }
    },
    "client": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "climat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "clin d'oeil": {
        "N": {
            "g": "m",
            "tab": ["nI"]
        }
    },
    "cloche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "clocher": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "clochette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "clos": {
        "A": {
            "tab": ["n27"]
        }
    },
    "clou": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "clouer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "clown": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cochon": {
        "N": {
            "g": "m",
            "tab": ["n3","n49"]
        }
    },
    "coeur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coffre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coffret": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coiffer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "coiffure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "coin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "colère": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "colis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "collection": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "collège": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "colline": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "colonel": {
        "N": {
            "g": "m",
            "tab": ["n48"]
        }
    },
    "colonial": {
        "A": {
            "tab": ["n47"]
        }
    },
    "colonne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "colorer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "combat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "combattant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "combattre": {
        "V": {
            "tab": "v87",
            "aux": ["av"]
        }
    },
    "comble": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "combler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "commandant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "commande": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "commandement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "commander": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "commencement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "commencer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "commerçant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "commerce": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "commercial": {
        "A": {
            "tab": ["n47"]
        }
    },
    "commettre": {
        "V": {
            "tab": "v89",
            "aux": ["av"]
        }
    },
    "commission": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "commode": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "commun": {
        "A": {
            "tab": ["n28"]
        }
    },
    "communal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "commune": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "communiant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "communication": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "communier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "communion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "communiquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "compagne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "compagnie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "compagnon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "comparaison": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "comparer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "compassion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "complet": {
        "A": {
            "tab": ["n40"]
        }
    },
    "complètement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "compléter": {
        "V": {
            "tab": "v22",
            "aux": ["av"]
        }
    },
    "compliment": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "compliquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "composer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "composition": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "comprendre": {
        "V": {
            "tab": "v90",
            "aux": ["av"]
        }
    },
    "compte": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "compter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "comte": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "comtesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "concerner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "concert": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "conclure": {
        "V": {
            "tab": "v109",
            "aux": ["av"]
        }
    },
    "concours": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "condamner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "condisciple": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "condition": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "condoléances": {
        "N": {
            "g": "f",
            "tab": ["n15"]
        }
    },
    "conduire": {
        "V": {
            "tab": "v113",
            "aux": ["av"]
        }
    },
    "conduite": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "confectionner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "conférence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "confesser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "confiance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "confier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "confiture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "confondre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "conformément": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "confrère": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "confus": {
        "A": {
            "tab": ["n27"]
        }
    },
    "congé": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "congrès": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "connaissance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "connaître": {
        "V": {
            "tab": "v101",
            "aux": ["av"]
        }
    },
    "conquérir": {
        "V": {
            "tab": "v39",
            "aux": ["av"]
        }
    },
    "consacrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "conscience": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "conseil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "conseiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "consentement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "consentir": {
        "V": {
            "tab": "v46",
            "aux": ["av"]
        }
    },
    "conséquence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "conserver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "considérable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "considérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "consister": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "consolation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "consoler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "constamment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "constant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "constater": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "constituer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "construction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "construire": {
        "V": {
            "tab": "v113",
            "aux": ["av"]
        }
    },
    "consulter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "contact": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "conte": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "contempler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "contenir": {
        "V": {
            "tab": "v52",
            "aux": ["av"]
        }
    },
    "content": {
        "A": {
            "tab": ["n28"]
        }
    },
    "contenter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "contenu": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "conter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "continuel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "continuellement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "continuer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "contraire": {
        "A": {
            "tab": ["n25"]
        }
    },
    "contrarier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "contre": {
        "P": {
            "tab": ["pp"]
        }
    },
    "contrée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "contribuer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "convaincre": {
        "V": {
            "tab": "v86",
            "aux": ["av"]
        }
    },
    "convenable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "convenir": {
        "V": {
            "tab": "v52",
            "aux": ["aê"]
        }
    },
    "conversation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "convertir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "conviction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "copier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "coq": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coquelicot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coquet": {
        "A": {
            "tab": ["n51"]
        }
    },
    "coquille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "corbeau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "corbeille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "corde": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cordial": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "cordialement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "cordonnier": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "corne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "corniche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "corolle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "corps": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "correction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "correspondance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "corridor": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "corriger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "cortège": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "costume": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "côte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "côté": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coton": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cou": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "couche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "coucher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "coucou": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coude": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coudre": {
        "V": {
            "tab": "v93",
            "aux": ["av"]
        }
    },
    "couler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "couleur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "couloir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coup": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "coupable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "coupe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "couper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "cour": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "courage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "courageusement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "courageux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "courant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "courber": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "coureur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "courir": {
        "V": {
            "tab": "v57",
            "aux": ["av"]
        }
    },
    "couronne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "couronner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "courrier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cours": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "course": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "court": {
        "A": {
            "tab": ["n28"]
        }
    },
    "cousin": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "coussin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "couteau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "coûter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "coutume": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "couture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "couvent": {
        "N": {
            "g": "f",
            "tab": ["n3"]
        }
    },
    "couver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "couvercle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "couvert": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "couverture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "couvrir": {
        "V": {
            "tab": "v44",
            "aux": ["av"]
        }
    },
    "craindre": {
        "V": {
            "tab": "v97",
            "aux": ["av"]
        }
    },
    "crainte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "craquement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "craquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "crayon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "créateur": {
        "N": {
            "g": "m",
            "tab": ["n56"]
        }
    },
    "créature": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "crèche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "créer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "crème": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "crêpe": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "crépuscule": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "creuser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "creux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "crever": {
        "V": {
            "tab": "v25",
            "aux": ["aê"]
        }
    },
    "cri": {
        "N": {
            "g": "m",
            "tab": ["n3","n35"]
        }
    },
    "crier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "crime": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "crise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cristal": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "croire": {
        "V": {
            "tab": "v115",
            "aux": ["av"]
        }
    },
    "croiser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "croître": {
        "V": {
            "tab": "v106",
            "aux": ["av"]
        }
    },
    "croix": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "croquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "croûte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "crucifix": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "cruel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "cueillette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cueillir": {
        "V": {
            "tab": "v51",
            "aux": ["av"]
        }
    },
    "cuiller": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cuillère": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cuir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "cuire": {
        "V": {
            "tab": "v113",
            "aux": ["av"]
        }
    },
    "cuisine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cuisinière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cuivre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "culotte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cultivateur": {
        "N": {
            "g": "m",
            "tab": ["n56"]
        }
    },
    "cultiver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "culture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "curé": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "curieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "curiosité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "cycliste": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "cygne": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "d'abord": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "d'après": {
        "P": {
            "tab": ["pp"]
        }
    },
    "dahlia": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "daigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dame": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "danger": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dangereux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "dans": {
        "P": {
            "tab": ["pp"]
        }
    },
    "danse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "danser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "darder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "date": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "dater": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "davantage": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "débarquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "débarrasser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "débattre": {
        "V": {
            "tab": "v87",
            "aux": ["av"]
        }
    },
    "débiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "déborder": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "déboucher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "debout": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "débris": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "début": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "décéder": {
        "V": {
            "tab": "v30",
            "aux": ["êt"]
        }
    },
    "décembre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "déception": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "déchaîner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "décharger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "déchirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "décider": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "décision": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "déclarer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "décorer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "découper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "décourager": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "découverte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "découvrir": {
        "V": {
            "tab": "v44",
            "aux": ["av"]
        }
    },
    "décrire": {
        "V": {
            "tab": "v114",
            "aux": ["av"]
        }
    },
    "dédaigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dedans": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "défaire": {
        "V": {
            "tab": "v124",
            "aux": ["av"]
        }
    },
    "défaut": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "défendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "défense": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "défenseur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "défiler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "défunt": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "dégager": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "dégât": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "degré": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dehors": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "déjà": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "déjeuner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "délaisser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "délicat": {
        "A": {
            "tab": ["n28"]
        }
    },
    "délice": {
        "N": {
            "g": "m",
            "tab": ["n25"]
        }
    },
    "délicieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "délivrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "demain": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "demande": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "demander": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "démarche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "déménager": {
        "V": {
            "tab": "v3",
            "aux": ["aê"]
        }
    },
    "demeure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "demeurer": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "demi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "demoiselle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "démolir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "démontrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dent": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "dentelle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "dénudé": {
        "A": {
            "tab": ["n28"]
        }
    },
    "départ": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dépasser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dépêcher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dépendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "dépens": {
        "N": {
            "g": "m",
            "tab": ["n1"]
        }
    },
    "dépenser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "déplacer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "déplaire": {
        "V": {
            "tab": "v123",
            "aux": ["av"]
        }
    },
    "déployer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "déposer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dépôt": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dépouiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "depuis": {
        "P": {
            "tab": ["pp"]
        }
    },
    "déranger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "dernier": {
        "A": {
            "pos": "pre",
            "tab": ["n39"]
        }
    },
    "dernièrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "dérober": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dérouler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "derrière": {
        "P": {
            "tab": ["pp"]
        }
    },
    "dès": {
        "P": {
            "tab": ["pp"]
        }
    },
    "désagréable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "désaltérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "désastre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "descendre": {
        "V": {
            "tab": "v85",
            "aux": ["aê"]
        }
    },
    "descente": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "description": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "désert": {
        "A": {
            "tab": ["n28"]
        }
    },
    "désespérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "désespoir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "déshabiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "désigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "désir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "désirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "désireux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "désobéir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "désobéissance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "désobéissant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "désolation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "désoler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "désordre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "désormais": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "dessein": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dessert": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dessin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dessiner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dessous": {
        "P": {
            "tab": ["pp"]
        }
    },
    "destination": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "destinée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "destiner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "détacher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "détail": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "déterminer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "détester": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "détour": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "détourner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "détruire": {
        "V": {
            "tab": "v113",
            "aux": ["av"]
        }
    },
    "dette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "deuil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "devant": {
        "P": {
            "tab": ["pp"]
        }
    },
    "développer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "devenir": {
        "V": {
            "tab": "v52",
            "aux": ["êt"]
        }
    },
    "deviner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "devoir": {
        "V": {
            "tab": "v64",
            "aux": ["av"]
        }
    },
    "dévorer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dévouement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dévouer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "diable": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "diamant": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dictée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "dicter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dictionnaire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dieu": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "différence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "différent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "différer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "difficile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "difficilement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "difficulté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "digne": {
        "A": {
            "tab": ["n25"]
        }
    },
    "dimanche": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dimension": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "diminuer": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "dîner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dire": {
        "V": {
            "tab": "v117",
            "aux": ["av"]
        }
    },
    "directement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "directeur": {
        "N": {
            "g": "m",
            "tab": ["n56"]
        }
    },
    "directrice": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "direction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "diriger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "discours": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "discussion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "discuter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "disparaître": {
        "V": {
            "tab": "v101",
            "aux": ["aê"]
        }
    },
    "disparition": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "dispenser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "disperser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "disposer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "disposition": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "disputer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dissiper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "distance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "distinction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "distinguer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "distraction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "distraire": {
        "V": {
            "tab": "v125",
            "aux": ["av"]
        }
    },
    "distrait": {
        "A": {
            "tab": ["n28"]
        }
    },
    "distribuer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "distribution": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "divin": {
        "A": {
            "tab": ["n28"]
        }
    },
    "diviser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "division": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "dizaine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "docile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "docteur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "doigt": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "domaine": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "domestique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "domicile": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dominer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dommage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dompteur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "don": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "donner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dorer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "dormir": {
        "V": {
            "tab": "v45",
            "aux": ["av"]
        }
    },
    "dortoir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dos": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "dossier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "double": {
        "A": {
            "tab": ["n25"]
        }
    },
    "doubler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "doucement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "douceur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "douleur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "douloureux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "doute": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "douter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "doux": {
        "A": {
            "tab": ["n70"]
        }
    },
    "douzaine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "doyen": {
        "N": {
            "g": "m",
            "tab": ["n49"]
        }
    },
    "drap": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "drapeau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "dresser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "droit": {
        "A": {
            "tab": ["n28"]
        }
    },
    "drôle": {
        "A": {
            "tab": ["n25"]
        }
    },
    "duc": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "dur": {
        "A": {
            "tab": ["n28"]
        }
    },
    "durant": {
        "P": {
            "tab": ["pp"]
        }
    },
    "durée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "durer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "duvet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "eau": {
        "N": {
            "g": "f",
            "tab": ["n18"]
        }
    },
    "ébats": {
        "N": {
            "g": "m",
            "tab": ["n1"]
        }
    },
    "éblouir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "ébranler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "écarter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "échanger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "échantillon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "échapper": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "écharpe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "échec": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "échelle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "écho": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "éclabousser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "éclair": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "éclaircir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "éclairer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "éclat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "éclatant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "éclater": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "éclore": {
        "V": {
            "tab": "v129",
            "aux": ["aê"]
        }
    },
    "écluse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "école": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "écolier": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "économie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "économiser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "écorce": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "écouler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "écouter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "écraser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "écrire": {
        "V": {
            "tab": "v114",
            "aux": ["av"]
        }
    },
    "écrit": {
        "A": {
            "tab": ["n28"]
        }
    },
    "écriture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "écrivain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "écureuil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "écurie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "édifier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "éducation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "effacer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "effectuer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "effet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "effort": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "effrayer": {
        "V": {
            "tab": "v4",
            "aux": ["av"]
        }
    },
    "effroyable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "égal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "également": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "égard": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "égarer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "église": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "élan": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "élancer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "élargir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "électricité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "électrique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "élégant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "éléphant": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "élève": {
        "N": {
            "g": "m",
            "tab": ["n25"]
        }
    },
    "élever": {
        "V": {
            "tab": "v25",
            "aux": ["av"]
        }
    },
    "emballer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "embarquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "embarras": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "embarrasser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "embaumer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "embellir": {
        "V": {
            "tab": "v58",
            "aux": ["aê"]
        }
    },
    "embrasser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "émerveiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "emmener": {
        "V": {
            "tab": "v24",
            "aux": ["av"]
        }
    },
    "émotion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "émouvoir": {
        "V": {
            "tab": "v66",
            "aux": ["av"]
        }
    },
    "empêcher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "empereur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "emplacement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "emplir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "emploi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "employé": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "employer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "emporter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "empressement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "encadrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "enchanté": {
        "A": {
            "tab": ["n28"]
        }
    },
    "encombrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "encore": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "encourager": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "encourir": {
        "V": {
            "tab": "v57",
            "aux": ["av"]
        }
    },
    "encre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "encrier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "endormir": {
        "V": {
            "tab": "v45",
            "aux": ["av"]
        }
    },
    "endosser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "endroit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "énergie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "énergique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "enfance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "enfant": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "enfermer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "enfin": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "enflammer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "enfoncer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "enfouir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "engager": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "engloutir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "enlever": {
        "V": {
            "tab": "v25",
            "aux": ["av"]
        }
    },
    "ennemi": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "ennui": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ennuyer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "ennuyeux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "énorme": {
        "A": {
            "tab": ["n25"]
        }
    },
    "énormément": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "enquête": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "enrichir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "enseignement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "enseigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "ensemble": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "ensoleillé": {
        "A": {
            "tab": ["n28"]
        }
    },
    "ensuite": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "entasser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "entendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "enterrement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "enterrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "enthousiasme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "entier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "entièrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "entonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "entourer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "entrain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "entraîner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "entre": {
        "P": {
            "tab": ["pp"]
        }
    },
    "entrée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "entreprendre": {
        "V": {
            "tab": "v90",
            "aux": ["av"]
        }
    },
    "entrer": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "entretenir": {
        "V": {
            "tab": "v52",
            "aux": ["av"]
        }
    },
    "entretien": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "entrevoir": {
        "V": {
            "tab": "v72",
            "aux": ["av"]
        }
    },
    "entrouvrir": {
        "V": {
            "tab": "v44",
            "aux": ["av"]
        }
    },
    "envahir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "enveloppe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "envelopper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "envers": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "envie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "envier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "environ": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "environner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "envoi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "envoyer": {
        "V": {
            "tab": "v134",
            "aux": ["av"]
        }
    },
    "épais": {
        "A": {
            "tab": ["n50"]
        }
    },
    "épanouir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "épargne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "épargner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "épaule": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "épauler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "épée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "épi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "épine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "époque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "épouser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "épouvantable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "épouvanter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "époux": {
        "N": {
            "g": "m",
            "tab": ["n54"]
        }
    },
    "épreuve": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "éprouver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "épuiser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "équilibre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "équipage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "équipe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ériger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "errer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "erreur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "escalader": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "escalier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "esclave": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "espace": {
        "N": {
            "g": "m",
            "tab": ["n3","n17"]
        }
    },
    "espèce": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "espérance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "espérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "espiègle": {
        "A": {
            "tab": ["n25"]
        }
    },
    "espoir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "esprit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "essai": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "essayer": {
        "V": {
            "tab": "v4",
            "aux": ["av"]
        }
    },
    "essuyer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "estime": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "estimer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "estomac": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "estrade": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "étable": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "établir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "établissement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "étage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "étagère": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "étalage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "étaler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "étang": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "état": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "été": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "éteindre": {
        "V": {
            "tab": "v97",
            "aux": ["av"]
        }
    },
    "étendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "étendue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "éternel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "éternité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "étincelant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "étinceler": {
        "V": {
            "tab": "v7",
            "aux": ["av"]
        }
    },
    "étincelle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "étirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "étoffe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "étoile": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "étonnement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "étonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "étouffer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "étourdi": {
        "A": {
            "tab": ["n28"]
        }
    },
    "étrange": {
        "A": {
            "tab": ["n25"]
        }
    },
    "étranger": {
        "A": {
            "tab": ["n39"]
        }
    },
    "étroit": {
        "A": {
            "tab": ["n28"]
        }
    },
    "étude": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "étudiant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "étudier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "évangile": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "éveiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "événement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "évêque": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "évidemment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "éviter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "exact": {
        "A": {
            "tab": ["n28"]
        }
    },
    "exactement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "exactitude": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "examen": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "examiner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "exaucer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "excellence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "excellent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "exciter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "exclamation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "excursion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "excuse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "excuser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "exécuter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "exécution": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "exemplaire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "exemple": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "exercer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "exercice": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "exhaler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "exiger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "existence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "exister": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "expédier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "expédition": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "expérience": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "expirer": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "explication": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "expliquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "exposer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "exposition": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "exprès": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "expression": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "exprimer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "exquis": {
        "A": {
            "tab": ["n27"]
        }
    },
    "extérieur": {
        "A": {
            "tab": ["n28"]
        }
    },
    "extraire": {
        "V": {
            "tab": "v125",
            "aux": ["av"]
        }
    },
    "extraordinaire": {
        "A": {
            "tab": ["n25"]
        }
    },
    "extrême": {
        "A": {
            "tab": ["n25"]
        }
    },
    "extrémité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fabrication": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fabrique": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fabriquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "façade": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fâcher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fâcheux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "facile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "facilement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "facilité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "faciliter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "façon": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "façonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "facteur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "faible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "faiblesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "faim": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "faire": {
        "V": {
            "tab": "v124",
            "aux": ["av"]
        }
    },
    "fait": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "falloir": {
        "V": {
            "tab": "v80",
            "aux": ["av"]
        }
    },
    "fameux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "familial": {
        "A": {
            "tab": ["n47"]
        }
    },
    "familier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "famille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "faner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "farce": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "farine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "farouche": {
        "A": {
            "tab": ["n25"]
        }
    },
    "fatal": {
        "A": {
            "tab": ["n28"]
        }
    },
    "fatigue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fatiguer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "faucher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "faucheur": {
        "N": {
            "g": "m",
            "tab": ["n3","n55"]
        }
    },
    "faute": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fauteuil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fauve": {
        "A": {
            "tab": ["n25"]
        }
    },
    "fauvette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "faux": {
        "A": {
            "tab": ["n53"]
        }
    },
    "faveur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "favorable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "favori": {
        "A": {
            "tab": ["n34"]
        }
    },
    "favoriser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "féliciter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "femelle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "femme": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "fenêtre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fer": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ferme": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fermer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fermier": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "féroce": {
        "A": {
            "tab": ["n25"]
        }
    },
    "ferraille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ferrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fervent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "ferveur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fête": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fêter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "feu": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "feuillage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "feuille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "février": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fiancé": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "ficelle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fidèle": {
        "A": {
            "tab": ["n25"]
        }
    },
    "fier": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        },
        "A": {
            "tab": ["n39"]
        }
    },
    "fièrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "fièvre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "figure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "figurer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "file": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "filer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "filet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fillette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "filleul": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "fils": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "fin": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "finalement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "finir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "firmament": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fixe": {
        "A": {
            "tab": ["n25"]
        }
    },
    "fixer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "flacon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "flamand": {
        "A": {
            "tab": ["n28"]
        }
    },
    "flamber": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "flamme": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "flanc": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "flaque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "flatter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "flatteur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "fléau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "flèche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fleur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fleurette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fleurir": {
        "V": {
            "tab": "v43",
            "aux": ["av"]
        }
    },
    "fleuve": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "flocon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "flot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "flotter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "flûte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "foi": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "foie": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "foin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "foire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fois": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "foncer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "fonction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fond": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fondre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "fonds": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "fontaine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "football": {
        "N": {
            "g": "m",
            "tab": ["n35"]
        }
    },
    "force": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "forcer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "forestier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "forêt": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "forge": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "forger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "forgeron": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "forme": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "former": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "formidable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "fort": {
        "A": {
            "tab": ["n28"]
        },
        "Adv": {
            "tab": ["av"]
        }
    },
    "fortement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "fortune": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fossé": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fou": {
        "A": {
            "tab": ["n109"]
        }
    },
    "foudre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fouet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fouetter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fougère": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fouiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "foule": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "four": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fourmi": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fourneau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "fournir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "fourniture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fourrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fourrure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "foyer": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fragile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "fraîcheur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "frais": {
        "A": {
            "tab": ["n44"]
        }
    },
    "fraise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "franc": {
        "A": {
            "tab": ["n61","n60"]
        }
    },
    "français": {
        "A": {
            "tab": ["n27"]
        }
    },
    "franchement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "franchir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "franchise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "frapper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "frayeur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "frêle": {
        "A": {
            "tab": ["n25"]
        }
    },
    "frémir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "fréquemment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "fréquent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "fréquenter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "frère": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "friandise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "frissonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "froid": {
        "A": {
            "tab": ["n28"]
        }
    },
    "froisser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fromage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "froment": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "front": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "frontière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "frotter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fruit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "fruitier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "fuir": {
        "V": {
            "tab": "v54",
            "aux": ["av"]
        }
    },
    "fuite": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fumée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "fumer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "fureur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "furieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "fusil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "futur": {
        "A": {
            "tab": ["n28"]
        }
    },
    "gagner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "gai": {
        "A": {
            "tab": ["n28"]
        }
    },
    "gaiement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "gaieté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "galerie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gambader": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "gamin": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "gant": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "garantir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "garçon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "garde": {
        "N": {
            "g": "m",
            "tab": ["n3","n17"]
        }
    },
    "garder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "gardien": {
        "N": {
            "g": "m",
            "tab": ["n49"]
        }
    },
    "gare": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "garnir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "garniture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gâteau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "gâter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "gauche": {
        "A": {
            "tab": ["n25"]
        }
    },
    "gaufre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gaz": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "gazon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "gazouillement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "gazouiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "géant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "gelée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "geler": {
        "V": {
            "tab": "v8",
            "aux": ["av"]
        }
    },
    "gémir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "gendarme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "gêner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "général": {
        "A": {
            "tab": ["n47"]
        }
    },
    "généralement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "généreux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "générosité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "genêt": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "genou": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "genre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "gens": {
        "N": {
            "g": "m",
            "tab": ["n2","n101"]
        }
    },
    "gentil": {
        "A": {
            "tab": ["n48"]
        }
    },
    "gentiment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "géographie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "géranium": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "gerbe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "germer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "geste": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "gibecière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gibier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "giboulée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gigantesque": {
        "A": {
            "tab": ["n25"]
        }
    },
    "giroflée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gîte": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "givre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "glace": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "glacer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "gland": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "glissant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "glisser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "glissoire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gloire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gonfler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "gorge": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gosse": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "gourmand": {
        "A": {
            "tab": ["n28"]
        }
    },
    "goût": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "goûter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "goutte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gouvernement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "gouverner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "grâce": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gracieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "grain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "graine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "graisse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "grammaire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "grand": {
        "A": {
            "pos": "pre",
            "tab": ["n28"]
        }
    },
    "grand-maman": {
        "N": {
            "g": "f",
            "tab": ["nI"]
        }
    },
    "grand-mère": {
        "N": {
            "g": "f",
            "tab": ["nI"]
        }
    },
    "grand-père": {
        "N": {
            "g": "m",
            "tab": ["nI"]
        }
    },
    "grandeur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "grandiose": {
        "A": {
            "tab": ["n25"]
        }
    },
    "grandir": {
        "V": {
            "tab": "v58",
            "aux": ["aê"]
        }
    },
    "grange": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "grappe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gras": {
        "A": {
            "tab": ["n50"]
        }
    },
    "gratitude": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gratter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "grave": {
        "A": {
            "tab": ["n25"]
        }
    },
    "gravement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "graver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "gravir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "gravure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "grêle": {
        "N": {
            "g": "f",
            "tab": ["n17","n3"]
        }
    },
    "grelotter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "grenier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "grenouille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "grès": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "griffe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "griffer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "grille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "grimper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "grincer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "grippe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gris": {
        "A": {
            "tab": ["n27"]
        }
    },
    "grive": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "gronder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "gros": {
        "A": {
            "pos": "pre",
            "tab": ["n50"]
        }
    },
    "groseillier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "grossier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "grossir": {
        "V": {
            "tab": "v58",
            "aux": ["aê"]
        }
    },
    "grotte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "groupe": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "grouper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "grue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "guêpe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "guère": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "guérir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "guérison": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "guerre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "guetter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "guichet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "guide": {
        "N": {
            "g": "x",
            "tab": ["n3","n17"]
        }
    },
    "guider": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "gymnastique": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "habile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "habileté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "habiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "habit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "habitant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "habitation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "habiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "habitude": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "habituel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "habituer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "hache": {
        "N": {
            "g": "f",
            "h": 1,
            "tab": ["n17"]
        }
    },
    "haie": {
        "N": {
            "g": "f",
            "h": 1,
            "tab": ["n17"]
        }
    },
    "haillon": {
        "N": {
            "g": "m",
            "h": 1,
            "tab": ["n3"]
        }
    },
    "haine": {
        "N": {
            "g": "f",
            "h": 1,
            "tab": ["n17"]
        }
    },
    "haleine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "halte": {
        "N": {
            "g": "f",
            "h": 1,
            "tab": ["n17"]
        }
    },
    "hameau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "hangar": {
        "N": {
            "g": "m",
            "h": 1,
            "tab": ["n3"]
        }
    },
    "hanneton": {
        "N": {
            "g": "m",
            "h": 1,
            "tab": ["n3"]
        }
    },
    "hardi": {
        "A": {
            "h": 1,
            "tab": ["n28"]
        }
    },
    "harmonieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "hasard": {
        "N": {
            "g": "m",
            "h": 1,
            "tab": ["n3"]
        }
    },
    "hâte": {
        "N": {
            "g": "f",
            "h": 1,
            "tab": ["n17"]
        }
    },
    "hâter": {
        "V": {
            "h": 1,
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "hausser": {
        "V": {
            "h": 1,
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "haut": {
        "A": {
            "h": 1,
            "tab": ["n28"]
        }
    },
    "hauteur": {
        "N": {
            "g": "f",
            "h": 1,
            "tab": ["n17"]
        }
    },
    "herbe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "hérissé": {
        "A": {
            "h": 1,
            "tab": ["n28"]
        }
    },
    "hermine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "héroïque": {
        "A": {
            "tab": ["n25"]
        }
    },
    "héros": {
        "N": {
            "g": "m",
            "h": 1,
            "tab": ["n2"]
        }
    },
    "hésiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "hêtre": {
        "N": {
            "g": "m",
            "h": 1,
            "tab": ["n3"]
        }
    },
    "heure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "heureusement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "heureux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "heurter": {
        "V": {
            "h": 1,
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "hier": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "hirondelle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "histoire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "hiver": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "hommage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "homme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "honnête": {
        "A": {
            "tab": ["n25"]
        }
    },
    "honneur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "honorable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "honorer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "honte": {
        "N": {
            "g": "f",
            "h": 1,
            "tab": ["n17"]
        }
    },
    "honteux": {
        "A": {
            "h": 1,
            "tab": ["n54"]
        }
    },
    "hôpital": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "horizon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "horloge": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "horreur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "horrible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "hors": {
        "P": {
            "h": 1,
            "tab": ["pp"]
        }
    },
    "hôte": {
        "N": {
            "g": "m",
            "tab": ["n52"]
        }
    },
    "hôtel": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "houille": {
        "N": {
            "g": "f",
            "h": 1,
            "tab": ["n17"]
        }
    },
    "huile": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "humain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "humanité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "humble": {
        "A": {
            "tab": ["n25"]
        }
    },
    "humeur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "humide": {
        "A": {
            "tab": ["n25"]
        }
    },
    "humidité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "hurler": {
        "V": {
            "h": 1,
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "hygiène": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "hypocrite": {
        "A": {
            "tab": ["n25"]
        }
    },
    "ici": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "idéal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "idée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ignorant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "ignorer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "île": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "illuminer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "illusion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "illustre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "illustrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "image": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "imagination": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "imaginer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "imiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "immaculé": {
        "A": {
            "tab": ["n28"]
        }
    },
    "immédiatement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "immense": {
        "A": {
            "tab": ["n25"]
        }
    },
    "immobile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "impatiemment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "impatience": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "impatient": {
        "A": {
            "tab": ["n28"]
        }
    },
    "imperméable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "implorer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "importance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "important": {
        "A": {
            "tab": ["n28"]
        }
    },
    "importer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "imposant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "imposer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "impossibilité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "impossible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "impression": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "imprévu": {
        "A": {
            "tab": ["n28"]
        }
    },
    "imprimer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "imprudence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "imprudent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "incendie": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "incident": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "incliner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "inconnu": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "inconvénient": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "indication": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "indifférent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "indigne": {
        "A": {
            "tab": ["n25"]
        }
    },
    "indiquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "indispensable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "industrie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "industriel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "inerte": {
        "A": {
            "tab": ["n25"]
        }
    },
    "inférieur": {
        "A": {
            "tab": ["n28"]
        }
    },
    "infini": {
        "A": {
            "tab": ["n28"]
        }
    },
    "infiniment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "infirme": {
        "A": {
            "tab": ["n25"]
        }
    },
    "infirmier": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "influence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "informer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "ingrat": {
        "A": {
            "tab": ["n28"]
        }
    },
    "ingratitude": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "injure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "innocent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "inondation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "inonder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "inquiet": {
        "A": {
            "tab": ["n40"]
        }
    },
    "inquiéter": {
        "V": {
            "tab": "v22",
            "aux": ["av"]
        }
    },
    "inquiétude": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "inscrire": {
        "V": {
            "tab": "v114",
            "aux": ["av"]
        }
    },
    "insecte": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "insigne": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "insister": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "inspecteur": {
        "N": {
            "g": "m",
            "tab": ["n56"]
        }
    },
    "inspirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "installer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "instant": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "institut": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "instituteur": {
        "N": {
            "g": "m",
            "tab": ["n56"]
        }
    },
    "instructif": {
        "A": {
            "tab": ["n46"]
        }
    },
    "instruction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "instruire": {
        "V": {
            "tab": "v113",
            "aux": ["av"]
        }
    },
    "instrument": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "intellectuel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "intelligence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "intelligent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "intense": {
        "A": {
            "tab": ["n25"]
        }
    },
    "intention": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "interdire": {
        "V": {
            "tab": "v118",
            "aux": ["av"]
        }
    },
    "intéressant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "intéresser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "intérêt": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "intérieur": {
        "A": {
            "tab": ["n28"]
        }
    },
    "interpeller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "interroger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "interrompre": {
        "V": {
            "tab": "v91",
            "aux": ["av"]
        }
    },
    "interruption": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "intervenir": {
        "V": {
            "tab": "v52",
            "aux": ["êt"]
        }
    },
    "intime": {
        "A": {
            "tab": ["n25"]
        }
    },
    "introduction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "introduire": {
        "V": {
            "tab": "v113",
            "aux": ["av"]
        }
    },
    "inutile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "invention": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "invisible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "invitation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "inviter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "invoquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "irriter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "isoler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "ivoire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ivre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "ivresse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "jacinthe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "jadis": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "jaillir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "jaloux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "jamais": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "jambe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "jambon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "janvier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "jardin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "jardinage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "jardinier": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "jaune": {
        "A": {
            "tab": ["n25"]
        }
    },
    "jaunir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "jeter": {
        "V": {
            "tab": "v10",
            "aux": ["av"]
        }
    },
    "jeu": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "jeudi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "jeune": {
        "A": {
            "pos": "pre",
            "tab": ["n25"]
        }
    },
    "jeunesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "joie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "joindre": {
        "V": {
            "tab": "v97",
            "aux": ["av"]
        }
    },
    "joli": {
        "A": {
            "pos": "pre",
            "tab": ["n28"]
        }
    },
    "joncher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "jonquille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "joue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "jouer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "jouet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "joueur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "jouir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "joujou": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "jour": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "journal": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "journalier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "journée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "joyeusement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "joyeux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "juge": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "jugement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "juger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "juillet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "juin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "jurer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "jusque": {
        "P": {
            "tab": ["ppe"]
        }
    },
    "juste": {
        "A": {
            "tab": ["n25"]
        }
    },
    "justement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "justice": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "képi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "kermesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "kilogramme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "kilomètre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "là": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "là-bas": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "labeur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "laborieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "labourer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "laboureur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "lac": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "lâcher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "laid": {
        "A": {
            "tab": ["n28"]
        }
    },
    "laine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "laisser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "lait": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "laitier": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "lambeau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "lamentable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "lampe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lancer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "langage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "langue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lanterne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lapin": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "large": {
        "A": {
            "tab": ["n25"]
        }
    },
    "largement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "larme": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "las": {
        "A": {
            "tab": ["n50"]
        }
    },
    "lasser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "laver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "lécher": {
        "V": {
            "tab": "v27",
            "aux": ["av"]
        }
    },
    "leçon": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lecture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "léger": {
        "A": {
            "tab": ["n39"]
        }
    },
    "légèrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "légume": {
        "N": {
            "g": "x",
            "tab": ["n3","n17"]
        }
    },
    "lendemain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "lent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "lentement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "lenteur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lettre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lever": {
        "V": {
            "tab": "v25",
            "aux": ["av"]
        }
    },
    "lèvre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "libérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "liberté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "libre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "lien": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "lier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "lierre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "lieu": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "lieue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lièvre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ligne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ligue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lilas": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "limite": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "limiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "limpide": {
        "A": {
            "tab": ["n25"]
        }
    },
    "lin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "linge": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "lion": {
        "N": {
            "g": "m",
            "tab": ["n49"]
        }
    },
    "liquide": {
        "A": {
            "tab": ["n25"]
        }
    },
    "lire": {
        "V": {
            "tab": "v120",
            "aux": ["av"]
        }
    },
    "lis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "lisière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lisse": {
        "A": {
            "tab": ["n25"]
        }
    },
    "liste": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "litière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "livre": {
        "N": {
            "g": "m",
            "tab": ["n3","n17"]
        }
    },
    "livrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "local": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "localité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "locomotive": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "loger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "logis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "loi": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "loin": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "lointain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "loisir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "long": {
        "A": {
            "tab": ["n64"]
        }
    },
    "longer": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "longtemps": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "longuement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "longueur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lors": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "lot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "louange": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "louer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "loup": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "louve": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lourd": {
        "A": {
            "tab": ["n28"]
        }
    },
    "loyal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "lueur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lugubre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "luire": {
        "V": {
            "tab": "v112",
            "aux": ["av"]
        }
    },
    "luisant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "lumière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lumineux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "lundi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "lune": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lunette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lutin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "lutte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "lutter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "lys": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "machine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mâchoire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "madame": {
        "N": {
            "g": "f",
            "tab": ["n19"]
        }
    },
    "mademoiselle": {
        "N": {
            "g": "f",
            "tab": ["n20"]
        }
    },
    "magasin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "magique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "magnifique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "mai": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "maigre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "main": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "maintenant": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "maintenir": {
        "V": {
            "tab": "v52",
            "aux": ["av"]
        }
    },
    "maire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "maison": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "maître": {
        "N": {
            "g": "m",
            "tab": ["n52"]
        }
    },
    "majesté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "majestueux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "mal": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "malade": {
        "A": {
            "tab": ["n25"]
        }
    },
    "maladie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "malgré": {
        "P": {
            "tab": ["pp"]
        }
    },
    "malheur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "malheureusement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "malheureux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "malin": {
        "A": {
            "tab": ["n65"]
        }
    },
    "malle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "maman": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "manche": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "manger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "manier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "manière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "manifester": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "manoeuvre": {
        "N": {
            "g": "m",
            "tab": ["n3","n17"]
        }
    },
    "manoeuvrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "manque": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "manquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "mansarde": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "manteau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "manuel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "marbre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "marchand": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "marchander": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "marchandise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "marche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "marché": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "marcher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "mardi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mare": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "marguerite": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mari": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mariage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "marier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "marin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "marine": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "marque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "marquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "marquis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "marraine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "marron": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "marronnier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mars": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "marteau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "masse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "massif": {
        "A": {
            "tab": ["n46"]
        }
    },
    "mât": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "matériel": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "maternel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "matière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "matin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "matinal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "matinée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "maudire": {
        "V": {
            "tab": "v60",
            "aux": ["av"]
        }
    },
    "maussade": {
        "A": {
            "tab": ["n25"]
        }
    },
    "mauvais": {
        "A": {
            "pos": "pre",
            "tab": ["n27"]
        }
    },
    "mauve": {
        "A": {
            "tab": ["n25"]
        }
    },
    "mécanique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "méchant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "mécontent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "médaille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "médecin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "méditer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "meilleur": {
        "A": {
            "tab": ["n28"]
        }
    },
    "mélancolie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mélancolique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "mélange": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mélanger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "mêler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "mélodie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mélodieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "membre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mémoire": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "menacer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "ménage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ménager": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "ménagerie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mendiant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "mendier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "mener": {
        "V": {
            "tab": "v24",
            "aux": ["av"]
        }
    },
    "mensonge": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "menteur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "mentir": {
        "V": {
            "tab": "v46",
            "aux": ["av"]
        }
    },
    "menton": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "menu": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "menuisier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mer": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "merci": {
        "N": {
            "g": "m",
            "tab": ["n25"]
        }
    },
    "mercredi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mère": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mérite": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mériter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "merle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "merveille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "merveilleusement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "merveilleux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "messager": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "messe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mesure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mesurer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "métal": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "méthode": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "métier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mètre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mettre": {
        "V": {
            "tab": "v89",
            "aux": ["av"]
        }
    },
    "meuble": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "meule": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "meunier": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "midi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "miel": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "miette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mieux": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "mignon": {
        "A": {
            "tab": ["n49"]
        }
    },
    "migrateur": {
        "A": {
            "tab": ["n56"]
        }
    },
    "milieu": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "militaire": {
        "A": {
            "tab": ["n25"]
        }
    },
    "millier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "million": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mince": {
        "A": {
            "tab": ["n25"]
        }
    },
    "mine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mineur": {
        "N": {
            "g": "m",
            "tab": ["n3","n28"]
        }
    },
    "ministre": {
        "N": {
            "g": "m",
            "tab": ["n25"]
        }
    },
    "minuit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "minuscule": {
        "A": {
            "tab": ["n25"]
        }
    },
    "minute": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "miracle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "miroir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "misérable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "misère": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "missel": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mission": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "missionnaire": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "mobile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "mobilier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mode": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "modèle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "modérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "moderne": {
        "A": {
            "tab": ["n25"]
        }
    },
    "modeste": {
        "A": {
            "tab": ["n25"]
        }
    },
    "modestie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "moelleux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "moindre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "moine": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "moineau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "moins": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "mois": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "moisson": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "moissonneur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "moitié": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "moment": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "monde": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "monnaie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "monotone": {
        "A": {
            "tab": ["n25"]
        }
    },
    "monseigneur": {
        "N": {
            "g": "m",
            "tab": ["n13"]
        }
    },
    "monsieur": {
        "N": {
            "g": "m",
            "tab": ["n12"]
        }
    },
    "monstre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mont": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "montagne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "montant": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "monter": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "montre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "montrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "monument": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "moquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "moqueur": {
        "A": {
            "tab": ["n55"]
        }
    },
    "moral": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "morale": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "morceau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "mordre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "morne": {
        "A": {
            "tab": ["n25"]
        }
    },
    "mort": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "mortel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "mot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "moteur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "motif": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mou": {
        "A": {
            "tab": ["n109"]
        }
    },
    "mouche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mouchoir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "moudre": {
        "V": {
            "tab": "v92",
            "aux": ["av"]
        }
    },
    "mouiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "moulin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mourir": {
        "V": {
            "tab": "v55",
            "aux": ["êt"]
        }
    },
    "mousse": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "moustache": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mouton": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mouvement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mouvoir": {
        "V": {
            "tab": "v65",
            "aux": ["av"]
        }
    },
    "moyen": {
        "A": {
            "tab": ["n49"]
        }
    },
    "moyenne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "muet": {
        "A": {
            "tab": ["n51"]
        }
    },
    "muguet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "multicolore": {
        "A": {
            "tab": ["n25"]
        }
    },
    "multiple": {
        "A": {
            "tab": ["n25"]
        }
    },
    "multitude": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "munir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "mur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mûr": {
        "A": {
            "tab": ["n28"]
        }
    },
    "muraille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "mûrir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "murmure": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "murmurer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "muscle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "museau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "musée": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "musicien": {
        "A": {
            "tab": ["n49"]
        }
    },
    "musique": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "myosotis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "mystère": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "mystérieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "nager": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "naissance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "naître": {
        "V": {
            "tab": "v104",
            "aux": ["êt"]
        }
    },
    "nappe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "narcisse": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "natal": {
        "A": {
            "tab": ["n28"]
        }
    },
    "nation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "national": {
        "A": {
            "tab": ["n47"]
        }
    },
    "nature": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "naturel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "naturellement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "naufrage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "navire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "néanmoins": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "nécessaire": {
        "A": {
            "tab": ["n25"]
        }
    },
    "négligence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "négligent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "négliger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "négociant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "nègre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "neige": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "neiger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "nerveux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "net": {
        "A": {
            "tab": ["n51"]
        }
    },
    "nettoyer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "neveu": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "nez": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "niche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "nid": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "nièce": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "niveau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "noble": {
        "A": {
            "tab": ["n25"]
        }
    },
    "noeud": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "noir": {
        "A": {
            "tab": ["n28"]
        }
    },
    "noircir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "noisette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "noix": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "nom": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "nombre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "nombreux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "nommer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "non": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "nord": {
        "N": {
            "g": "m",
            "tab": ["n35"]
        }
    },
    "normal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "notaire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "note": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "nourrir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "nourriture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "nouveau": {
        "A": {
            "pos": "pre",
            "tab": ["n108"]
        }
    },
    "novembre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "noyer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "nu": {
        "A": {
            "tab": ["n28"]
        }
    },
    "nuage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "nuisible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "nuit": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "nullement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "numéro": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "obéir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "obéissant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "objet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "obligeance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "obliger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "obscur": {
        "A": {
            "tab": ["n28"]
        }
    },
    "obscurcir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "obscurité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "observation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "observer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "obstacle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "obtenir": {
        "V": {
            "tab": "v52",
            "aux": ["av"]
        }
    },
    "occasion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "occasionner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "occupation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "occuper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "océan": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "octobre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "odeur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "odorant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "oeil": {
        "N": {
            "g": "m",
            "tab": ["n14"]
        }
    },
    "oeillet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "oeuf": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "oeuvre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "offenser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "office": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "officier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "offre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "offrir": {
        "V": {
            "tab": "v44",
            "aux": ["av"]
        }
    },
    "oie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "oiseau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "oisillon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ombrage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ombre": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "oncle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "onde": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "onduler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "opération": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "opérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "opinion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "opposer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "or": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "orage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "orange": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        },
        "A": {
            "tab": ["n24"]
        }
    },
    "oranger": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ordinaire": {
        "A": {
            "tab": ["n25"]
        }
    },
    "ordinairement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "ordonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "ordre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "orée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "oreille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "organiser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "orgue": {
        "N": {
            "g": "m",
            "tab": ["n3","n17"]
        }
    },
    "orgueil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "orgueilleux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "ornement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "orner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "orphelin": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "os": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "oser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "osier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ôter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "ouate": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "oui": {
        "Adv": {
            "h": 1,
            "tab": ["av"]
        }
    },
    "ours": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "outil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ouverture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ouvrage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ouvrier": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "ouvrir": {
        "V": {
            "tab": "v44",
            "aux": ["av"]
        }
    },
    "page": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "paille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "paire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "paisible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "paisiblement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "paître": {
        "V": {
            "tab": "v102",
            "aux": ["tdir"]
        }
    },
    "paix": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "palais": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "pâle": {
        "A": {
            "tab": ["n25"]
        }
    },
    "paletot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pâlir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "pan": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "panache": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "panier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "panorama": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pantalon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "papa": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "papier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "papillon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pâquerette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "paquet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "paradis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "parages": {
        "N": {
            "g": "m",
            "tab": ["n1"]
        }
    },
    "paraître": {
        "V": {
            "tab": "v101",
            "aux": ["aê"]
        }
    },
    "parapluie": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "parc": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "parcourir": {
        "V": {
            "tab": "v57",
            "aux": ["av"]
        }
    },
    "parcours": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "pardessus": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "pardon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pardonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "pareil": {
        "A": {
            "tab": ["n48"]
        }
    },
    "parent": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "parer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "paresse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "paresseux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "parfait": {
        "A": {
            "tab": ["n28"]
        }
    },
    "parfaitement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "parfois": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "parfum": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "parfumer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "parler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "parmi": {
        "P": {
            "tab": ["pp"]
        }
    },
    "paroisse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "parole": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "parquet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "parrain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "parsemer": {
        "V": {
            "tab": "v13",
            "aux": ["av"]
        }
    },
    "part": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "partager": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "parterre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "parti": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "participer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "particulier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "particulièrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "partie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "partir": {
        "V": {
            "tab": "v46",
            "aux": ["êt"]
        }
    },
    "partout": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "parure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "parvenir": {
        "V": {
            "tab": "v52",
            "aux": ["êt"]
        }
    },
    "passage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "passager": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "passant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "passé": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "passer": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "passion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pâte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "paternel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "patience": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "patin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pâtisserie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pâtre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "patrie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "patron": {
        "N": {
            "g": "m",
            "tab": ["n49"]
        }
    },
    "patronage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "patte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pâture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pauvre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "pavé": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "payer": {
        "V": {
            "tab": "v4",
            "aux": ["av"]
        }
    },
    "pays": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "paysage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "paysan": {
        "N": {
            "g": "m",
            "tab": ["n49"]
        }
    },
    "peau": {
        "N": {
            "g": "f",
            "tab": ["n18"]
        }
    },
    "péché": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pêche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pécher": {
        "V": {
            "tab": "v27",
            "aux": ["av"]
        }
    },
    "pêcher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "pêcheur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "peindre": {
        "V": {
            "tab": "v97",
            "aux": ["av"]
        }
    },
    "peine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "peiner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "peintre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "peinture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pelage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pelouse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pencher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "pendant": {
        "P": {
            "tab": ["pp"]
        }
    },
    "pendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "pendule": {
        "N": {
            "g": "m",
            "tab": ["n3","n17"]
        }
    },
    "pénétrer": {
        "V": {
            "tab": "v17",
            "aux": ["av"]
        }
    },
    "pénible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "péniblement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "pénitence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pensée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "penser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "pension": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pensionnaire": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "pensionnat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "percer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "perche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "percher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "perdre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "perdrix": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "père": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "perfection": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "péril": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "périlleux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "période": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "périr": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "perle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "permettre": {
        "V": {
            "tab": "v89",
            "aux": ["av"]
        }
    },
    "permission": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "perpétuel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "perroquet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "persévérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "personnage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "personnel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "perspective": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "persuader": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "perte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "peser": {
        "V": {
            "tab": "v26",
            "aux": ["av"]
        }
    },
    "pétale": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "petit": {
        "A": {
            "pos": "pre",
            "tab": ["n28"]
        },
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "pétrir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "peu": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "peuple": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "peupler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "peuplier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "peur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "peut-être": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "photographie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "photographier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "phrase": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "physique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "piano": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pic": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pièce": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pied": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pierre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "piété": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "pigeon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pinceau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "pinson": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pipe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "piquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "pis": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "piste": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pitié": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pittoresque": {
        "A": {
            "tab": ["n25"]
        }
    },
    "place": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "placer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "plafond": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "plage": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "plaie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "plaindre": {
        "V": {
            "tab": "v97",
            "aux": ["av"]
        }
    },
    "plaine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "plainte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "plaintif": {
        "A": {
            "tab": ["n46"]
        }
    },
    "plaire": {
        "V": {
            "tab": "v123",
            "aux": ["av"]
        }
    },
    "plaisir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "plan": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "plane": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "planche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "plancher": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "planer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "plante": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "planter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "plaque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "plat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "plate": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "plateau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "plein": {
        "A": {
            "tab": ["n28"]
        }
    },
    "pleur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pleurer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "pleuvoir": {
        "V": {
            "tab": "v79",
            "aux": ["av"]
        }
    },
    "pli": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "plier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "plomb": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "plonger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "pluie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "plumage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "plume": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "plumier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "plus": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "plutôt": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "poche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "poêle": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "poésie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "poète": {
        "N": {
            "g": "m",
            "tab": ["n103"]
        }
    },
    "poids": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "poignée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "poil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "poing": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "point": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pointe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pointu": {
        "A": {
            "tab": ["n28"]
        }
    },
    "poire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "poireau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "poirier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pois": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "poisson": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "poitrine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "poli": {
        "A": {
            "tab": ["n28"]
        }
    },
    "police": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "politesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "politique": {
        "N": {
            "g": "f",
            "tab": ["n17","n3"]
        }
    },
    "pomme": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pommier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pompe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pompier": {
        "N": {
            "g": "m",
            "tab": ["n3","n39"]
        }
    },
    "pondre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "pont": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "porc": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "port": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "porte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "porte-plume": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "portée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "portefeuille": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "porter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "porteur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "portière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "portrait": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "poser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "position": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "posséder": {
        "V": {
            "tab": "v30",
            "aux": ["av"]
        }
    },
    "possession": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "possible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "postal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "poste": {
        "N": {
            "g": "m",
            "tab": ["n3","n17"]
        }
    },
    "pot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "potager": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "poteau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "poudre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "poulailler": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "poulain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "poule": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "poulet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "poumon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "poupée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pour": {
        "P": {
            "tab": ["pp"]
        }
    },
    "pourpre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "pourrir": {
        "V": {
            "tab": "v58",
            "aux": ["aê"]
        }
    },
    "poursuite": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "poursuivre": {
        "V": {
            "tab": "v99",
            "aux": ["av"]
        }
    },
    "pourtant": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "pourvoir": {
        "V": {
            "tab": "v82",
            "aux": ["av"]
        }
    },
    "pousser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "poussière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "poussin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "poutre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pouvoir": {
        "V": {
            "tab": "v71",
            "aux": ["av"]
        }
    },
    "prairie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pratique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "pratiquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "pré": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "préau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "précaution": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "précédent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "précéder": {
        "V": {
            "tab": "v30",
            "aux": ["av"]
        }
    },
    "prêcher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "précieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "précipiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "précisément": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "préférence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "préférer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "prendre": {
        "V": {
            "tab": "v90",
            "aux": ["av"]
        }
    },
    "préparatif": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "préparation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "préparer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "près": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "présence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "présent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "présenter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "préserver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "président": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "présidente": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "presque": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "presser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "prêt": {
        "A": {
            "tab": ["n28"]
        }
    },
    "prétendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "prêter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "prêtre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "preuve": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "prévenir": {
        "V": {
            "tab": "v52",
            "aux": ["av"]
        }
    },
    "prévoir": {
        "V": {
            "tab": "v73",
            "aux": ["av"]
        }
    },
    "prier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "prière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "primaire": {
        "A": {
            "tab": ["n25"]
        }
    },
    "prime": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "primevère": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "prince": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "princesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "principal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "principalement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "principe": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "printanier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "printemps": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "prise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "prison": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "prisonnier": {
        "N": {
            "g": "m",
            "tab": ["n39"]
        }
    },
    "privation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "priver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "prix": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "probablement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "problème": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "procéder": {
        "V": {
            "tab": "v30",
            "aux": ["av"]
        }
    },
    "procession": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "prochain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "proche": {
        "A": {
            "tab": ["n25"]
        }
    },
    "proclamer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "procurer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "procureur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "prodigieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "prodiguer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "production": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "produire": {
        "V": {
            "tab": "v113",
            "aux": ["av"]
        }
    },
    "produit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "professeur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "profession": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "profit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "profiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "profond": {
        "A": {
            "tab": ["n28"]
        }
    },
    "profondément": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "profondeur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "programme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "progrès": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "proie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "projet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "projeter": {
        "V": {
            "tab": "v10",
            "aux": ["av"]
        }
    },
    "prolonger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "promenade": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "promener": {
        "V": {
            "tab": "v24",
            "aux": ["av"]
        }
    },
    "promeneur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "promesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "promettre": {
        "V": {
            "tab": "v89",
            "aux": ["av"]
        }
    },
    "prompt": {
        "A": {
            "tab": ["n28"]
        }
    },
    "prononcer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "propice": {
        "A": {
            "tab": ["n25"]
        }
    },
    "propos": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "proposer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "proposition": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "propre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "proprement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "propreté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "propriétaire": {
        "N": {
            "g": "x",
            "tab": ["n25"]
        }
    },
    "propriété": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "prospérité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "protecteur": {
        "N": {
            "g": "m",
            "tab": ["n56"]
        }
    },
    "protection": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "protéger": {
        "V": {
            "tab": "v35",
            "aux": ["av"]
        }
    },
    "prouver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "provenir": {
        "V": {
            "tab": "v52",
            "aux": ["êt"]
        }
    },
    "proverbe": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "providence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "provision": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "provoquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "prudence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "prudent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "public": {
        "A": {
            "tab": ["n60"]
        }
    },
    "puis": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "puissance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "puissant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "puits": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "punir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "punition": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "pupitre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "pur": {
        "A": {
            "tab": ["n28"]
        }
    },
    "purifier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "quai": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "qualité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "quantité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "quart": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "quartier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "quelconque": {
        "A": {
            "tab": ["n25"]
        }
    },
    "quelquefois": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "question": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "queue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "quinzaine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "quitter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "quotidien": {
        "A": {
            "tab": ["n49"]
        }
    },
    "raccommoder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "raccourcir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "race": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "racine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "raconter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "radieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "rafraîchir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "rage": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "raide": {
        "A": {
            "tab": ["n25"]
        }
    },
    "raisin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "raison": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "raisonnable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "ralentir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "ramage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ramasser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rame": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rameau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "ramener": {
        "V": {
            "tab": "v24",
            "aux": ["av"]
        }
    },
    "randonnée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rang": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ranger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "ranimer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rapide": {
        "A": {
            "tab": ["n25"]
        }
    },
    "rapidement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "rapidité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rapiécer": {
        "V": {
            "aux": ["av"]
        }
    },
    "rappeler": {
        "V": {
            "tab": "v7",
            "aux": ["av"]
        }
    },
    "rapport": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rapporter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rapprocher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rare": {
        "A": {
            "tab": ["n25"]
        }
    },
    "rarement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "raser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rassembler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rassurer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rater": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rattraper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "ravage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ravin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ravir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "ravissant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "rayon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rayonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "réaliser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "réalité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "réception": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "recevoir": {
        "V": {
            "tab": "v63",
            "aux": ["av"]
        }
    },
    "réchauffer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "recherche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rechercher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "récit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "réciter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "réclamer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "récolte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "récolter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "recommandation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "recommander": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "recommencer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "récompense": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "récompenser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "reconduire": {
        "V": {
            "tab": "v113",
            "aux": ["av"]
        }
    },
    "réconforter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "reconnaissance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "reconnaissant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "reconnaître": {
        "V": {
            "tab": "v101",
            "aux": ["av"]
        }
    },
    "recourir": {
        "V": {
            "tab": "v57",
            "aux": ["av"]
        }
    },
    "recours": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "recouvrir": {
        "V": {
            "tab": "v44",
            "aux": ["av"]
        }
    },
    "récréation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "recueillir": {
        "V": {
            "tab": "v51",
            "aux": ["av"]
        }
    },
    "reculer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rédaction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "redescendre": {
        "V": {
            "tab": "v85",
            "aux": ["aê"]
        }
    },
    "redevenir": {
        "V": {
            "tab": "v52",
            "aux": ["êt"]
        }
    },
    "redire": {
        "V": {
            "tab": "v117",
            "aux": ["av"]
        }
    },
    "redoubler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "redoutable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "redouter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "redresser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "réduire": {
        "V": {
            "tab": "v113",
            "aux": ["av"]
        }
    },
    "réel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "réellement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "refaire": {
        "V": {
            "tab": "v124",
            "aux": ["av"]
        }
    },
    "réfectoire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "refermer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "réfléchir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "reflet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "refléter": {
        "V": {
            "tab": "v22",
            "aux": ["av"]
        }
    },
    "réflexion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "réformer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "refrain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "refroidir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "refuge": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "réfugier": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "refuser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "regagner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "régaler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "regard": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "regarder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "régime": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "régiment": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "région": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "règle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "régler": {
        "V": {
            "tab": "v18",
            "aux": ["av"]
        }
    },
    "règne": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "régner": {
        "V": {
            "tab": "v19",
            "aux": ["av"]
        }
    },
    "regret": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "regretter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "régulier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "régulièrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "reine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rejeter": {
        "V": {
            "tab": "v10",
            "aux": ["av"]
        }
    },
    "rejoindre": {
        "V": {
            "tab": "v97",
            "aux": ["av"]
        }
    },
    "réjouir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "relatif": {
        "A": {
            "tab": ["n46"]
        }
    },
    "relation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "relativement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "relever": {
        "V": {
            "tab": "v25",
            "aux": ["av"]
        }
    },
    "religieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "religion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "relire": {
        "V": {
            "tab": "v120",
            "aux": ["av"]
        }
    },
    "remarquable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "remarque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "remarquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "remède": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "remerciement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "remercier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "remettre": {
        "V": {
            "tab": "v89",
            "aux": ["av"]
        }
    },
    "remise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "remonter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "remords": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "remplacer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "remplir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "remporter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "remuer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "renaître": {
        "V": {
            "tab": "v105",
            "aux": ["intr"]
        }
    },
    "renard": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rencontre": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "rencontrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rendez-vous": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "rendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "renfermer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "renoncer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "renoncule": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "renouveau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "renouveler": {
        "V": {
            "tab": "v7",
            "aux": ["av"]
        }
    },
    "renouvellement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "renseignement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "renseigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rentrée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rentrer": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "renverser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "renvoyer": {
        "V": {
            "tab": "v134",
            "aux": ["av"]
        }
    },
    "répandre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "reparaître": {
        "V": {
            "tab": "v101",
            "aux": ["av"]
        }
    },
    "réparer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "répartir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "repas": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "repasser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "repentir": {
        "V": {
            "tab": "v46",
            "aux": ["êt"]
        }
    },
    "répéter": {
        "V": {
            "tab": "v22",
            "aux": ["av"]
        }
    },
    "replier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "répondre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "réponse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "reporter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "repos": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "reposer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "repousser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "reprendre": {
        "V": {
            "tab": "v90",
            "aux": ["av"]
        }
    },
    "représentant": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "représentation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "représenter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "reprise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "reproche": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "reprocher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "réserve": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "réserver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "résigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "résistance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "résister": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "résolution": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "résonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "résoudre": {
        "V": {
            "tab": "v94",
            "aux": ["av"]
        }
    },
    "respect": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "respecter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "respectueux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "respiration": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "respirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "resplendir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "ressembler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "ressentir": {
        "V": {
            "tab": "v46",
            "aux": ["av"]
        }
    },
    "ressort": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ressource": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "reste": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rester": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "résultat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rétablir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "retard": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "retardataire": {
        "N": {
            "g": "m",
            "tab": ["n25"]
        }
    },
    "retenir": {
        "V": {
            "tab": "v52",
            "aux": ["av"]
        }
    },
    "retentir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "retirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "retomber": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "retour": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "retourner": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "retraite": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "retrousser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "retrouver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "réunion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "réunir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "réussir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "rêve": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "réveil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "réveiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "révéler": {
        "V": {
            "tab": "v16",
            "aux": ["av"]
        }
    },
    "revenir": {
        "V": {
            "tab": "v52",
            "aux": ["êt"]
        }
    },
    "rêver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "reverdir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "revêtir": {
        "V": {
            "tab": "v56",
            "aux": ["av"]
        }
    },
    "revivre": {
        "V": {
            "tab": "v100",
            "aux": ["av"]
        }
    },
    "revoir": {
        "V": {
            "tab": "v72",
            "aux": ["av"]
        }
    },
    "revue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rez-de-chaussée": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "rhume": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "riant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "riche": {
        "A": {
            "tab": ["n25"]
        }
    },
    "richesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rideau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "rider": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rigole": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rigoureux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "rire": {
        "V": {
            "tab": "v107",
            "aux": ["av"]
        }
    },
    "risque": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "risquer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rive": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rivière": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "riz": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "robe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "robuste": {
        "A": {
            "tab": ["n25"]
        }
    },
    "rocher": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rôder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "roi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rôle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "romain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "rompre": {
        "V": {
            "tab": "v91",
            "aux": ["av"]
        }
    },
    "ronce": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rond": {
        "A": {
            "tab": ["n28"]
        }
    },
    "ronde": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ronger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "ronronner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rose": {
        "N": {
            "g": "f",
            "tab": ["n17","n3"]
        }
    },
    "roseau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "rosée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rosier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rossignol": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rôti": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "roue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rouge": {
        "A": {
            "tab": ["n25"]
        }
    },
    "rougir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "rouiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "rouleau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "rouler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "roulotte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "route": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "roux": {
        "A": {
            "tab": ["n53"]
        }
    },
    "royal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "royaume": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ruban": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "ruche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rude": {
        "A": {
            "tab": ["n25"]
        }
    },
    "rue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ruelle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ruine": {
        "N": {
            "g": "m",
            "tab": ["n17"]
        }
    },
    "ruiner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "ruisseau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "ruisseler": {
        "V": {
            "tab": "v7",
            "aux": ["av"]
        }
    },
    "ruisselet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "rusé": {
        "A": {
            "tab": ["n28"]
        }
    },
    "rustique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "absenter": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "agenouiller": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "écrier": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "écrouler": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "efforcer": {
        "V": {
            "tab": "v0",
            "aux": ["êt"]
        }
    },
    "éloigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "emparer": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "empresser": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "enfuir": {
        "V": {
            "tab": "v54",
            "aux": ["êt"]
        }
    },
    "envoler": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "évanouir": {
        "V": {
            "tab": "v58",
            "aux": ["êt"]
        }
    },
    "sable": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sabot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sabre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sac": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sacoche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sacré": {
        "A": {
            "tab": ["n28"]
        }
    },
    "sacrement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sacrifice": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sacrifier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "sage": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sagement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "sagesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "saigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "sain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "saint": {
        "A": {
            "tab": ["n28"]
        }
    },
    "saisir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "saison": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "salade": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "salaire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sale": {
        "A": {
            "tab": ["n25"]
        }
    },
    "salir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "salle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "salon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "saluer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "salut": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "salutation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "samedi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sang": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sanglot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sans": {
        "P": {
            "tab": ["pp"]
        }
    },
    "santé": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sapin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "satin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "satisfaction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "satisfaire": {
        "V": {
            "tab": "v124",
            "aux": ["av"]
        }
    },
    "satisfait": {
        "A": {
            "tab": ["n28"]
        }
    },
    "sauf": {
        "P": {
            "tab": ["pp"]
        }
    },
    "saule": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "saut": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sauter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "sautiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "sauvage": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sauver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "savant": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "savoir": {
        "V": {
            "tab": "v67",
            "aux": ["av"]
        }
    },
    "savon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "savourer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "savoureux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "scène": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "science": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "scier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "scintiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "scolaire": {
        "A": {
            "tab": ["n25"]
        }
    },
    "séance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "seau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "sec": {
        "A": {
            "tab": ["n37"]
        }
    },
    "sécher": {
        "V": {
            "tab": "v27",
            "aux": ["av"]
        }
    },
    "seconde": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "secouer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "secourir": {
        "V": {
            "tab": "v57",
            "aux": ["av"]
        }
    },
    "secours": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "secret": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sécurité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "seigneur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sein": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "séjour": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sel": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "selon": {
        "P": {
            "tab": ["pp"]
        }
    },
    "semaine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "semblable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sembler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "semer": {
        "V": {
            "tab": "v13",
            "aux": ["av"]
        }
    },
    "séminaire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sens": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "sensible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sentier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sentiment": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sentir": {
        "V": {
            "tab": "v46",
            "aux": ["av"]
        }
    },
    "séparer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "septembre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "serein": {
        "A": {
            "tab": ["n28"]
        }
    },
    "sergent": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "série": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sérieusement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "sérieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "sermon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "serrer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "serrure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "servante": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "serviable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "service": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "serviette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "servir": {
        "V": {
            "tab": "v47",
            "aux": ["av"]
        }
    },
    "serviteur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "seuil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "seul": {
        "A": {
            "tab": ["n28"]
        }
    },
    "seulement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "sève": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sévère": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sévèrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "sévir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "siècle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "siège": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sifflement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "siffler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "sifflet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "signal": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "signaler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "signature": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "signe": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "signer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "signifier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "silence": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "silencieusement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "silencieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "sillon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sillonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "simple": {
        "A": {
            "tab": ["n25"]
        }
    },
    "simplement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "simplicité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sincère": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sincèrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "sincérité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "singe": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "singulier": {
        "A": {
            "tab": ["n39"]
        }
    },
    "sinistre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sirène": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sitôt": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "situation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "situer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "sobre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "société": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "soeur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "soie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "soif": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "soigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "soigneusement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "soigneux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "soin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "soir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "soirée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sol": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "soldat": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "soleil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "solennel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "solide": {
        "A": {
            "tab": ["n25"]
        }
    },
    "solitaire": {
        "A": {
            "tab": ["n25"]
        }
    },
    "solitude": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "solliciter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "sombre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "somme": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "sommeil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sommet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "songer": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "sonner": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "sonnette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sonore": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sort": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sorte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sortie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sortir": {
        "V": {
            "tab": "v46",
            "aux": ["aê"]
        }
    },
    "sot": {
        "A": {
            "tab": ["n51"]
        }
    },
    "sou": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "souci": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "soudain": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "souffle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "souffler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "souffrance": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "souffrir": {
        "V": {
            "tab": "v44",
            "aux": ["av"]
        }
    },
    "souhait": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "souhaiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "souiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "soulagement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "soulager": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "soulever": {
        "V": {
            "tab": "v25",
            "aux": ["av"]
        }
    },
    "soulier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "soumettre": {
        "V": {
            "tab": "v89",
            "aux": ["av"]
        }
    },
    "soupçonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "soupe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "souper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "soupir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "soupirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "souple": {
        "A": {
            "tab": ["n25"]
        }
    },
    "source": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sourd": {
        "A": {
            "tab": ["n28"]
        }
    },
    "souriant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "sourire": {
        "V": {
            "tab": "v107",
            "aux": ["av"]
        }
    },
    "souris": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "sous": {
        "P": {
            "tab": ["pp"]
        }
    },
    "soutenir": {
        "V": {
            "tab": "v52",
            "aux": ["av"]
        }
    },
    "souterrain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "soutien": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "souvenir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "souvent": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "souverain": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "soyeux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "spacieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "spécial": {
        "A": {
            "tab": ["n47"]
        }
    },
    "spécialement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "spectacle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "spectateur": {
        "N": {
            "g": "m",
            "tab": ["n56"]
        }
    },
    "splendeur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "splendide": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sport": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "station": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "stationner": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "statue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "studieux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "stupéfaction": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "style": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "suave": {
        "A": {
            "tab": ["n25"]
        }
    },
    "subir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "subitement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "sublime": {
        "A": {
            "tab": ["n25"]
        }
    },
    "suc": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "succéder": {
        "V": {
            "tab": "v30",
            "aux": ["av"]
        }
    },
    "succès": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "successivement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "succulent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "sucer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "sucre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sud": {
        "N": {
            "g": "m",
            "tab": ["n35"]
        }
    },
    "sueur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "suffire": {
        "V": {
            "tab": "v116",
            "aux": ["av"]
        }
    },
    "suffisamment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "suffisant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "suite": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "suivant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "suivre": {
        "V": {
            "tab": "v99",
            "aux": ["av"]
        }
    },
    "sujet": {
        "N": {
            "g": "m",
            "tab": ["n3","n51"]
        }
    },
    "superbe": {
        "A": {
            "tab": ["n25"]
        }
    },
    "supérieur": {
        "A": {
            "tab": ["n28"]
        }
    },
    "supplier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "supporter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "supposer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "suprême": {
        "A": {
            "tab": ["n25"]
        }
    },
    "sur": {
        "P": {
            "tab": ["pp"]
        }
    },
    "sûr": {
        "A": {
            "tab": ["n28"]
        }
    },
    "sûrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "surface": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "surgir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "surmonter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "surprendre": {
        "V": {
            "tab": "v90",
            "aux": ["av"]
        }
    },
    "surprise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sursaut": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sursauter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "surtout": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "surveiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "survenir": {
        "V": {
            "tab": "v52",
            "aux": ["êt"]
        }
    },
    "suspendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "symbole": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "sympathie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tabac": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "table": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tableau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "tablier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tache": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tâche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tacher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tâcher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tacheter": {
        "V": {
            "tab": "v10",
            "aux": ["av"]
        }
    },
    "taille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tailler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tailleur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "taillis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "taire": {
        "V": {
            "tab": "v122",
            "aux": ["av"]
        }
    },
    "talent": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "talus": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "tambour": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tant": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "tante": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tantôt": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "tapage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "taper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tapis": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "tapisser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "taquiner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tard": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "tarder": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tarte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tartine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tas": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "tasse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "teinte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "télégramme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "téléphone": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "téléphoner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tellement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "témoignage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "témoigner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "témoin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "température": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tempête": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "temps": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "tendre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "tendrement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "tendresse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ténèbres": {
        "N": {
            "g": "f",
            "tab": ["n15"]
        }
    },
    "tenir": {
        "V": {
            "tab": "v52",
            "aux": ["av"]
        }
    },
    "tentation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tente": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tenter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tenue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "terme": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "terminer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "terrain": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "terrasse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "terre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "terrestre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "terreur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "terrible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "terrier": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tête": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "thé": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "théâtre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tiède": {
        "A": {
            "tab": ["n25"]
        }
    },
    "tige": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tigre": {
        "N": {
            "g": "m",
            "tab": ["n52"]
        }
    },
    "tilleul": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "timbre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "timide": {
        "A": {
            "tab": ["n25"]
        }
    },
    "tinter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tirelire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tirer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tiroir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tissu": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "titre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "toile": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "toilette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "toit": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tombe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tombeau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "tomber": {
        "V": {
            "tab": "v36",
            "aux": ["êt"]
        }
    },
    "tonneau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "tonnerre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tordre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "torrent": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tort": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tortue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tôt": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "toucher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "touffe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "touffu": {
        "A": {
            "tab": ["n28"]
        }
    },
    "toujours": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "tour": {
        "N": {
            "g": "m",
            "tab": ["n3","n17"]
        }
    },
    "tourbillon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tourbillonner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tourment": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tourmenter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tournant": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tournée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tourner": {
        "V": {
            "tab": "v36",
            "aux": ["aê"]
        }
    },
    "tournoyer": {
        "V": {
            "tab": "v5",
            "aux": ["av"]
        }
    },
    "toutefois": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "toux": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "trace": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tracer": {
        "V": {
            "tab": "v0",
            "aux": ["av"]
        }
    },
    "train": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "traîneau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "traîner": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "trait": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "traitement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "traiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "trajet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tram": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tramway": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tranche": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "trancher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tranquille": {
        "A": {
            "tab": ["n25"]
        }
    },
    "tranquillement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "transformation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "transformer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "transmettre": {
        "V": {
            "tab": "v89",
            "aux": ["av"]
        }
    },
    "transparent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "transport": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "transporter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "travail": {
        "N": {
            "g": "m",
            "tab": ["n6"]
        }
    },
    "travailler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "travailleur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "travailleuse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "travers": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "traverser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "trembler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tremper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "très": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "trésor": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tressaillir": {
        "V": {
            "tab": "v49",
            "aux": ["av"]
        }
    },
    "tribunal": {
        "N": {
            "g": "m",
            "tab": ["n5"]
        }
    },
    "tricolore": {
        "A": {
            "tab": ["n25"]
        }
    },
    "tricot": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "tricoter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "trimestre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "triomphe": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "triompher": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "triste": {
        "A": {
            "tab": ["n25"]
        }
    },
    "tristement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "tristesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tromper": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "trompette": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "tronc": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "trop": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "trotter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "trottoir": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "trou": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "trouble": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "troubler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "trouer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "troupe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "troupeau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "trouver": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tuer": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "tuile": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tulipe": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tunnel": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "turbulent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "tuyau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "type": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "union": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "unique": {
        "A": {
            "tab": ["n25"]
        }
    },
    "unir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "univers": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "universel": {
        "A": {
            "tab": ["n48"]
        }
    },
    "urgent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "usage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "user": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "usine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "utile": {
        "A": {
            "tab": ["n25"]
        }
    },
    "utiliser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "utilité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vache": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vagabond": {
        "A": {
            "tab": ["n28"]
        }
    },
    "vague": {
        "N": {
            "g": "f",
            "tab": ["n17","n3"]
        }
    },
    "vaillant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "vain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "vaincre": {
        "V": {
            "tab": "v86",
            "aux": ["av"]
        }
    },
    "vainqueur": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vaisselle": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vaisseau": {
        "N": {
            "tab": ["n4"]
        }
    },
    "valet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "valeur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "valise": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vallée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "valoir": {
        "V": {
            "tab": "v69",
            "aux": ["av"]
        }
    },
    "vanter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "vapeur": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "varier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "vase": {
        "N": {
            "g": "m",
            "tab": ["n3","n17"]
        }
    },
    "vaste": {
        "A": {
            "tab": ["n25"]
        }
    },
    "veau": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "végétal": {
        "A": {
            "tab": ["n47"]
        }
    },
    "végétation": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "véhicule": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "veille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "veiller": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "veine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vélo": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "velours": {
        "N": {
            "g": "m",
            "tab": ["n2"]
        }
    },
    "velouté": {
        "A": {
            "tab": ["n28"]
        }
    },
    "vendeur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "vendre": {
        "V": {
            "tab": "v85",
            "aux": ["av"]
        }
    },
    "vendredi": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vénérer": {
        "V": {
            "tab": "v28",
            "aux": ["av"]
        }
    },
    "venger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "venir": {
        "V": {
            "tab": "v52",
            "aux": ["êt"]
        }
    },
    "vent": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vente": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "ventre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vêpres": {
        "N": {
            "g": "f",
            "tab": ["n15"]
        }
    },
    "ver": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "verdâtre": {
        "A": {
            "tab": ["n25"]
        }
    },
    "verdoyant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "verdure": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "verger": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vérifier": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "véritable": {
        "A": {
            "tab": ["n25"]
        }
    },
    "vérité": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vermeil": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vernir": {
        "V": {
            "tab": "v58",
            "aux": ["av"]
        }
    },
    "verre": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vers": {
        "P": {
            "tab": ["pp"]
        }
    },
    "verser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "vert": {
        "A": {
            "tab": ["n28"]
        }
    },
    "vertu": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "veston": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vêtement": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vêtir": {
        "V": {
            "tab": "v56",
            "aux": ["av"]
        }
    },
    "veuf": {
        "A": {
            "tab": ["n46"]
        }
    },
    "viande": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vicaire": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vice": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "victime": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "victoire": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vide": {
        "A": {
            "tab": ["n25"]
        }
    },
    "vider": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "vie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vieillard": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vieillesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vierge": {
        "A": {
            "tab": ["n25"]
        }
    },
    "vieux": {
        "A": {
            "pos": "pre",
            "tab": ["n73"]
        }
    },
    "vif": {
        "A": {
            "tab": ["n46"]
        }
    },
    "vigne": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vigoureux": {
        "A": {
            "tab": ["n54"]
        }
    },
    "vigueur": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vilain": {
        "A": {
            "tab": ["n28"]
        }
    },
    "villa": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "village": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "villageois": {
        "N": {
            "g": "m",
            "tab": ["n27"]
        }
    },
    "ville": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vin": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "violence": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "violent": {
        "A": {
            "tab": ["n28"]
        }
    },
    "violet": {
        "A": {
            "tab": ["n51"]
        }
    },
    "violette": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "visage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "viser": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "visible": {
        "A": {
            "tab": ["n25"]
        }
    },
    "visite": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "visiter": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "visiteur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "vite": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "vitesse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vitre": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vitrine": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vivant": {
        "A": {
            "tab": ["n28"]
        }
    },
    "vivement": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "vivre": {
        "V": {
            "tab": "v100",
            "aux": ["av"]
        }
    },
    "voeu": {
        "N": {
            "g": "m",
            "tab": ["n4"]
        }
    },
    "voie": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "voilà": {
        "P": {
            "tab": ["pp"]
        }
    },
    "voile": {
        "N": {
            "g": "f",
            "tab": ["n3","n17"]
        }
    },
    "voiler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "voir": {
        "V": {
            "tab": "v72",
            "aux": ["av"]
        }
    },
    "voisin": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "voisinage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "voiture": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "voix": {
        "N": {
            "g": "f",
            "tab": ["n16"]
        }
    },
    "vol": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "volaille": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "volée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "voler": {
        "V": {
            "tab": "v36",
            "aux": ["av"]
        }
    },
    "volet": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "voleur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "volonté": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "volontiers": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "voltiger": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "volume": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "vouloir": {
        "V": {
            "tab": "v68",
            "aux": ["av"]
        }
    },
    "voûte": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "voyage": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "voyager": {
        "V": {
            "tab": "v3",
            "aux": ["av"]
        }
    },
    "voyageur": {
        "N": {
            "g": "m",
            "tab": ["n55"]
        }
    },
    "vrai": {
        "A": {
            "tab": ["n28"]
        }
    },
    "vraiment": {
        "Adv": {
            "tab": ["av"]
        }
    },
    "vue": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "vulgaire": {
        "A": {
            "tab": ["n25"]
        }
    },
    "wagon": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "zèle": {
        "N": {
            "g": "m",
            "tab": ["n3"]
        }
    },
    "suspect": {
        "N": {
            "g": "m",
            "tab": ["n28"]
        }
    },
    "moto": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "sauce": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "rangée": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "neuf": {
        "A": {
            "tab": ["n46"]
        }
    },
    "promotion": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "métis": {
        "A": {
            "tab": ["n50"]
        }
    },
    "concession": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "hibou": {
        "N": {
            "g": "m",
            "i": 1,
            "h": 1,
            "tab": ["n4"]
        }
    },
    "parenthèse": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "génération": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "tuque": {
        "N": {
            "g": "f",
            "tab": ["n17"]
        }
    },
    "maximum": {
        "N": {
            "g": "m",
            "tab": ["n78"]
        }
    },
    "copain": {
        "N": {
            "g": "m",
            "tab": ["n104"]
        }
    }
}
 

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// Rule Fr                                                                        //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


var ruleFr = {
    "conjugation": {
        "v0": {
            "ending": "cer",
            "t": {
                "p": ["ce","ces","ce","çons","cez","cent"],
                "i": ["çais","çais","çait","cions","ciez","çaient"],
                "f": ["cerai","ceras","cera","cerons","cerez","ceront"],
                "ps": ["çai","ças","ça","çâmes","çâtes","cèrent"],
                "c": ["cerais","cerais","cerait","cerions","ceriez","ceraient"],
                "s": ["ce","ces","ce","cions","ciez","cent"],
                "si": ["çasse","çasses","çât","çassions","çassiez","çassent"],
                "ip": [null,"ce",null,"çons","cez",null],
                "pr": "çant",
                "pp": "cé",
                "b": "cer"
            }
        },
        "v1": {
            "ending": "er",
            "t": {
                "p": ["e","es","e","ons","ez","ent"],
                "i": ["ais","ais","ait","ons","ez","aient"],
                "f": ["erai","eras","era","erons","erez","eront"],
                "ps": ["ai","as","a","âmes","âtes","èrent"],
                "c": ["erais","erais","erait","erions","eriez","eraient"],
                "s": ["e","es","e","ions","iez","ent"],
                "si": ["asse","asses","ât","assions","assiez","assent"],
                "ip": [null,"e",null,"ons","ez",null],
                "pr": "ant",
                "pp": "é",
                "b": "er"
            }
        },
        "v2": {
            "ending": "ecer",
            "t": {
                "p": ["ece","eces","ece","eçons","ecez","ecent"],
                "i": ["eçais","eçais","eçait","ecions","eciez","eçaient"],
                "f": ["ecerai","eceras","ecera","ecerons","ecerez","eceront"],
                "ps": ["eçai","eças","eça","eçâmes","eçâtes","ecèrent"],
                "c": ["ecerais","ecerais","ecerait","ecerions","eceriez","eceraient"],
                "s": ["ece","eces","ece","ecions","eciez","ecent"],
                "si": ["eçasse","eçasses","eçât","eçassions","eçassiez","eçassent"],
                "ip": [null,"ece",null,"eçons","ecez",null],
                "pr": "eçant",
                "pp": "ecé",
                "b": "ecer"
            }
        },
        "v3": {
            "ending": "ger",
            "t": {
                "p": ["ge","ges","ge","geons","gez","gent"],
                "i": ["geais","geais","geait","gions","giez","geaient"],
                "f": ["gerai","geras","gera","gerons","gerez","geront"],
                "ps": ["geai","geas","gea","geâmes","geâtes","gèrent"],
                "c": ["gerais","gerais","gerait","gerions","geriez","geraient"],
                "s": ["ge","ges","ge","gions","giez","gent"],
                "si": ["geasse","geasses","geât","geassions","geassiez","geassent"],
                "ip": [null,"ge",null,"geons","gez",null],
                "pr": "geant",
                "pp": "gé",
                "b": "ger"
            }
        },
        "v4": {
            "ending": "yer",
            "t": {
                "p": ["ie","ies","ie","yons","yez","ient"],
                "i": ["yais","yais","yait","yions","yiez","yaient"],
                "f": ["ierai","ieras","iera","ierons","ierez","ieront"],
                "ps": ["yai","yas","ya","yâmes","yâtes","yèrent"],
                "c": ["ierais","ierais","ierait","ierions","ieriez","ieraient"],
                "s": ["ie","ies","ie","yions","yiez","ient"],
                "si": ["yasse","yasses","yât","yassions","yassiez","yassent"],
                "ip": [null,"ie",null,"yons","yez",null],
                "pr": "yant",
                "pp": "yé",
                "b": "yer"
            }
        },
        "v5": {
            "ending": "yer",
            "t": {
                "p": ["ie","ies","ie","yons","yez","ient"],
                "i": ["yais","yais","yait","yions","yiez","yaient"],
                "f": ["ierai","ieras","iera","ierons","ierez","ieront"],
                "ps": ["yai","yas","ya","yâmes","yâtes","yèrent"],
                "c": ["ierais","ierais","ierait","ierions","ieriez","ieraient"],
                "s": ["ie","ies","ie","yions","yiez","ient"],
                "si": ["yasse","yasses","yât","yassions","yassiez","yassent"],
                "ip": [null,"ie",null,"yons","yez",null],
                "pr": "yant",
                "pp": "yé",
                "b": "yer"
            }
        },
        "v6": {
            "ending": "yer",
            "t": {
                "p": ["ye","yes","ye","yons","yez","yent"],
                "i": ["yais","yais","yait","yions","yiez","yaient"],
                "f": ["yerai","yeras","yera","yerons","yerez","yeront"],
                "ps": ["yai","yas","ya","yâmes","yâtes","yèrent"],
                "c": ["yerais","yerais","yerait","yerions","yeriez","yeraient"],
                "s": ["ye","yes","ye","yions","yiez","yent"],
                "si": ["yasse","yasses","yât","yassions","yassiez","yassent"],
                "ip": [null,"ye",null,"yons","yez",null],
                "pr": "yant",
                "pp": "yé",
                "b": "yer"
            }
        },
        "v7": {
            "ending": "eler",
            "t": {
                "p": ["elle","elles","elle","elons","elez","ellent"],
                "i": ["elais","elais","elait","elions","eliez","elaient"],
                "f": ["ellerai","elleras","ellera","ellerons","ellerez","elleront"],
                "ps": ["elai","elas","ela","elâmes","elâtes","elèrent"],
                "c": ["ellerais","ellerais","ellerait","ellerions","elleriez","elleraient"],
                "s": ["elle","elles","elle","elions","eliez","ellent"],
                "si": ["elasse","elasses","elât","elassions","elassiez","elassent"],
                "ip": [null,"elle",null,"elons","elez",null],
                "pr": "elant",
                "pp": "elé",
                "b": "eler"
            }
        },
        "v8": {
            "ending": "eler",
            "t": {
                "p": ["èle","èles","èle","elons","elez","èlent"],
                "i": ["elais","elais","elait","elions","eliez","elaient"],
                "f": ["èlerai","èleras","èlera","èlerons","èlerez","èleront"],
                "ps": ["elai","elas","ela","elâmes","elâtes","elèrent"],
                "c": ["èlerais","èlerais","èlerait","èlerions","èleriez","èleraient"],
                "s": ["èle","èles","èle","elions","eliez","èlent"],
                "si": ["elasse","elasses","elât","elassions","elassiez","elassent"],
                "ip": [null,"èle",null,"elons","elez",null],
                "pr": "elant",
                "pp": "elé",
                "b": "eler"
            }
        },
        "v9": {
            "ending": "eler",
            "t": {
                "p": ["elle","elles","elle","elons","elez","ellent"],
                "i": ["elais","elais","elait","elions","eliez","elaient"],
                "f": ["ellerai","elleras","ellera","ellerons","ellerez","elleront"],
                "ps": ["elai","elas","ela","elâmes","elâtes","elèrent"],
                "c": ["ellerais","ellerais","ellerait","ellerions","elleriez","elleraient"],
                "s": ["elle","elles","elle","elions","eliez","ellent"],
                "si": ["elasse","elasses","elât","elassions","elassiez","elassent"],
                "ip": [null,"elle",null,"elons","elez",null],
                "pr": "elant",
                "pp": "elé",
                "b": "eler"
            }
        },
        "v10": {
            "ending": "eter",
            "t": {
                "p": ["ette","ettes","ette","etons","etez","ettent"],
                "i": ["etais","etais","etait","etions","etiez","etaient"],
                "f": ["etterai","etteras","ettera","etterons","etterez","etteront"],
                "ps": ["etai","etas","eta","etâmes","etâtes","etèrent"],
                "c": ["etterais","etterais","etterait","etterions","etteriez","etteraient"],
                "s": ["ette","ettes","ette","etions","etiez","ettent"],
                "si": ["etasse","etasses","etât","etassions","etassiez","etassent"],
                "ip": [null,"ette",null,"etons","etez",null],
                "pr": "etant",
                "pp": "eté",
                "b": "eter"
            }
        },
        "v11": {
            "ending": "eter",
            "t": {
                "p": ["ète","ètes","ète","etons","etez","ètent"],
                "i": ["etais","etais","etait","etions","etiez","etaient"],
                "f": ["èterai","èteras","ètera","èterons","èterez","èteront"],
                "ps": ["etai","etas","eta","etâmes","etâtes","etèrent"],
                "c": ["èterais","èterais","èterait","èterions","èteriez","èteraient"],
                "s": ["ète","ètes","ète","etions","etiez","ètent"],
                "si": ["etasse","etasses","etât","etassions","etassiez","etassent"],
                "ip": [null,"ète",null,"etons","etez",null],
                "pr": "etant",
                "pp": "eté",
                "b": "eter"
            }
        },
        "v12": {
            "ending": "éter",
            "t": {
                "p": ["ète","ètes","ète","étons","étez","ètent"],
                "i": ["étais","étais","était","étions","étiez","étaient"],
                "f": ["èterai","èteras","ètera","èterons","èterez","èteront"],
                "ps": ["étai","étas","éta","étâmes","étâtes","étèrent"],
                "c": ["èterais","èterais","èterait","èterions","èteriez","èteraient"],
                "s": ["ète","ètes","ète","étions","étiez","ètent"],
                "si": ["étasse","étasses","étât","étassions","étassiez","étassent"],
                "ip": [null,"ète",null,"étons","étez",null],
                "pr": "étant",
                "pp": "été",
                "b": "éter"
            }
        },
        "v13": {
            "ending": "emer",
            "t": {
                "p": ["ème","èmes","ème","emons","emez","èment"],
                "i": ["emais","emais","emait","emions","emiez","emaient"],
                "f": ["èmerai","èmeras","èmera","èmerons","èmerez","èmeront"],
                "ps": ["emai","emas","ema","emâmes","emâtes","emèrent"],
                "c": ["èmerais","èmerais","èmerait","èmerions","èmeriez","èmeraient"],
                "s": ["ème","èmes","ème","emions","emiez","èment"],
                "si": ["emasse","emasses","emât","emassions","emassiez","emassent"],
                "ip": [null,"ème",null,"emons","emez",null],
                "pr": "emant",
                "pp": "emé",
                "b": "emer"
            }
        },
        "v14": {
            "ending": "éguer",
            "t": {
                "p": ["ègue","ègues","ègue","éguons","éguez","èguent"],
                "i": ["éguais","éguais","éguait","éguions","éguiez","éguaient"],
                "f": ["èguerai","ègueras","èguera","èguerons","èguerez","ègueront"],
                "ps": ["éguai","éguas","égua","éguâmes","éguâtes","éguèrent"],
                "c": ["èguerais","èguerais","èguerait","èguerions","ègueriez","ègueraient"],
                "s": ["ègue","ègues","ègue","éguions","éguiez","èguent"],
                "si": ["éguasse","éguasses","éguât","éguassions","éguassiez","éguassent"],
                "ip": [null,"ègue",null,"éguons","éguez",null],
                "pr": "éguant",
                "pp": "égué",
                "b": "éguer"
            }
        },
        "v15": {
            "ending": "équer",
            "t": {
                "p": ["èque","èques","èque","équons","équez","èquent"],
                "i": ["équais","équais","équait","équions","équiez","équaient"],
                "f": ["èquerai","èqueras","èquera","èquerons","èquerez","èqueront"],
                "ps": ["équai","équas","équa","équâmes","équâtes","équèrent"],
                "c": ["èquerais","èquerais","èquerait","èquerions","èqueriez","èqueraient"],
                "s": ["èque","èques","èque","équions","équiez","èquent"],
                "si": ["équasse","équasses","équât","équassions","équassiez","équassent"],
                "ip": [null,"èque",null,"équons","équez",null],
                "pr": "équant",
                "pp": "équé",
                "b": "équer"
            }
        },
        "v16": {
            "ending": "éler",
            "t": {
                "p": ["èle","èles","èle","élons","élez","èlent"],
                "i": ["élais","élais","élait","élions","éliez","élaient"],
                "f": ["élerai","éleras","élera","élerons","élerez","éleront"],
                "ps": ["élai","élas","éla","élâmes","élâtes","élèrent"],
                "c": ["élerais","élerais","élerait","élerions","éleriez","éleraient"],
                "s": ["èle","èles","èle","élions","éliez","èlent"],
                "si": ["élasse","élasses","élât","élassions","élassiez","élassent"],
                "ip": [null,"èle",null,"élons","élez",null],
                "pr": "élant",
                "pp": "élé",
                "b": "éler"
            }
        },
        "v17": {
            "ending": "étrer",
            "t": {
                "p": ["ètre","ètres","ètre","étrons","étrez","ètrent"],
                "i": ["étrais","étrais","étrait","étrions","étriez","étraient"],
                "f": ["étrerai","étreras","étrera","étrerons","étrerez","étreront"],
                "ps": ["étrai","étras","étra","étrâmes","étrâtes","étrèrent"],
                "c": ["étrerais","étrerais","étrerait","étrerions","étreriez","étreraient"],
                "s": ["ètre","ètres","ètre","étrions","étriez","ètrent"],
                "si": ["étrasse","étrasses","étrât","étrassions","étrassiez","étrassent"],
                "ip": [null,"ètre",null,"étrons","étrez",null],
                "pr": "étrant",
                "pp": "étré",
                "b": "étrer"
            }
        },
        "v18": {
            "ending": "égler",
            "t": {
                "p": ["ègle","ègles","ègle","églons","églez","èglent"],
                "i": ["églais","églais","églait","églions","égliez","églaient"],
                "f": ["églerai","égleras","églera","églerons","églerez","égleront"],
                "ps": ["églai","églas","égla","églâmes","églâtes","églèrent"],
                "c": ["églerais","églerais","églerait","églerions","égleriez","égleraient"],
                "s": ["ègle","ègles","ègle","églions","égliez","èglent"],
                "si": ["églasse","églasses","églât","églassions","églassiez","églassent"],
                "ip": [null,"ègle",null,"églons","églez",null],
                "pr": "églant",
                "pp": "églé",
                "b": "égler"
            }
        },
        "v19": {
            "ending": "égner",
            "t": {
                "p": ["ègne","ègnes","ègne","égnons","égnez","ègnent"],
                "i": ["égnais","égnais","égnait","égnions","égniez","égnaient"],
                "f": ["égnerai","égneras","égnera","égnerons","égnerez","égneront"],
                "ps": ["égnai","égnas","égna","égnâmes","égnâtes","égnèrent"],
                "c": ["égnerais","égnerais","égnerait","égnerions","égneriez","égneraient"],
                "s": ["ègne","ègnes","ègne","égnions","égniez","ègnent"],
                "si": ["égnasse","égnasses","égnât","égnassions","égnassiez","égnassent"],
                "ip": [null,"ègne",null,"égnons","égnez",null],
                "pr": "égnant",
                "pp": "égné",
                "b": "égner"
            }
        },
        "v20": {
            "ending": "ébrer",
            "t": {
                "p": ["èbre","èbres","èbre","ébrons","ébrez","èbrent"],
                "i": ["ébrais","ébrais","ébrait","ébrions","ébriez","ébraient"],
                "f": ["ébrerai","ébreras","ébrera","ébrerons","ébrerez","ébreront"],
                "ps": ["ébrai","ébras","ébra","ébrâmes","ébrâtes","ébrèrent"],
                "c": ["ébrerais","ébrerais","ébrerait","ébrerions","ébreriez","ébreraient"],
                "s": ["èbre","èbres","èbre","ébrions","ébriez","èbrent"],
                "si": ["ébrasse","ébrasses","ébrât","ébrassions","ébrassiez","ébrassent"],
                "ip": [null,"èbre",null,"ébrons","ébrez",null],
                "pr": "ébrant",
                "pp": "ébré",
                "b": "ébrer"
            }
        },
        "v21": {
            "ending": "égrer",
            "t": {
                "p": ["ègre","ègres","ègre","égrons","égrez","ègrent"],
                "i": ["égrais","égrais","égrait","égrions","égriez","égraient"],
                "f": ["égrerai","égreras","égrera","égrerons","égrerez","égreront"],
                "ps": ["égrai","égras","égra","égrâmes","égrâtes","égrèrent"],
                "c": ["égrerais","égrerais","égrerait","égrerions","égreriez","égreraient"],
                "s": ["ègre","ègres","ègre","égrions","égriez","ègrent"],
                "si": ["égrasse","égrasses","égrât","égrassions","égrassiez","égrassent"],
                "ip": [null,"ègre",null,"égrons","égrez",null],
                "pr": "égrant",
                "pp": "égré",
                "b": "égrer"
            }
        },
        "v22": {
            "ending": "éter",
            "t": {
                "p": ["ète","ètes","ète","étons","étez","ètent"],
                "i": ["étais","étais","était","étions","étiez","étaient"],
                "f": ["éterai","éteras","étera","éterons","éterez","éteront"],
                "ps": ["étai","étas","éta","étâmes","étâtes","étèrent"],
                "c": ["éterais","éterais","éterait","éterions","éteriez","éteraient"],
                "s": ["ète","ètes","ète","étions","étiez","ètent"],
                "si": ["étasse","étasses","étât","étassions","étassiez","étassent"],
                "ip": [null,"ète",null,"étons","étez",null],
                "pr": "étant",
                "pp": "été",
                "b": "éter"
            }
        },
        "v23": {
            "ending": "éner",
            "t": {
                "p": ["ène","ènes","ène","énons","énez","ènent"],
                "i": ["énais","énais","énait","énions","éniez","énaient"],
                "f": ["énerai","éneras","énera","énerons","énerez","éneront"],
                "ps": ["énai","énas","éna","énâmes","énâtes","énèrent"],
                "c": ["énerais","énerais","énerait","énerions","éneriez","éneraient"],
                "s": ["ène","ènes","ène","énions","éniez","ènent"],
                "si": ["énasse","énasses","énât","énassions","énassiez","énassent"],
                "ip": [null,"ène",null,"énons","énez",null],
                "pr": "énant",
                "pp": "éné",
                "b": "éner"
            }
        },
        "v24": {
            "ending": "ener",
            "t": {
                "p": ["ène","ènes","ène","enons","enez","ènent"],
                "i": ["enais","enais","enait","enions","eniez","enaient"],
                "f": ["ènerai","èneras","ènera","ènerons","ènerez","èneront"],
                "ps": ["enai","enas","ena","enâmes","enâtes","enèrent"],
                "c": ["ènerais","ènerais","ènerait","ènerions","èneriez","èneraient"],
                "s": ["ène","ènes","ène","enions","eniez","ènent"],
                "si": ["enasse","enasses","enât","enassions","enassiez","enassent"],
                "ip": [null,"ène",null,"enons","enez",null],
                "pr": "enant",
                "pp": "ené",
                "b": "ener"
            }
        },
        "v25": {
            "ending": "ever",
            "t": {
                "p": ["ève","èves","ève","evons","evez","èvent"],
                "i": ["evais","evais","evait","evions","eviez","evaient"],
                "f": ["èverai","èveras","èvera","èverons","èverez","èveront"],
                "ps": ["evai","evas","eva","evâmes","evâtes","evèrent"],
                "c": ["èverais","èverais","èverait","èverions","èveriez","èveraient"],
                "s": ["ève","èves","ève","evions","eviez","èvent"],
                "si": ["evasse","evasses","evât","evassions","evassiez","evassent"],
                "ip": [null,"ève",null,"evons","evez",null],
                "pr": "evant",
                "pp": "evé",
                "b": "ever"
            }
        },
        "v26": {
            "ending": "eser",
            "t": {
                "p": ["èse","èses","èse","esons","esez","èsent"],
                "i": ["esais","esais","esait","esions","esiez","esaient"],
                "f": ["èserai","èseras","èsera","èserons","èserez","èseront"],
                "ps": ["esai","esas","esa","esâmes","esâtes","esèrent"],
                "c": ["èserais","èserais","èserait","èserions","èseriez","èseraient"],
                "s": ["èse","èses","èse","esions","esiez","èsent"],
                "si": ["esasse","esasses","esât","esassions","esassiez","esassent"],
                "ip": [null,"èse",null,"esons","esez",null],
                "pr": "esant",
                "pp": "esé",
                "b": "eser"
            }
        },
        "v27": {
            "ending": "écher",
            "t": {
                "p": ["èche","èches","èche","échons","échez","èchent"],
                "i": ["échais","échais","échait","échions","échiez","échaient"],
                "f": ["écherai","écheras","échera","écherons","écherez","écheront"],
                "ps": ["échai","échas","écha","échâmes","échâtes","échèrent"],
                "c": ["écherais","écherais","écherait","écherions","écheriez","écheraient"],
                "s": ["èche","èches","èche","échions","échiez","èchent"],
                "si": ["échasse","échasses","échât","échassions","échassiez","échassent"],
                "ip": [null,"èche",null,"échons","échez",null],
                "pr": "échant",
                "pp": "éché",
                "b": "écher"
            }
        },
        "v28": {
            "ending": "érer",
            "t": {
                "p": ["ère","ères","ère","érons","érez","èrent"],
                "i": ["érais","érais","érait","érions","ériez","éraient"],
                "f": ["érerai","éreras","érera","érerons","érerez","éreront"],
                "ps": ["érai","éras","éra","érâmes","érâtes","érèrent"],
                "c": ["érerais","érerais","érerait","érerions","éreriez","éreraient"],
                "s": ["ère","ères","ère","érions","ériez","èrent"],
                "si": ["érasse","érasses","érât","érassions","érassiez","érassent"],
                "ip": [null,"ère",null,"érons","érez",null],
                "pr": "érant",
                "pp": "éré",
                "b": "érer"
            }
        },
        "v29": {
            "ending": "evrer",
            "t": {
                "p": ["èvre","èvres","èvre","evrons","evrez","èvrent"],
                "i": ["evrais","evrais","evrait","evrions","evriez","evraient"],
                "f": ["èvrerai","èvreras","èvrera","èvrerons","èvrerez","èvreront"],
                "ps": ["evrai","evras","evra","evrâmes","evrâtes","evrèrent"],
                "c": ["èvrerais","èvrerais","èvrerait","èvrerions","èvreriez","èvreraient"],
                "s": ["èvre","èvres","èvre","evrions","evriez","èvrent"],
                "si": ["evrasse","evrasses","evrât","evrassions","evrassiez","evrassent"],
                "ip": [null,"èvre",null,"evrons","evrez",null],
                "pr": "evrant",
                "pp": "evré",
                "b": "evrer"
            }
        },
        "v30": {
            "ending": "éder",
            "t": {
                "p": ["ède","èdes","ède","édons","édez","èdent"],
                "i": ["édais","édais","édait","édions","édiez","édaient"],
                "f": ["éderai","éderas","édera","éderons","éderez","éderont"],
                "ps": ["édai","édas","éda","édâmes","édâtes","édèrent"],
                "c": ["éderais","éderais","éderait","éderions","éderiez","éderaient"],
                "s": ["ède","èdes","ède","édions","édiez","èdent"],
                "si": ["édasse","édasses","édât","édassions","édassiez","édassent"],
                "ip": [null,"ède",null,"édons","édez",null],
                "pr": "édant",
                "pp": "édé",
                "b": "éder"
            }
        },
        "v31": {
            "ending": "éper",
            "t": {
                "p": ["èpe","èpes","èpe","épons","épez","èpent"],
                "i": ["épais","épais","épait","épions","épiez","épaient"],
                "f": ["éperai","éperas","épera","éperons","éperez","éperont"],
                "ps": ["épai","épas","épa","épâmes","épâtes","épèrent"],
                "c": ["éperais","éperais","éperait","éperions","éperiez","éperaient"],
                "s": ["èpe","èpes","èpe","éprions","épiez","èpent"],
                "si": ["épasse","épasses","épât","épassions","épassiez","épassent"],
                "ip": [null,"èpe",null,"épons","épez",null],
                "pr": "épant",
                "pp": "épé",
                "b": "éper"
            }
        },
        "v32": {
            "ending": "eper",
            "t": {
                "p": ["èpe","èpes","èpe","epons","epez","èpent"],
                "i": ["epais","epais","epait","epions","epiez","epaient"],
                "f": ["eperai","eperas","epera","eperons","eperez","eperont"],
                "ps": ["epai","epas","epa","epâmes","epâtes","epèrent"],
                "c": ["eperais","eperais","eperait","eperions","eperiez","eperaient"],
                "s": ["èpe","èpes","èpe","eprions","epiez","èpent"],
                "si": ["epasse","epasses","epât","epassions","epassiez","epassent"],
                "ip": [null,"èpe",null,"epons","epez",null],
                "pr": "epant",
                "pp": "epé",
                "b": "eper"
            }
        },
        "v33": {
            "ending": "éser",
            "t": {
                "p": ["èse","èses","èse","ésons","ésez","èsent"],
                "i": ["ésais","ésais","ésait","ésions","ésiez","ésaient"],
                "f": ["éserai","éseras","ésera","éserons","éserez","éseront"],
                "ps": ["ésai","ésas","ésa","ésâmes","ésâtes","ésèrent"],
                "c": ["éserais","éserais","éserait","éserions","éseriez","éseraient"],
                "s": ["èse","èses","èse","ésrions","ésiez","èsent"],
                "si": ["ésasse","ésasses","ésât","ésassions","ésassiez","ésassent"],
                "ip": [null,"èse",null,"ésons","ésez",null],
                "pr": "ésant",
                "pp": "ésé",
                "b": "éser"
            }
        },
        "v34": {
            "ending": "émer",
            "t": {
                "p": ["ème","èmes","ème","émons","émez","èment"],
                "i": ["émais","émais","émait","émions","émiez","émaient"],
                "f": ["émerai","émeras","émera","émerons","émerez","émeront"],
                "ps": ["émai","émas","éma","émâmes","émâtes","émèrent"],
                "c": ["émerais","émerais","émerait","émerions","émeriez","émeraient"],
                "s": ["ème","èmes","ème","émrions","émiez","èment"],
                "si": ["émasse","émasses","émât","émassions","émassiez","émassent"],
                "ip": [null,"ème",null,"émons","émez",null],
                "pr": "émant",
                "pp": "émé",
                "b": "émer"
            }
        },
        "v35": {
            "ending": "éger",
            "t": {
                "p": ["ège","èges","ège","égeons","égez","ègent"],
                "i": ["égeais","égeais","égeait","égions","égiez","égeaient"],
                "f": ["ègerai","ègeras","ègera","ègerons","ègerez","ègeront"],
                "ps": ["égeai","égeas","égea","égeâmes","égeâtes","égèrent"],
                "c": ["ègerais","ègerais","ègerait","ègerions","ègeriez","ègeraient"],
                "s": ["ège","èges","ège","égions","égiez","ègent"],
                "si": ["égeasse","égeasses","égeât","égeassions","égeassiez","égeassent"],
                "ip": [null,"ège",null,"égeons","égez",null],
                "pr": "égeant",
                "pp": "égé",
                "b": "éger"
            }
        },
        "v36": {
            "ending": "er",
            "t": {
                "p": ["e","es","e","ons","ez","ent"],
                "i": ["ais","ais","ait","ions","iez","aient"],
                "f": ["erai","eras","era","erons","erez","eront"],
                "ps": ["ai","as","a","âmes","âtes","èrent"],
                "c": ["erais","erais","erait","erions","eriez","eraient"],
                "s": ["e","es","e","ions","iez","ent"],
                "si": ["asse","asses","ât","assions","assiez","assent"],
                "ip": [null,"e",null,"ons","ez",null],
                "pr": "ant",
                "pp": "é",
                "b": "er"
            }
        },
        "v37": {
            "ending": "évrer",
            "t": {
                "p": ["èvre","èvres","èvre","évrons","évrez","èvrent"],
                "i": ["évrais","évrais","évrait","évrions","évriez","évraient"],
                "f": ["évrerai","évreras","évrera","évrerons","évrerez","évreront"],
                "ps": ["évrai","évras","évra","évrâmes","évrâtes","évrèrent"],
                "c": ["évrerais","évrerais","évrerait","évrerions","évreriez","évreraient"],
                "s": ["èvre","èvres","èvre","évrions","évriez","èvrent"],
                "si": ["évrasse","évrasses","évrât","évrassions","évrassiez","évrassent"],
                "ip": [null,"èvre",null,"évrons","évrez",null],
                "pr": "évrant",
                "pp": "évré",
                "b": "évrer"
            }
        },
        "v38": {
            "ending": "écrer",
            "t": {
                "p": ["ècre","ècres","ècre","écrons","écrez","ècrent"],
                "i": ["écrais","écrais","écrait","écrions","écriez","écraient"],
                "f": ["écrerai","écreras","écrera","écrerons","écrerez","écreront"],
                "ps": ["écrai","écras","écra","écrâmes","écrâtes","écrèrent"],
                "c": ["écrerais","écrerais","écrerait","écrerions","écreriez","écreraient"],
                "s": ["ècre","ècres","ècre","écrions","écriez","ècrent"],
                "si": ["écrasse","écrasses","écrât","écrassions","écrassiez","écrassent"],
                "ip": [null,"ècre",null,"écrons","écrez",null],
                "pr": "écrant",
                "pp": "écré",
                "b": "écrer"
            }
        },
        "v39": {
            "ending": "érir",
            "t": {
                "p": ["iers","iers","iert","érons","érez","ièrent"],
                "i": ["érais","érais","érait","érions","ériez","éraient"],
                "f": ["errai","erras","erra","errons","errez","erront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["errais","errais","errait","errions","erriez","erraient"],
                "s": ["ière","ières","ière","érions","ériez","ièrent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"iers",null,"érons","érez",null],
                "pr": "érant",
                "pp": "is",
                "b": "érir"
            }
        },
        "v40": {
            "ending": "érir",
            "t": {
                "p": [null,null,null,null,null,null],
                "i": [null,null,null,null,null,null],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": null,
                "b": "érir"
            }
        },
        "v41": {
            "ending": "ïr",
            "t": {
                "p": ["is","is","it","ïssons","ïssez","ïssent"],
                "i": ["ïssais","ïssais","ïssait","ïssions","ïssiez","ïssaient"],
                "f": ["ïrai","ïras","ïra","ïrons","ïrez","ïront"],
                "ps": ["ïs","ïs","ït","ïmes","ïtes","ïrent"],
                "c": ["ïrais","ïrais","ïrait","ïrions","ïriez","ïraient"],
                "s": ["ïsse","ïsses","ïsse","ïssions","ïssiez","ïssent"],
                "si": ["ïsse","ïsses","ït","ïssions","ïssiez","ïssent"],
                "ip": [null,"is",null,"ïssons","ïssez",null],
                "pr": "ïssant",
                "pp": "ï",
                "b": "ïr"
            }
        },
        "v42": {
            "ending": "ïr",
            "t": {
                "p": ["ïs","ïs","ït","ïssons","ïssez","ïssent"],
                "i": ["ïssais","ïssais","ïssait","ïssions","ïssiez","ïssaient"],
                "f": ["ïrai","ïras","ïra","ïrons","ïrez","ïront"],
                "ps": ["ïs","ïs","ït","ïmes","ïtes","ïrent"],
                "c": ["ïrais","ïrais","ïrait","ïrions","ïriez","ïraient"],
                "s": ["ïsse","ïsses","ïsse","ïssions","ïssiez","ïssent"],
                "si": ["ïsse","ïsses","ït","ïssions","ïssiez","ïssent"],
                "ip": [null,"ïs",null,"ïssons","ïssez",null],
                "pr": "ïssant",
                "pp": "ï",
                "b": "ïr"
            }
        },
        "v43": {
            "ending": "eurir",
            "t": {
                "p": ["euris","euris","eurit","eurissons","eurissez","eurissent"],
                "i": ["eurissais","eurissais","eurissait","eurissions","eurissiez","eurissaient"],
                "f": ["eurirai","euriras","eurira","eurirons","eurirez","euriront"],
                "ps": ["euris","euris","eurit","eurîmes","eurîtes","eurirent"],
                "c": ["eurirais","eurirais","eurirait","euririons","euririez","euriraient"],
                "s": ["eurisse","eurisses","eurisse","eurissions","eurissiez","eurissent"],
                "si": ["eurisse","eurisses","eurît","eurissions","eurissiez","eurissent"],
                "ip": [null,"euris",null,"eurissons","eurissez",null],
                "pr": "eurissant",
                "pp": "euri",
                "b": "eurir"
            }
        },
        "v44": {
            "ending": "rir",
            "t": {
                "p": ["re","res","re","rons","rez","rent"],
                "i": ["rais","rais","rait","rions","riez","raient"],
                "f": ["rirai","riras","rira","rirons","rirez","riront"],
                "ps": ["ris","ris","rit","rîmes","rîtes","rirent"],
                "c": ["rirais","rirais","rirait","ririons","ririez","riraient"],
                "s": ["re","res","re","rions","riez","rent"],
                "si": ["risse","risses","rît","rissions","rissiez","rissent"],
                "ip": [null,"re",null,"rons","rez",null],
                "pr": "rant",
                "pp": "ert",
                "b": "rir"
            }
        },
        "v45": {
            "ending": "mir",
            "t": {
                "p": ["s","s","t","mons","mez","ment"],
                "i": ["mais","mais","mait","mions","miez","maient"],
                "f": ["mirai","miras","mira","mirons","mirez","miront"],
                "ps": ["mis","mis","mit","mîmes","mîtes","mirent"],
                "c": ["mirais","mirais","mirait","mirions","miriez","miraient"],
                "s": ["me","mes","me","mions","miez","ment"],
                "si": ["misse","misses","mît","missions","missiez","missent"],
                "ip": [null,"s",null,"mons","mez",null],
                "pr": "mant",
                "pp": "mi",
                "b": "mir"
            }
        },
        "v46": {
            "ending": "tir",
            "t": {
                "p": ["s","s","t","tons","tez","tent"],
                "i": ["tais","tais","tait","tions","tiez","taient"],
                "f": ["tirai","tiras","tira","tirons","tirez","tiront"],
                "ps": ["tis","tis","tit","tîmes","tîtes","tirent"],
                "c": ["tirais","tirais","tirait","tirions","tiriez","tiraient"],
                "s": ["te","tes","te","tions","tiez","tent"],
                "si": ["tisse","tisses","tît","tissions","tissiez","tissent"],
                "ip": [null,"s",null,"tons","tez",null],
                "pr": "tant",
                "pp": "ti",
                "b": "tir"
            }
        },
        "v47": {
            "ending": "vir",
            "t": {
                "p": ["s","s","t","vons","vez","vent"],
                "i": ["vais","vais","vait","vions","viez","vaient"],
                "f": ["virai","viras","vira","virons","virez","viront"],
                "ps": ["vis","vis","vit","vîmes","vîtes","virent"],
                "c": ["virais","virais","virait","virions","viriez","viraient"],
                "s": ["ve","ves","ve","vions","viez","vent"],
                "si": ["visse","visses","vît","vissions","vissiez","vissent"],
                "ip": [null,"s",null,"vons","vez",null],
                "pr": "vant",
                "pp": "vi",
                "b": "vir"
            }
        },
        "v48": {
            "ending": "illir",
            "t": {
                "p": ["s","s","t","illons","illez","illent"],
                "i": ["illais","illais","illait","illions","illiez","illaient"],
                "f": ["illirai","illiras","illira","illirons","illirez","illiront"],
                "ps": ["illis","illis","illit","illîmes","illîtes","illirent"],
                "c": ["illirais","illirais","illirait","illirions","illiriez","illiraient"],
                "s": ["ille","illes","ille","illions","illiez","illent"],
                "si": ["illisse","illisses","illît","illissions","illissiez","illissent"],
                "ip": [null,"s",null,"illons","illez",null],
                "pr": "illant",
                "pp": "illi",
                "b": "illir"
            }
        },
        "v49": {
            "ending": "ir",
            "t": {
                "p": ["e","es","e","ons","ez","ent"],
                "i": ["ais","ais","ait","ions","iez","aient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["e","es","e","ions","iez","ent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"e",null,"ons","ez",null],
                "pr": "ant",
                "pp": "i",
                "b": "ir"
            }
        },
        "v50": {
            "ending": "ir",
            "t": {
                "p": ["is","is","it","issons","issez","issent"],
                "i": ["issais","issais","issait","issions","issiez","issaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["isse","isses","isse","issions","issiez","issent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"issons","issez",null],
                "pr": "issant",
                "pp": "i",
                "b": "ir"
            }
        },
        "v51": {
            "ending": "ir",
            "t": {
                "p": ["e","es","e","ons","ez","ent"],
                "i": ["ais","ais","ait","ions","iez","aient"],
                "f": ["erai","eras","era","erons","erez","eront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["erais","erais","erait","erions","eriez","eraient"],
                "s": ["e","es","e","ions","iez","ent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"e",null,"ons","ez",null],
                "pr": "ant",
                "pp": "i",
                "b": "ir"
            }
        },
        "v52": {
            "ending": "enir",
            "t": {
                "p": ["iens","iens","ient","enons","enez","iennent"],
                "i": ["enais","enais","enait","enions","eniez","enaient"],
                "f": ["iendrai","iendras","iendra","iendrons","iendrez","iendront"],
                "ps": ["ins","ins","int","înmes","întes","inrent"],
                "c": ["iendrais","iendrais","iendrait","iendrions","iendriez","iendraient"],
                "s": ["ienne","iennes","ienne","enions","eniez","iennent"],
                "si": ["insse","insses","înt","inssions","inssiez","inssent"],
                "ip": [null,"iens",null,"enons","enez",null],
                "pr": "enant",
                "pp": "enu",
                "b": "enir"
            }
        },
        "v53": {
            "ending": "enir",
            "t": {
                "p": [null,null,"ient",null,null,null],
                "i": [null,null,"enait",null,null,null],
                "f": [null,null,"iendra",null,null,null],
                "ps": [null,null,"int",null,null,null],
                "c": [null,null,"iendrait",null,null,null],
                "s": [null,null,"ienne",null,null,null],
                "si": [null,null,"înt",null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": "enant",
                "pp": "enu",
                "b": "enir"
            }
        },
        "v54": {
            "ending": "ir",
            "t": {
                "p": ["is","is","it","yons","yez","ient"],
                "i": ["yais","yais","yait","yions","yiez","yaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ie","ies","ie","yions","yiez","ient"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"yons","yez",null],
                "pr": "yant",
                "pp": "i",
                "b": "ir"
            }
        },
        "v55": {
            "ending": "ourir",
            "t": {
                "p": ["eurs","eurs","eurt","ourons","ourez","eurent"],
                "i": ["ourais","ourais","ourait","ourions","ouriez","ouraient"],
                "f": ["ourrai","ourras","ourra","ourrons","ourrez","ourront"],
                "ps": ["ourus","ourus","ourut","ourûmes","ourûtes","oururent"],
                "c": ["ourrais","ourrais","ourrait","ourrions","ourriez","ourraient"],
                "s": ["eure","eures","eure","ourions","ouriez","eurent"],
                "si": ["ourusse","ourusses","ourût","ourussions","ourussiez","ourussent"],
                "ip": [null,"eurs",null,"ourons","ourez",null],
                "pr": "ourant",
                "pp": "ort",
                "b": "ourir"
            }
        },
        "v56": {
            "ending": "ir",
            "t": {
                "p": ["s","s","","ons","ez","ent"],
                "i": ["ais","ais","ait","ions","iez","aient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["e","es","e","ions","iez","ent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"s",null,"ons","ez",null],
                "pr": "ant",
                "pp": "u",
                "b": "ir"
            }
        },
        "v57": {
            "ending": "ir",
            "t": {
                "p": ["s","s","t","ons","ez","ent"],
                "i": ["ais","ais","ait","ions","iez","aient"],
                "f": ["rai","ras","ra","rons","rez","ront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["rais","rais","rait","rions","riez","raient"],
                "s": ["e","es","e","ions","iez","ent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"s",null,"ons","ez",null],
                "pr": "ant",
                "pp": "u",
                "b": "ir"
            }
        },
        "v58": {
            "ending": "ir",
            "t": {
                "p": ["is","is","it","issons","issez","issent"],
                "i": ["issais","issais","issait","issions","issiez","issaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["isse","isses","isse","issions","issiez","issent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"issons","issez",null],
                "pr": "issant",
                "pp": "i",
                "b": "ir"
            }
        },
        "v59": {
            "ending": "ir",
            "t": {
                "p": ["is","is","it","ons","ez","ent"],
                "i": ["ais","ais","ait","ions","iez","aient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["e","es","e","ions","iez","ent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"ons","ez",null],
                "pr": "ant",
                "pp": "i",
                "b": "ir"
            }
        },
        "v60": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","issons","issez","issent"],
                "i": ["issais","issais","issait","issions","issiez","issaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["isse","isses","isse","issions","issiez","issent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"issons","issez",null],
                "pr": "issant",
                "pp": "it",
                "b": "ire"
            }
        },
        "v61": {
            "ending": "illir",
            "t": {
                "p": ["ux","ux","ut","illons","illez","illent"],
                "i": ["illais","illais","illait","illions","illiez","illaient"],
                "f": ["illirai","illiras","illira","illirons","illirez","illiront"],
                "ps": ["illis","illis","illit","illîmes","illîtes","illirent"],
                "c": ["illirais","illirais","illirait","illirions","illiriez","illiraient"],
                "s": ["illisse","illisses","illisse","illissions","illissiez","illissent"],
                "si": ["illisse","illisses","illît","illissions","illissiez","illissent"],
                "ip": [null,null,null,null,null,null],
                "pr": "illant",
                "pp": "illi",
                "b": "illir"
            }
        },
        "v62": {
            "ending": "ésir",
            "t": {
                "p": ["is","is","ît","isons","isez","isent"],
                "i": ["isais","isais","isait","isions","isiez","isaient"],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": "isant",
                "pp": null,
                "b": "ésir"
            }
        },
        "v63": {
            "ending": "cevoir",
            "t": {
                "p": ["çois","çois","çoit","cevons","cevez","çoivent"],
                "i": ["cevais","cevais","cevait","cevions","ceviez","cevaient"],
                "f": ["cevrai","cevras","cevra","cevrons","cevrez","cevront"],
                "ps": ["çus","çus","çut","çûmes","çûtes","çurent"],
                "c": ["cevrais","cevrais","cevrait","cevrions","cevriez","cevraient"],
                "s": ["çoive","çoives","çoive","cevions","ceviez","çoivent"],
                "si": ["çusse","çusses","çût","çussions","çussiez","çussent"],
                "ip": [null,"çois",null,"cevons","cevez",null],
                "pr": "cevant",
                "pp": "çu",
                "b": "cevoir"
            }
        },
        "v64": {
            "ending": "evoir",
            "t": {
                "p": ["ois","ois","oit","evons","evez","oivent"],
                "i": ["evais","evais","evait","evions","eviez","evaient"],
                "f": ["evrai","evras","evra","evrons","evrez","evront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["evrais","evrais","evrait","evrions","evriez","evraient"],
                "s": ["oive","oives","oive","evions","eviez","oivent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"ois",null,"evons","evez",null],
                "pr": "evant",
                "pp": "û",
                "b": "evoir"
            }
        },
        "v65": {
            "ending": "ouvoir",
            "t": {
                "p": ["eus","eus","eut","ouvons","ouvez","euvent"],
                "i": ["ouvais","ouvais","ouvait","ouvions","ouviez","ouvaient"],
                "f": ["ouvrai","ouvras","ouvra","ouvrons","ouvrez","ouvront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["ouvrais","ouvrais","ouvrait","ouvrions","ouvriez","ouvraient"],
                "s": ["euve","euves","euve","ouvions","ouviez","euvent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"eus",null,"ouvons","ouvez",null],
                "pr": "ouvant",
                "pp": "u",
                "b": "ouvoir"
            }
        },
        "v66": {
            "ending": "ouvoir",
            "t": {
                "p": ["eus","eus","eut","ouvons","ouvez","euvent"],
                "i": ["ouvais","ouvais","ouvait","ouvions","ouviez","ouvaient"],
                "f": ["ouvrai","ouvras","ouvra","ouvrons","ouvrez","ouvront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["ouvrais","ouvrais","ouvrait","ouvrions","ouvriez","ouvraient"],
                "s": ["euve","euves","euve","ouvions","ouviez","euvent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"eus",null,"ouvons","ouvez",null],
                "pr": "ouvant",
                "pp": "u",
                "b": "ouvoir"
            }
        },
        "v67": {
            "ending": "avoir",
            "t": {
                "p": ["ais","ais","ait","avons","avez","avent"],
                "i": ["avais","avais","avait","avions","aviez","avaient"],
                "f": ["aurai","auras","aura","aurons","aurez","auront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["aurais","aurais","aurait","aurions","auriez","auraient"],
                "s": ["ache","aches","ache","achions","achiez","achent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"ache",null,"achons","achez",null],
                "pr": "achant",
                "pp": "u",
                "b": "avoir"
            }
        },
        "v68": {
            "ending": "ouloir",
            "t": {
                "p": ["eux","eux","eut","oulons","oulez","eulent"],
                "i": ["oulais","oulais","oulait","oulions","ouliez","oulaient"],
                "f": ["oudrai","oudras","oudra","oudrons","oudrez","oudront"],
                "ps": ["oulus","oulus","oulut","oulûmes","oulûtes","oulurent"],
                "c": ["oudrais","oudrais","oudrait","oudrions","oudriez","oudraient"],
                "s": ["euille","euilles","euille","oulions","ouliez","euillent"],
                "si": ["oulusse","oulusses","oulût","oulussions","oulussiez","oulussent"],
                "ip": [null,"euille",null,"oulons","euillez",null],
                "pr": "oulant",
                "pp": "oulu",
                "b": "ouloir"
            }
        },
        "v69": {
            "ending": "loir",
            "t": {
                "p": ["ux","ux","ut","lons","lez","lent"],
                "i": ["lais","lais","lait","lions","liez","laient"],
                "f": ["udrai","udras","udra","udrons","udrez","udront"],
                "ps": ["lus","lus","lut","lûmes","lûtes","lurent"],
                "c": ["udrais","udrais","udrait","udrions","udriez","udraient"],
                "s": ["ille","illes","ille","lions","liez","illent"],
                "si": ["lusse","lusses","lût","lussions","lussiez","lussent"],
                "ip": [null,"ux",null,"lons","lez",null],
                "pr": "lant",
                "pp": "lu",
                "b": "loir"
            }
        },
        "v70": {
            "ending": "loir",
            "t": {
                "p": ["ux","ux","ut","lons","lez","lent"],
                "i": ["lais","lais","lait","lions","liez","laient"],
                "f": ["udrai","udras","udra","udrons","udrez","udront"],
                "ps": ["lus","lus","lut","lûmes","lûtes","lurent"],
                "c": ["udrais","udrais","udrait","udrions","udriez","udraient"],
                "s": ["le","les","le","lions","liez","lent"],
                "si": ["lusse","lusses","lût","lussions","lussiez","lussent"],
                "ip": [null,"ux",null,"lons","lez",null],
                "pr": "lant",
                "pp": "lu",
                "b": "loir"
            }
        },
        "v71": {
            "ending": "ouvoir",
            "t": {
                "p": ["eux","eux","eut","ouvons","ouvez","euvent"],
                "i": ["ouvais","ouvais","ouvait","ouvions","ouviez","ouvaient"],
                "f": ["ourrai","ourras","ourra","ourrons","ourrez","ourront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["ourrais","ourrais","ourrait","ourrions","ourriez","ourraient"],
                "s": ["uisse","uisses","uisse","uissions","uissiez","uissent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,null,null,null,null,null],
                "pr": "ouvant",
                "pp": "u",
                "b": "ouvoir"
            }
        },
        "v72": {
            "ending": "oir",
            "t": {
                "p": ["ois","ois","oit","oyons","oyez","oient"],
                "i": ["oyais","oyais","oyait","oyions","oyiez","oyaient"],
                "f": ["errai","erras","erra","errons","errez","erront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["errais","errais","errait","errions","erriez","erraient"],
                "s": ["oie","oies","oie","oyions","oyiez","oient"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"ois",null,"oyons","oyez",null],
                "pr": "oyant",
                "pp": "u",
                "b": "oir"
            }
        },
        "v73": {
            "ending": "oir",
            "t": {
                "p": ["ois","ois","oit","oyons","oyez","oient"],
                "i": ["oyais","oyais","oyait","oyions","oyiez","oyaient"],
                "f": ["oirai","oiras","oira","oirons","oirez","oiront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["oirais","oirais","oirait","oirions","oiriez","oiraient"],
                "s": ["oie","oies","oie","oyions","oyiez","oient"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"ois",null,"oyons","oyez",null],
                "pr": "oyant",
                "pp": "u",
                "b": "oir"
            }
        },
        "v74": {
            "ending": "eoir",
            "t": {
                "p": ["ieds","ieds","ied","eyons","eyez","eyent"],
                "i": ["eyais","eyais","eyait","eyions","eyiez","eyaient"],
                "f": ["iérai","iéras","iéra","iérons","iérez","iéront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["iérais","iérais","iérait","iérions","iériez","iéraient"],
                "s": ["eye","eyes","eye","eyions","eyiez","eyent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"ieds",null,"eyons","eyez",null],
                "pr": "eyant",
                "pp": "is",
                "b": "eoir"
            }
        },
        "v75": {
            "ending": "eoir",
            "t": {
                "p": ["ieds","ieds","ied","eyons","eyez","eyent"],
                "i": ["eyais","eyais","eyait","eyions","eyiez","eyaient"],
                "f": ["iérai","iéras","iéra","iérons","iérez","iéront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["iérais","iérais","iérait","iérions","iériez","iéraient"],
                "s": ["eye","eyes","eye","eyions","eyiez","eyent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"ieds",null,"eyons","eyez",null],
                "pr": "eyant",
                "pp": "is",
                "b": "eoir"
            }
        },
        "v76": {
            "ending": "eoir",
            "t": {
                "p": ["ois","ois","oit","oyons","oyez","oient"],
                "i": ["oyais","oyais","oyait","oyions","oyiez","oyaient"],
                "f": ["eoirai","eoiras","eoira","eoirons","eoirez","eoiront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["eoirais","eoirais","eoirait","eoirions","eoiriez","eoiraient"],
                "s": ["oie","oies","oie","oyions","oyiez","oient"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"ois",null,"oyons","oyez",null],
                "pr": "oyant",
                "pp": "is",
                "b": "eoir"
            }
        },
        "v77": {
            "ending": "oir",
            "t": {
                "p": ["ois","ois","oit","oyons","oyez","oient"],
                "i": ["oyais","oyais","oyait","oyions","oyiez","oyaient"],
                "f": ["oirai","oiras","oira","oirons","oirez","oiront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["oirais","oirais","oirait","oirions","oiriez","oiraient"],
                "s": ["oie","oies","oie","oyions","oyiez","oient"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"ois",null,"oyons","oyez",null],
                "pr": "oyant",
                "pp": "is",
                "b": "oir"
            }
        },
        "v78": {
            "ending": "eoir",
            "t": {
                "p": [null,null,"ied",null,null,"iéent"],
                "i": [null,null,"eyait",null,null,"eyaient"],
                "f": [null,null,"iéra",null,null,"iéront"],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,"iérait",null,null,"iéraient"],
                "s": [null,null,"iée",null,null,"iéent"],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": "éant",
                "pp": "is",
                "b": "eoir"
            }
        },
        "v79": {
            "ending": "euvoir",
            "t": {
                "p": [null,null,"eut",null,null,"euvent"],
                "i": [null,null,"euvait",null,null,"euvaient"],
                "f": [null,null,"euvra",null,null,"euvront"],
                "ps": [null,null,"ut",null,null,null],
                "c": [null,null,"euvrait",null,null,"euvraient"],
                "s": [null,null,"euve",null,null,"euvent"],
                "si": [null,null,"ût",null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": "euvant",
                "pp": "u",
                "b": "euvoir"
            }
        },
        "v80": {
            "ending": "lloir",
            "t": {
                "p": [null,null,"ut",null,null,null],
                "i": [null,null,"llait",null,null,null],
                "f": [null,null,"udra",null,null,null],
                "ps": [null,null,"llut",null,null,null],
                "c": [null,null,"udrait",null,null,null],
                "s": [null,null,"ille",null,null,null],
                "si": [null,null,"llût",null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": "llu",
                "b": "lloir"
            }
        },
        "v81": {
            "ending": "oir",
            "t": {
                "p": ["ois","ois","oit","oyons","oyez","oient"],
                "i": ["oyais","oyais","oyait","oyions","oyiez","oyaient"],
                "f": ["oirai","oiras","oira","oirons","oirez","oiront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["oirais","oirais","oirait","oirions","oiriez","oiraient"],
                "s": ["oie","oies","oie","oyions","oyiez","oient"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": "u",
                "b": "oir"
            }
        },
        "v82": {
            "ending": "oir",
            "t": {
                "p": ["ois","ois","oit","oyons","oyez","oient"],
                "i": ["oyais","oyais","oyait","oyions","oyiez","oyaient"],
                "f": ["oirai","oiras","oira","oirons","oirez","oiront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["oirais","oirais","oirait","oirions","oiriez","oiraient"],
                "s": ["oie","oies","oie","oyions","oyiez","oient"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"ois",null,"oyons","oyez",null],
                "pr": "oyant",
                "pp": "u",
                "b": "oir"
            }
        },
        "v83": {
            "ending": "oir",
            "t": {
                "p": ["ois","ois","oit","oyons","oyez","oient"],
                "i": [null,null,null,null,null,null],
                "f": ["oirai","oiras","oira","oirons","oirez","oiront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["oirais","oirais","oirait","oirions","oiriez","oiraient"],
                "s": [null,null,null,null,null,null],
                "si": [null,null,"ût",null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": "oyant",
                "pp": "u",
                "b": "oir"
            }
        },
        "v84": {
            "ending": "oir",
            "t": {
                "p": [null,null,"oit",null,null,"oient"],
                "i": [null,null,"oyait",null,null,"oyaient"],
                "f": [null,null,"oira",null,null,"oiront"],
                "ps": [null,null,"ut",null,null,"urent"],
                "c": [null,null,"oirait",null,null,"oiraient"],
                "s": [null,null,"oie",null,null,"oient"],
                "si": [null,null,"ût",null,null,"ussent"],
                "ip": [null,null,null,null,null,null],
                "pr": "éant",
                "pp": "u",
                "b": "oir"
            }
        },
        "v85": {
            "ending": "dre",
            "t": {
                "p": ["ds","ds","d","dons","dez","dent"],
                "i": ["dais","dais","dait","dions","diez","daient"],
                "f": ["drai","dras","dra","drons","drez","dront"],
                "ps": ["dis","dis","dit","dîmes","dîtes","dirent"],
                "c": ["drais","drais","drait","drions","driez","draient"],
                "s": ["de","des","de","dions","diez","dent"],
                "si": ["disse","disses","dît","dissions","dissiez","dissent"],
                "ip": [null,"ds",null,"dons","dez",null],
                "pr": "dant",
                "pp": "du",
                "b": "dre"
            }
        },
        "v86": {
            "ending": "cre",
            "t": {
                "p": ["cs","cs","c","quons","quez","quent"],
                "i": ["quais","quais","quait","quions","quiez","quaient"],
                "f": ["crai","cras","cra","crons","crez","cront"],
                "ps": ["quis","quis","quit","quîmes","quîtes","quirent"],
                "c": ["crais","crais","crait","crions","criez","craient"],
                "s": ["que","ques","que","quions","quiez","quent"],
                "si": ["quisse","quisses","quît","quissions","quissiez","quissent"],
                "ip": [null,"cs",null,"quons","quez",null],
                "pr": "quant",
                "pp": "cu",
                "b": "cre"
            }
        },
        "v87": {
            "ending": "tre",
            "t": {
                "p": ["s","s","","tons","tez","tent"],
                "i": ["tais","tais","tait","tions","tiez","taient"],
                "f": ["trai","tras","tra","trons","trez","tront"],
                "ps": ["tis","tis","tit","tîmes","tîtes","tirent"],
                "c": ["trais","trais","trait","trions","triez","traient"],
                "s": ["te","tes","te","tions","tiez","tent"],
                "si": ["tisse","tisses","tît","tissions","tissiez","tissent"],
                "ip": [null,"s",null,"tons","tez",null],
                "pr": "tant",
                "pp": "tu",
                "b": "tre"
            }
        },
        "v88": {
            "ending": "tre",
            "t": {
                "p": ["s","s","t","tons","tez","tent"],
                "i": ["tais","tais","tait","tions","tiez","taient"],
                "f": ["trai","tras","tra","trons","trez","tront"],
                "ps": [null,null,null,null,null,null],
                "c": ["trais","trais","trait","trions","triez","traient"],
                "s": ["te","tes","te","tions","tiez","tent"],
                "si": [null,null,null,null,null,null],
                "ip": [null,"s",null,"tons","tez",null],
                "pr": "tant",
                "pp": "tu",
                "b": "tre"
            }
        },
        "v89": {
            "ending": "ettre",
            "t": {
                "p": ["ets","ets","et","ettons","ettez","ettent"],
                "i": ["ettais","ettais","ettait","ettions","ettiez","ettaient"],
                "f": ["ettrai","ettras","ettra","ettrons","ettrez","ettront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["ettrais","ettrais","ettrait","ettrions","ettriez","ettraient"],
                "s": ["ette","ettes","ette","ettions","ettiez","ettent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"ets",null,"ettons","ettez",null],
                "pr": "ettant",
                "pp": "is",
                "b": "ettre"
            }
        },
        "v90": {
            "ending": "endre",
            "t": {
                "p": ["ends","ends","end","enons","enez","ennent"],
                "i": ["enais","enais","enait","enions","eniez","enaient"],
                "f": ["endrai","endras","endra","endrons","endrez","endront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["endrais","endrais","endrait","endrions","endriez","endraient"],
                "s": ["enne","ennes","enne","enions","eniez","ennent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"ends",null,"enons","enez",null],
                "pr": "enant",
                "pp": "is",
                "b": "endre"
            }
        },
        "v91": {
            "ending": "pre",
            "t": {
                "p": ["ps","ps","pt","pons","pez","pent"],
                "i": ["pais","pais","pait","pions","piez","paient"],
                "f": ["prai","pras","pra","prons","prez","pront"],
                "ps": ["pis","pis","pit","pîmes","pîtes","pirent"],
                "c": ["prais","prais","prait","prions","priez","praient"],
                "s": ["pe","pes","pe","pions","piez","pent"],
                "si": ["pisse","pisses","pît","pissions","pissiez","pissent"],
                "ip": [null,"ps",null,"pons","pez",null],
                "pr": "pant",
                "pp": "pu",
                "b": "pre"
            }
        },
        "v92": {
            "ending": "dre",
            "t": {
                "p": ["ds","ds","d","lons","lez","lent"],
                "i": ["lais","lais","lait","lions","liez","laient"],
                "f": ["drai","dras","dra","drons","drez","dront"],
                "ps": ["lus","lus","lut","lûmes","lûtes","lurent"],
                "c": ["drais","drais","drait","drions","driez","draient"],
                "s": ["le","les","le","lions","liez","lent"],
                "si": ["lusse","lusses","lût","lussions","lussiez","lussent"],
                "ip": [null,"ds",null,"lons","lez",null],
                "pr": "lant",
                "pp": "lu",
                "b": "dre"
            }
        },
        "v93": {
            "ending": "dre",
            "t": {
                "p": ["ds","ds","d","sons","sez","sent"],
                "i": ["sais","sais","sait","sions","siez","saient"],
                "f": ["drai","dras","dra","drons","drez","dront"],
                "ps": ["sis","sis","sit","sîmes","sîtes","sirent"],
                "c": ["drais","drais","drait","drions","driez","draient"],
                "s": ["se","ses","se","sions","siez","sent"],
                "si": ["sisse","sisses","sît","sissions","sissiez","sissent"],
                "ip": [null,"ds",null,"sons","sez",null],
                "pr": "sant",
                "pp": "su",
                "b": "dre"
            }
        },
        "v94": {
            "ending": "udre",
            "t": {
                "p": ["us","us","ut","lvons","lvez","lvent"],
                "i": ["lvais","lvais","lvait","lvions","lviez","lvaient"],
                "f": ["udrai","udras","udra","udrons","udrez","udront"],
                "ps": ["lus","lus","lut","lûmes","lûtes","lurent"],
                "c": ["udrais","udrais","udrait","udrions","udriez","udraient"],
                "s": ["lve","lves","lve","lvions","lviez","lvent"],
                "si": ["lusse","lusses","lût","lussions","lussiez","lussent"],
                "ip": [null,"us",null,"lvons","lvez",null],
                "pr": "lvant",
                "pp": "lu",
                "b": "udre"
            }
        },
        "v95": {
            "ending": "udre",
            "t": {
                "p": ["us","us","ut","lvons","lvez","lvent"],
                "i": ["lvais","lvais","lvait","lvions","lviez","lvaient"],
                "f": ["udrai","udras","udra","udrons","udrez","udront"],
                "ps": [null,null,null,null,null,null],
                "c": ["udrais","udrais","udrait","udrions","udriez","udraient"],
                "s": ["lve","lves","lve","lvions","lviez","lvent"],
                "si": [null,null,null,null,null,null],
                "ip": [null,"us",null,"lvons","lvez",null],
                "pr": "lvant",
                "pp": "us",
                "b": "udre"
            }
        },
        "v96": {
            "ending": "udre",
            "t": {
                "p": ["us","us","ut","lvons","lvez","lvent"],
                "i": ["lvais","lvais","lvait","lvions","lviez","lvaient"],
                "f": ["udrai","udras","udra","udrons","udrez","udront"],
                "ps": [null,null,null,null,null,null],
                "c": ["udrais","udrais","udrait","udrions","udriez","udraient"],
                "s": ["lve","lves","lve","lvions","lviez","lvent"],
                "si": [null,null,null,null,null,null],
                "ip": [null,"us",null,"lvons","lvez",null],
                "pr": "lvant",
                "pp": "us",
                "b": "udre"
            }
        },
        "v97": {
            "ending": "ndre",
            "t": {
                "p": ["ns","ns","nt","gnons","gnez","gnent"],
                "i": ["gnais","gnais","gnait","gnions","gniez","gnaient"],
                "f": ["ndrai","ndras","ndra","ndrons","ndrez","ndront"],
                "ps": ["gnis","gnis","gnit","gnîmes","gnîtes","gnirent"],
                "c": ["ndrais","ndrais","ndrait","ndrions","ndriez","ndraient"],
                "s": ["gne","gnes","gne","gnions","gniez","gnent"],
                "si": ["gnisse","gnisses","gnît","gnissions","gnissiez","gnissent"],
                "ip": [null,"ns",null,"gnons","gnez",null],
                "pr": "gnant",
                "pp": "nt",
                "b": "ndre"
            }
        },
        "v98": {
            "ending": "ndre",
            "t": {
                "p": ["ns","ns","nt","gnons","gnez","gnent"],
                "i": ["gnais","gnais","gnait","gnions","gniez","gnaient"],
                "f": ["ndrai","ndras","ndra","ndrons","ndrez","ndront"],
                "ps": ["gnis","gnis","gnit","gnîmes","gnîtes","gnirent"],
                "c": ["ndrais","ndrais","ndrait","ndrions","ndriez","ndraient"],
                "s": ["gne","gnes","gne","gnions","gniez","gnent"],
                "si": ["gnisse","gnisses","gnît","gnissions","gnissiez","gnissent"],
                "ip": [null,null,null,null,null,null],
                "pr": "gnant",
                "pp": null,
                "b": "ndre"
            }
        },
        "v99": {
            "ending": "vre",
            "t": {
                "p": ["s","s","t","vons","vez","vent"],
                "i": ["vais","vais","vait","vions","viez","vaient"],
                "f": ["vrai","vras","vra","vrons","vrez","vront"],
                "ps": ["vis","vis","vit","vîmes","vîtes","virent"],
                "c": ["vrais","vrais","vrait","vrions","vriez","vraient"],
                "s": ["ve","ves","ve","vions","viez","vent"],
                "si": ["visse","visses","vît","vissions","vissiez","vissent"],
                "ip": [null,"s",null,"vons","vez",null],
                "pr": "vant",
                "pp": "vi",
                "b": "vre"
            }
        },
        "v100": {
            "ending": "ivre",
            "t": {
                "p": ["is","is","it","ivons","ivez","ivent"],
                "i": ["ivais","ivais","ivait","ivions","iviez","ivaient"],
                "f": ["ivrai","ivras","ivra","ivrons","ivrez","ivront"],
                "ps": ["écus","écus","écut","écûmes","écûtes","écurent"],
                "c": ["ivrais","ivrais","ivrait","ivrions","ivriez","ivraient"],
                "s": ["ive","ives","ive","ivions","iviez","ivent"],
                "si": ["écusse","écusses","écût","écussions","écussiez","écussent"],
                "ip": [null,"is",null,"ivons","ivez",null],
                "pr": "ivant",
                "pp": "écu",
                "b": "ivre"
            }
        },
        "v101": {
            "ending": "aître",
            "t": {
                "p": ["ais","ais","aît","aissons","aissez","aissent"],
                "i": ["aissais","aissais","aissait","aissions","aissiez","aissaient"],
                "f": ["aîtrai","aîtras","aîtra","aîtrons","aîtrez","aîtront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["aîtrais","aîtrais","aîtrait","aîtrions","aîtriez","aîtraient"],
                "s": ["aisse","aisses","aisse","aissions","aissiez","aissent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"ais",null,"aissons","aissez",null],
                "pr": "aissant",
                "pp": "u",
                "b": "aître"
            }
        },
        "v102": {
            "ending": "aître",
            "t": {
                "p": ["ais","ais","aît","aissons","aissez","aissent"],
                "i": ["aissais","aissais","aissait","aissions","aissiez","aissaient"],
                "f": ["aîtrai","aîtras","aîtra","aîtrons","aîtrez","aîtront"],
                "ps": [null,null,null,null,null,null],
                "c": ["aîtrais","aîtrais","aîtrait","aîtrions","aîtriez","aîtraient"],
                "s": ["aisse","aisses","aisse","aissions","aissiez","aissent"],
                "si": [null,null,null,null,null,null],
                "ip": [null,"ais",null,null,"aissez",null],
                "pr": "aissant",
                "pp": "u",
                "b": "aître"
            }
        },
        "v103": {
            "ending": "aître",
            "t": {
                "p": ["ais","ais","aît","aissons","aissez","aissent"],
                "i": ["aissais","aissais","aissait","aissions","aissiez","aissaient"],
                "f": ["aîtrai","aîtras","aîtra","aîtrons","aîtrez","aîtront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["aîtrais","aîtrais","aîtrait","aîtrions","aîtriez","aîtraient"],
                "s": ["aisse","aisses","aisse","aissions","aissiez","aissent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"ais",null,"aissons","aissez",null],
                "pr": "aissant",
                "pp": "u",
                "b": "aître"
            }
        },
        "v104": {
            "ending": "aître",
            "t": {
                "p": ["ais","ais","aît","aissons","aissez","aissent"],
                "i": ["aissais","aissais","aissait","aissions","aissiez","aissaient"],
                "f": ["aîtrai","aîtras","aîtra","aîtrons","aîtrez","aîtront"],
                "ps": ["aquis","aquis","aquit","aquîmes","aquîtes","aquirent"],
                "c": ["aîtrais","aîtrais","aîtrait","aîtrions","aîtriez","aîtraient"],
                "s": ["aisse","aisses","aisse","aissions","aissiez","aissent"],
                "si": ["aquisse","aquisses","aquît","aquissions","aquissiez","aquissent"],
                "ip": [null,"ais",null,"aissons","aissez",null],
                "pr": "aissant",
                "pp": "é",
                "b": "aître"
            }
        },
        "v105": {
            "ending": "aître",
            "t": {
                "p": ["ais","ais","aît","aissons","aissez","aissent"],
                "i": ["aissais","aissais","aissait","aissions","aissiez","aissaient"],
                "f": ["aîtrai","aîtras","aîtra","aîtrons","aîtrez","aîtront"],
                "ps": ["aquis","aquis","aquit","aquîmes","aquîtes","aquirent"],
                "c": ["aîtrais","aîtrais","aîtrait","aîtrions","aîtriez","aîtraient"],
                "s": ["aisse","aisses","aisse","aissions","aissiez","aissent"],
                "si": ["aquisse","aquisses","aquît","aquissions","aquissiez","aquissent"],
                "ip": [null,"ais",null,"aissons","aissez",null],
                "pr": "aissant",
                "pp": null,
                "b": "aître"
            }
        },
        "v106": {
            "ending": "oître",
            "t": {
                "p": ["oîs","oîs","oît","oissons","oissez","oissent"],
                "i": ["oissais","oissais","oissait","oissions","oissiez","oissaient"],
                "f": ["oîtrai","oîtras","oîtra","oîtrons","oîtrez","oîtront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["oîtrais","oîtrais","oîtrait","oîtrions","oîtriez","oîtraient"],
                "s": ["oisse","oisses","oisse","oissions","oissiez","oissent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"oîs",null,"oissons","oissez",null],
                "pr": "oissant",
                "pp": "û",
                "b": "oître"
            }
        },
        "v107": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","ions","iez","ient"],
                "i": ["iais","iais","iait","iions","iiez","iaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ie","ies","ie","iions","iiez","ient"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"ions","iez",null],
                "pr": "iant",
                "pp": "i",
                "b": "ire"
            }
        },
        "v108": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","isons","isez","isent"],
                "i": ["isais","isais","isait","isions","isiez","isaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ise","ises","ise","isions","isiez","isent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"isons","isez",null],
                "pr": "isant",
                "pp": "is",
                "b": "ire"
            }
        },
        "v109": {
            "ending": "ure",
            "t": {
                "p": ["us","us","ut","uons","uez","uent"],
                "i": ["uais","uais","uait","uions","uiez","uaient"],
                "f": ["urai","uras","ura","urons","urez","uront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["urais","urais","urait","urions","uriez","uraient"],
                "s": ["ue","ues","ue","uions","uiez","uent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"us",null,"uons","uez",null],
                "pr": "uant",
                "pp": "u",
                "b": "ure"
            }
        },
        "v110": {
            "ending": "ure",
            "t": {
                "p": ["us","us","ut","uons","uez","uent"],
                "i": ["uais","uais","uait","uions","uiez","uaient"],
                "f": ["urai","uras","ura","urons","urez","uront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["urais","urais","urait","urions","uriez","uraient"],
                "s": ["ue","ues","ue","uions","uiez","uent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"us",null,"uons","uez",null],
                "pr": "uant",
                "pp": "us",
                "b": "ure"
            }
        },
        "v111": {
            "ending": "re",
            "t": {
                "p": ["s","s","t","sons","sez","sent"],
                "i": ["sais","sais","sait","sions","siez","saient"],
                "f": ["rai","ras","ra","rons","rez","ront"],
                "ps": ["sis","sis","sit","sîmes","sîtes","sirent"],
                "c": ["rais","rais","rait","rions","riez","raient"],
                "s": ["se","ses","se","sions","siez","sent"],
                "si": ["sisse","sisses","sît","sissions","sissiez","sissent"],
                "ip": [null,"s",null,"sons","sez",null],
                "pr": "sant",
                "pp": "",
                "b": "re"
            }
        },
        "v112": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","isons","isez","isent"],
                "i": ["isais","isais","isait","isions","isiez","isaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ise","ises","ise","isions","isiez","isent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"isons","isez",null],
                "pr": "isant",
                "pp": "i",
                "b": "ire"
            }
        },
        "v113": {
            "ending": "re",
            "t": {
                "p": ["s","s","t","sons","sez","sent"],
                "i": ["sais","sais","sait","sions","siez","saient"],
                "f": ["rai","ras","ra","rons","rez","ront"],
                "ps": ["sis","sis","sit","sîmes","sîtes","sirent"],
                "c": ["rais","rais","rait","rions","riez","raient"],
                "s": ["se","ses","se","sions","siez","sent"],
                "si": ["sisse","sisses","sît","sissions","sissiez","sissent"],
                "ip": [null,"s",null,"sons","sez",null],
                "pr": "sant",
                "pp": "t",
                "b": "re"
            }
        },
        "v114": {
            "ending": "re",
            "t": {
                "p": ["s","s","t","vons","vez","vent"],
                "i": ["vais","vais","vait","vions","viez","vaient"],
                "f": ["rai","ras","ra","rons","rez","ront"],
                "ps": ["vis","vis","vit","vîmes","vîtes","virent"],
                "c": ["rais","rais","rait","rions","riez","raient"],
                "s": ["ve","ves","ve","vions","viez","vent"],
                "si": ["visse","visses","vît","vissions","vissiez","vissent"],
                "ip": [null,"s",null,"vons","vez",null],
                "pr": "vant",
                "pp": "t",
                "b": "re"
            }
        },
        "v115": {
            "ending": "oire",
            "t": {
                "p": ["ois","ois","oit","oyons","oyez","oient"],
                "i": ["oyais","oyais","oyait","oyions","oyiez","oyaient"],
                "f": ["oirai","oiras","oira","oirons","oirez","oiront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["oirais","oirais","oirait","oirions","oiriez","oiraient"],
                "s": ["oie","oies","oie","oyions","oyiez","oient"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"ois",null,"oyons","oyez",null],
                "pr": "oyant",
                "pp": "u",
                "b": "oire"
            }
        },
        "v116": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","isons","isez","isent"],
                "i": ["isais","isais","isait","isions","isiez","isaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ise","ises","ise","isions","isiez","isent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"isons","isez",null],
                "pr": "isant",
                "pp": "i",
                "b": "ire"
            }
        },
        "v117": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","isons","ites","isent"],
                "i": ["isais","isais","isait","isions","isiez","isaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ise","ises","ise","isions","isiez","isent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"isons","ites",null],
                "pr": "isant",
                "pp": "it",
                "b": "ire"
            }
        },
        "v118": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","isons","isez","isent"],
                "i": ["isais","isais","isait","isions","isiez","isaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ise","ises","ise","isions","isiez","isent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"isons","isez",null],
                "pr": "isant",
                "pp": "it",
                "b": "ire"
            }
        },
        "v119": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","isons","isez","isent"],
                "i": ["isais","isais","isait","isions","isiez","isaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ise","ises","ise","isions","isiez","isent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"is",null,"isons","isez",null],
                "pr": "isant",
                "pp": "it",
                "b": "ire"
            }
        },
        "v120": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","isons","isez","isent"],
                "i": ["isais","isais","isait","isions","isiez","isaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ise","ises","ise","isions","isiez","isent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"is",null,"isons","isez",null],
                "pr": "isant",
                "pp": "u",
                "b": "ire"
            }
        },
        "v121": {
            "ending": "oire",
            "t": {
                "p": ["ois","ois","oit","uvons","uvez","oivent"],
                "i": ["uvais","uvais","uvait","uvions","uviez","uvaient"],
                "f": ["oirai","oiras","oira","oirons","oirez","oiront"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["oirais","oirais","oirait","oirions","oiriez","oiraient"],
                "s": ["oive","oives","oive","uvions","uviez","oivent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"ois",null,"uvons","uvez",null],
                "pr": "uvant",
                "pp": "u",
                "b": "oire"
            }
        },
        "v122": {
            "ending": "aire",
            "t": {
                "p": ["ais","ais","ait","aisons","aisez","aisent"],
                "i": ["aisais","aisais","aisait","aisions","aisiez","aisaient"],
                "f": ["airai","airas","aira","airons","airez","airont"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["airais","airais","airait","airions","airiez","airaient"],
                "s": ["aise","aises","aise","aisions","aisiez","aisent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"ais",null,"aisons","aisez",null],
                "pr": "aisant",
                "pp": "u",
                "b": "aire"
            }
        },
        "v123": {
            "ending": "aire",
            "t": {
                "p": ["ais","ais","aît","aisons","aisez","aisent"],
                "i": ["aisais","aisais","aisait","aisions","aisiez","aisaient"],
                "f": ["airai","airas","aira","airons","airez","airont"],
                "ps": ["us","us","ut","ûmes","ûtes","urent"],
                "c": ["airais","airais","airait","airions","airiez","airaient"],
                "s": ["aise","aises","aise","aisions","aisiez","aisent"],
                "si": ["usse","usses","ût","ussions","ussiez","ussent"],
                "ip": [null,"ais",null,"aisons","aisez",null],
                "pr": "aisant",
                "pp": "u",
                "b": "aire"
            }
        },
        "v124": {
            "ending": "aire",
            "t": {
                "p": ["ais","ais","ait","aisons","aites","ont"],
                "i": ["aisais","aisais","aisait","aisions","aisiez","aisaient"],
                "f": ["erai","eras","era","erons","erez","eront"],
                "ps": ["is","is","it","îmes","îtes","irent"],
                "c": ["erais","erais","erait","erions","eriez","eraient"],
                "s": ["asse","asses","asse","assions","assiez","assent"],
                "si": ["isse","isses","ît","issions","issiez","issent"],
                "ip": [null,"ais",null,"aisons","aites",null],
                "pr": "aisant",
                "pp": "ait",
                "b": "aire"
            }
        },
        "v125": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","yons","yez","ient"],
                "i": ["yais","yais","yait","yions","yiez","yaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": [null,null,null,null,null,null],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ie","ies","ie","yions","yiez","ient"],
                "si": [null,null,null,null,null,null],
                "ip": [null,"is",null,"yons","yez",null],
                "pr": "yant",
                "pp": "it",
                "b": "ire"
            }
        },
        "v126": {
            "ending": "ire",
            "t": {
                "p": ["is","is","it","yons","yez","ient"],
                "i": ["yais","yais","yait","yions","yiez","yaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": [null,null,null,null,null,null],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ie","ies","ie","yions","yiez","ient"],
                "si": [null,null,null,null,null,null],
                "ip": [null,"is",null,"yons","yez",null],
                "pr": "yant",
                "pp": "it",
                "b": "ire"
            }
        },
        "v127": {
            "ending": "ourdre",
            "t": {
                "p": [null,null,"ourd",null,null,"ourdent"],
                "i": [null,null,"ourdait",null,null,"ourdaient"],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": null,
                "b": "ourdre"
            }
        },
        "v128": {
            "ending": "ore",
            "t": {
                "p": ["os","os","ôt",null,null,"osent"],
                "i": [null,null,null,null,null,null],
                "f": ["orai","oras","ora","orons","orez","oront"],
                "ps": [null,null,null,null,null,null],
                "c": ["orais","orais","orait","orions","oriez","oraient"],
                "s": ["ose","oses","ose","osions","osiez","osent"],
                "si": [null,null,null,null,null,null],
                "ip": [null,"os",null,null,null,null],
                "pr": "osant",
                "pp": "os",
                "b": "ore"
            }
        },
        "v129": {
            "ending": "re",
            "t": {
                "p": ["s","s","t",null,null,"sent"],
                "i": [null,null,null,null,null,null],
                "f": ["rai","ras","ra","rons","rez","ront"],
                "ps": [null,null,null,null,null,null],
                "c": ["rais","rais","rait","rions","riez","raient"],
                "s": ["se","ses","se","sions","siez","sent"],
                "si": [null,null,null,null,null,null],
                "ip": [null,"s",null,null,null,null],
                "pr": "sant",
                "pp": "s",
                "b": "re"
            }
        },
        "v130": {
            "ending": "re",
            "t": {
                "p": [null,null,null,null,null,null],
                "i": [null,null,null,null,null,null],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": "s",
                "b": "re"
            }
        },
        "v131": {
            "ending": "re",
            "t": {
                "p": ["s","s","t",null,null,null],
                "i": [null,null,null,null,null,null],
                "f": ["rai","ras","ra","rons","rez","ront"],
                "ps": [null,null,null,null,null,null],
                "c": ["rais","rais","rait","rions","riez","raient"],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,"s",null,null,null,null],
                "pr": null,
                "pp": "t",
                "b": "re"
            }
        },
        "v132": {
            "ending": "re",
            "t": {
                "p": [null,null,"t",null,null,"ssent"],
                "i": [null,null,"ssait",null,null,"ssaient"],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,"sse",null,null,"ssent"],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": "ssant",
                "pp": null,
                "b": "re"
            }
        },
        "v133": {
            "ending": "ndre",
            "t": {
                "p": ["ns","ns","nt","gnons","gnez","gnent"],
                "i": ["gnais","gnais","gnait","gnions","gniez","gnaient"],
                "f": ["ndrai","ndras","ndra","ndrons","ndrez","ndront"],
                "ps": ["gnis","gnis","gnit","gnîmes","gnîtes","gnirent"],
                "c": ["ndrais","ndrais","ndrait","ndrions","ndriez","ndraient"],
                "s": ["gne","gnes","gne","gnions","gniez","gnent"],
                "si": ["gnisse","gnisses","gnît","gnissions","gnissiez","gnissent"],
                "ip": [null,"ns",null,"gnons","gnez",null],
                "pr": "gnant",
                "pp": "nt",
                "b": "ndre"
            }
        },
        "v134": {
            "ending": "oyer",
            "t": {
                "p": ["oie","oies","oie","oyons","oyez","oient"],
                "i": ["oyais","oyais","oyait","oyions","oyiez","oyaient"],
                "f": ["errai","erras","erra","errons","errez","erront"],
                "ps": ["oyai","oyas","oya","oyâmes","oyâtes","oyèrent"],
                "c": ["errais","errais","errait","errions","erriez","erraient"],
                "s": ["oie","oies","oie","oyions","oyiez","oient"],
                "si": ["oyasse","oyasses","oyât","oyassions","oyassiez","oyassent"],
                "ip": [null,"oie",null,"oyons","oyez",null],
                "pr": "oyant",
                "pp": "oyé",
                "b": "oyer"
            }
        },
        "v135": {
            "ending": "avoir",
            "t": {
                "p": ["ai","as","a","avons","avez","ont"],
                "i": ["avais","avais","avait","avions","aviez","avaient"],
                "f": ["aurai","auras","aura","aurons","aurez","auront"],
                "ps": ["eus","eus","eut","eûmes","eûtes","eurent"],
                "c": ["aurais","aurais","aurait","aurions","auriez","auraient"],
                "s": ["aie","aies","ait","ayons","ayez","aient"],
                "si": ["eusse","eusses","eût","eussions","eussiez","eussent"],
                "ip": [null,"aie",null,"ayons","ayez",null],
                "pr": "ayant",
                "pp": "eu",
                "b": "avoir"
            }
        },
        "v136": {
            "ending": "être",
            "t": {
                "p": ["suis","es","est","sommes","êtes","sont"],
                "i": ["étais","étais","était","étions","étiez","étaient"],
                "f": ["serai","seras","sera","serons","serez","seront"],
                "ps": ["fus","fus","fut","fûmes","fûtes","furent"],
                "c": ["serais","serais","serait","serions","seriez","seraient"],
                "s": ["sois","sois","soit","soyons","soyez","soient"],
                "si": ["fusse","fusses","fût","fussions","fussiez","fussent"],
                "ip": [null,"sois",null,"soyons","soyez",null],
                "pr": "étant",
                "pp": "été",
                "b": "être"
            }
        },
        "v137": {
            "ending": "aller",
            "t": {
                "p": ["vais","vas","va","allons","allez","vont"],
                "i": ["allais","allais","allait","allions","alliez","allaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["allai","allas","alla","allâmes","allâtes","allèrent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["aille","ailles","aille","allions","alliez","aillent"],
                "si": ["allasse","allasses","allât","allassions","allassiez","allassent"],
                "ip": [null,"va",null,"allons","allez",null],
                "pr": "allant",
                "pp": "allé",
                "b": "aller"
            }
        },
        "v138": {
            "ending": "aroir",
            "t": {
                "p": [null,null,"ert",null,null,null],
                "i": [null,null,null,null,null,null],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": null,
                "b": "aroir"
            }
        },
        "v139": {
            "ending": "loir",
            "t": {
                "p": [null,null,"ut",null,null,null],
                "i": [null,null,null,null,null,null],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": null,
                "b": "loir"
            }
        },
        "v140": {
            "ending": "ravoir",
            "t": {
                "p": [null,null,null,null,null,null],
                "i": [null,null,null,null,null,null],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": null,
                "b": "ravoir"
            }
        },
        "v141": {
            "ending": "er",
            "t": {
                "p": [null,null,null,null,null,null],
                "i": [null,null,null,null,null,null],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": null,
                "b": "er"
            }
        },
        "v142": {
            "ending": "ir",
            "t": {
                "p": [null,null,null,null,null,null],
                "i": [null,null,null,null,null,null],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": "u",
                "b": "ir"
            }
        },
        "v143": {
            "ending": "uïr",
            "t": {
                "p": ["is","is","it","yons","yez","ient"],
                "i": ["yais","yais","yait","yions","yiez","yaient"],
                "f": ["irai","iras","ira","irons","irez","iront"],
                "ps": ["uïs","uïs","uït","uïmes","uïtes","uïrent"],
                "c": ["irais","irais","irait","irions","iriez","iraient"],
                "s": ["ie","ies","ie","yions","yiez","ient"],
                "si": ["uïsse","uïsses","uït","uïssions","uïssiez","uïssent"],
                "ip": [null,"is",null,"yons","yez",null],
                "pr": "yant",
                "pp": "uï",
                "b": "uïr"
            }
        },
        "v144": {
            "ending": "re",
            "t": {
                "p": [null,null,null,null,null,null],
                "i": [null,null,null,null,null,null],
                "f": [null,null,null,null,null,null],
                "ps": [null,null,null,null,null,null],
                "c": [null,null,null,null,null,null],
                "s": [null,null,null,null,null,null],
                "si": [null,null,null,null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": null,
                "pp": "s",
                "b": "re"
            }
        },
        "v145": {
            "ending": "er",
            "t": {
                "p": [null,null,"e",null,null,null],
                "i": [null,null,"ait",null,null,null],
                "f": [null,null,"era",null,null,null],
                "ps": [null,null,"a",null,null,null],
                "c": [null,null,"erait",null,null,null],
                "s": [null,null,"e",null,null,null],
                "si": [null,null,"ât",null,null,null],
                "ip": [null,null,null,null,null,null],
                "pr": "ant",
                "pp": "é",
                "b": "er"
            }
        }
    },
    "compound": {
        "alias": "aux",
        "participle": "pp",
        "aux": {
            "av": "avoir",
            "êt": "être",
            "aê": "avoir"
        },
        "pc": {
            "auxTense": "p",
            "progAuxTense": "i"
        },
        "pq": {
            "auxTense": "i",
            "progAuxTense": "i"
        },
        "spa": {
            "auxTense": "s",
            "progAuxTense": "i"
        },
        "spq": {
            "auxTense": "si",
            "progAuxTense": "i"
        },
        "cp": {
            "auxTense": "c",
            "progAuxTense": "c"
        },
        "fa": {
            "auxTense": "f",
            "progAuxTense": "f"
        }
    },
    "elisionEtre": {
        "verbe": ["en","est","était"],
        "aux": ["a","aura","avait","ait","eût","aurait"],
        "pp": ["été","étés","étées"]
    },
    "declension": {
        "nI": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "","g": "f","n": "s"
            },{
                "val": "","g": "m","n": "p"
            },{
                "val": "","g": "f","n": "p"
            }]
        },
        "n1": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "p"
            }]
        },
        "n2": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "","g": "m","n": "p"
            }]
        },
        "n3": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            }]
        },
        "n4": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "x","g": "m","n": "p"
            }]
        },
        "n5": {
            "ending": "al",
            "declension": [{
                "val": "al","g": "m","n": "s"
            },{
                "val": "aux","g": "m","n": "p"
            }]
        },
        "n6": {
            "ending": "ail",
            "declension": [{
                "val": "ail","g": "m","n": "s"
            },{
                "val": "aux","g": "m","n": "p"
            }]
        },
        "n7": {
            "ending": "ail",
            "declension": [{
                "val": "ail","g": "m","n": "s"
            },{
                "val": "aulx","g": "m","n": "p"
            }]
        },
        "n8": {
            "ending": "aïeul",
            "declension": [{
                "val": "aïeul","g": "m","n": "s"
            },{
                "val": "aïeux","g": "m","n": "p"
            }]
        },
        "n9": {
            "ending": "ciel",
            "declension": [{
                "val": "ciel","g": "m","n": "s"
            },{
                "val": "cieux","g": "m","n": "p"
            }]
        },
        "n10": {
            "ending": "dit",
            "declension": [{
                "val": "dit","g": "m","n": "s"
            },{
                "val": "xdits","g": "m","n": "p"
            }]
        },
        "n11": {
            "ending": "homme",
            "declension": [{
                "val": "homme","g": "m","n": "s"
            },{
                "val": "shommes","g": "m","n": "p"
            }]
        },
        "n12": {
            "ending": "monsieur",
            "declension": [{
                "val": "monsieur","g": "m","n": "s"
            },{
                "val": "messieurs","g": "m","n": "p"
            }]
        },
        "n13": {
            "ending": "monseigneur",
            "declension": [{
                "val": "monseigneur","g": "m","n": "s"
            },{
                "val": "messeigneurs","g": "m","n": "p"
            }]
        },
        "n14": {
            "ending": "oeil",
            "declension": [{
                "val": "oeil","g": "m","n": "s"
            },{
                "val": "yeux","g": "m","n": "p"
            }]
        },
        "n15": {
            "ending": "",
            "declension": [{
                "val": "","g": "f","n": "p"
            }]
        },
        "n16": {
            "ending": "",
            "declension": [{
                "val": "","g": "f","n": "s"
            },{
                "val": "","g": "f","n": "p"
            }]
        },
        "n17": {
            "ending": "",
            "declension": [{
                "val": "","g": "f","n": "s"
            },{
                "val": "s","g": "f","n": "p"
            }]
        },
        "n18": {
            "ending": "",
            "declension": [{
                "val": "","g": "f","n": "s"
            },{
                "val": "x","g": "f","n": "p"
            }]
        },
        "n19": {
            "ending": "madame",
            "declension": [{
                "val": "madame","g": "f","n": "s"
            },{
                "val": "mesdames","g": "f","n": "p"
            }]
        },
        "n20": {
            "ending": "mademoiselle",
            "declension": [{
                "val": "mademoiselle","g": "f","n": "s"
            },{
                "val": "mesdemoiselles","g": "f","n": "p"
            }]
        },
        "n21": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "p"
            },{
                "val": "","g": "f","n": "p"
            }]
        },
        "n22": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "p"
            },{
                "val": "es","g": "f","n": "p"
            }]
        },
        "n23": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "","g": "f","n": "s"
            }]
        },
        "n24": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "","g": "f","n": "s"
            },{
                "val": "","g": "m","n": "p"
            },{
                "val": "","g": "f","n": "p"
            }]
        },
        "n25": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "","g": "f","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            },{
                "val": "s","g": "f","n": "p"
            }]
        },
        "n26": {
            "ending": "s",
            "declension": [{
                "val": "s","g": "m","n": "p"
            },{
                "val": "es","g": "f","n": "p"
            }]
        },
        "n27": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "e","g": "f","n": "s"
            },{
                "val": "","g": "m","n": "p"
            },{
                "val": "es","g": "f","n": "p"
            }]
        },
        "n28": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "e","g": "f","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            },{
                "val": "es","g": "f","n": "p"
            }]
        },
        "n29": {
            "ending": "eau",
            "declension": [{
                "val": "eau","g": "m","n": "s"
            },{
                "val": "elle","g": "f","n": "s"
            },{
                "val": "eaux","g": "m","n": "p"
            },{
                "val": "elles","g": "f","n": "p"
            }]
        },
        "n30": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "de","g": "f","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            },{
                "val": "des","g": "f","n": "p"
            }]
        },
        "n31": {
            "ending": "ou",
            "declension": [{
                "val": "ou","g": "m","n": "s"
            },{
                "val": "olle","g": "f","n": "s"
            },{
                "val": "ous","g": "m","n": "p"
            },{
                "val": "olles","g": "f","n": "p"
            }]
        },
        "n32": {
            "ending": "fou-fou",
            "declension": [{
                "val": "fou-fou","g": "m","n": "s"
            },{
                "val": "fofolle","g": "f","n": "s"
            },{
                "val": "fou-fou","g": "m","n": "p"
            },{
                "val": "fofolles","g": "f","n": "p"
            }]
        },
        "n33": {
            "ending": "ou",
            "declension": [{
                "val": "ou","g": "m","n": "s"
            },{
                "val": "ouse","g": "f","n": "s"
            },{
                "val": "ous","g": "m","n": "p"
            },{
                "val": "ouses","g": "f","n": "p"
            }]
        },
        "n34": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "te","g": "f","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            },{
                "val": "tes","g": "f","n": "p"
            }]
        },
        "n35": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            }]
        },
        "n36": {
            "ending": "",
            "declension": [{
                "val": "","g": "f","n": "s"
            }]
        },
        "n37": {
            "ending": "ec",
            "declension": [{
                "val": "ec","g": "m","n": "s"
            },{
                "val": "èche","g": "f","n": "s"
            },{
                "val": "ecs","g": "m","n": "p"
            },{
                "val": "èches","g": "f","n": "p"
            }]
        },
        "n38": {
            "ending": "ef",
            "declension": [{
                "val": "ef","g": "m","n": "s"
            },{
                "val": "ève","g": "f","n": "s"
            },{
                "val": "efs","g": "m","n": "p"
            },{
                "val": "èves","g": "f","n": "p"
            }]
        },
        "n39": {
            "ending": "er",
            "declension": [{
                "val": "er","g": "m","n": "s"
            },{
                "val": "ère","g": "f","n": "s"
            },{
                "val": "ers","g": "m","n": "p"
            },{
                "val": "ères","g": "f","n": "p"
            }]
        },
        "n40": {
            "ending": "et",
            "declension": [{
                "val": "et","g": "m","n": "s"
            },{
                "val": "ète","g": "f","n": "s"
            },{
                "val": "ets","g": "m","n": "p"
            },{
                "val": "ètes","g": "f","n": "p"
            }]
        },
        "n41": {
            "ending": "ès",
            "declension": [{
                "val": "ès","g": "m","n": "s"
            },{
                "val": "esse","g": "f","n": "s"
            },{
                "val": "ès","g": "m","n": "p"
            },{
                "val": "esses","g": "f","n": "p"
            }]
        },
        "n42": {
            "ending": "ès",
            "declension": [{
                "val": "ès","g": "m","n": "s"
            },{
                "val": "èze","g": "f","n": "s"
            },{
                "val": "ès","g": "m","n": "p"
            },{
                "val": "èzes","g": "f","n": "p"
            }]
        },
        "n43": {
            "ending": "nègre",
            "declension": [{
                "val": "nègre","g": "m","n": "s"
            },{
                "val": "négresse","g": "f","n": "s"
            },{
                "val": "nègres","g": "m","n": "p"
            },{
                "val": "négresses","g": "f","n": "p"
            }]
        },
        "n44": {
            "ending": "ais",
            "declension": [{
                "val": "ais","g": "m","n": "s"
            },{
                "val": "aîche","g": "f","n": "s"
            },{
                "val": "ais","g": "m","n": "p"
            },{
                "val": "aîches","g": "f","n": "p"
            }]
        },
        "n45": {
            "ending": "igu",
            "declension": [{
                "val": "igu","g": "m","n": "s"
            },{
                "val": "iguë","g": "f","n": "s"
            },{
                "val": "igus","g": "m","n": "p"
            },{
                "val": "iguës","g": "f","n": "p"
            }]
        },
        "n46": {
            "ending": "f",
            "declension": [{
                "val": "f","g": "m","n": "s"
            },{
                "val": "ve","g": "f","n": "s"
            },{
                "val": "fs","g": "m","n": "p"
            },{
                "val": "ves","g": "f","n": "p"
            }]
        },
        "n47": {
            "ending": "al",
            "declension": [{
                "val": "al","g": "m","n": "s"
            },{
                "val": "ale","g": "f","n": "s"
            },{
                "val": "aux","g": "m","n": "p"
            },{
                "val": "ales","g": "f","n": "p"
            }]
        },
        "n48": {
            "ending": "l",
            "declension": [{
                "val": "l","g": "m","n": "s"
            },{
                "val": "lle","g": "f","n": "s"
            },{
                "val": "ls","g": "m","n": "p"
            },{
                "val": "lles","g": "f","n": "p"
            }]
        },
        "n49": {
            "ending": "n",
            "declension": [{
                "val": "n","g": "m","n": "s"
            },{
                "val": "nne","g": "f","n": "s"
            },{
                "val": "ns","g": "m","n": "p"
            },{
                "val": "nnes","g": "f","n": "p"
            }]
        },
        "n50": {
            "ending": "s",
            "declension": [{
                "val": "s","g": "m","n": "s"
            },{
                "val": "sse","g": "f","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            },{
                "val": "sses","g": "f","n": "p"
            }]
        },
        "n51": {
            "ending": "t",
            "declension": [{
                "val": "t","g": "m","n": "s"
            },{
                "val": "tte","g": "f","n": "s"
            },{
                "val": "ts","g": "m","n": "p"
            },{
                "val": "ttes","g": "f","n": "p"
            }]
        },
        "n52": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "sse","g": "f","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            },{
                "val": "sses","g": "f","n": "p"
            }]
        },
        "n53": {
            "ending": "x",
            "declension": [{
                "val": "x","g": "m","n": "s"
            },{
                "val": "sse","g": "f","n": "s"
            },{
                "val": "x","g": "m","n": "p"
            },{
                "val": "sses","g": "f","n": "p"
            }]
        },
        "n54": {
            "ending": "x",
            "declension": [{
                "val": "x","g": "m","n": "s"
            },{
                "val": "se","g": "f","n": "s"
            },{
                "val": "x","g": "m","n": "p"
            },{
                "val": "ses","g": "f","n": "p"
            }]
        },
        "n55": {
            "ending": "eur",
            "declension": [{
                "val": "eur","g": "m","n": "s"
            },{
                "val": "euse","g": "f","n": "s"
            },{
                "val": "eurs","g": "m","n": "p"
            },{
                "val": "euses","g": "f","n": "p"
            }]
        },
        "n56": {
            "ending": "eur",
            "declension": [{
                "val": "eur","g": "m","n": "s"
            },{
                "val": "rice","g": "f","n": "s"
            },{
                "val": "eurs","g": "m","n": "p"
            },{
                "val": "rices","g": "f","n": "p"
            }]
        },
        "n57": {
            "ending": "sauveur",
            "declension": [{
                "val": "sauveur","g": "m","n": "s"
            },{
                "val": "salvatrice","g": "f","n": "s"
            },{
                "val": "sauveurs","g": "m","n": "p"
            },{
                "val": "salvatrices","g": "f","n": "p"
            }]
        },
        "n58": {
            "ending": "eur",
            "declension": [{
                "val": "eur","g": "m","n": "s"
            },{
                "val": "eresse","g": "f","n": "s"
            },{
                "val": "eurs","g": "m","n": "p"
            },{
                "val": "eresses","g": "f","n": "p"
            }]
        },
        "n59": {
            "ending": "er",
            "declension": [{
                "val": "er","g": "m","n": "s"
            },{
                "val": "eresse","g": "f","n": "s"
            },{
                "val": "ers","g": "m","n": "p"
            },{
                "val": "eresses","g": "f","n": "p"
            }]
        },
        "n60": {
            "ending": "c",
            "declension": [{
                "val": "c","g": "m","n": "s"
            },{
                "val": "que","g": "f","n": "s"
            },{
                "val": "cs","g": "m","n": "p"
            },{
                "val": "ques","g": "f","n": "p"
            }]
        },
        "n61": {
            "ending": "anc",
            "declension": [{
                "val": "anc","g": "m","n": "s"
            },{
                "val": "anche","g": "f","n": "s"
            },{
                "val": "ancs","g": "m","n": "p"
            },{
                "val": "anches","g": "f","n": "p"
            }]
        },
        "n62": {
            "ending": "duc",
            "declension": [{
                "val": "duc","g": "m","n": "s"
            },{
                "val": "duchesse","g": "f","n": "s"
            },{
                "val": "ducs","g": "m","n": "p"
            },{
                "val": "duchesses","g": "f","n": "p"
            }]
        },
        "n63": {
            "ending": "e",
            "declension": [{
                "val": "e","g": "m","n": "s"
            },{
                "val": "esque","g": "f","n": "s"
            },{
                "val": "es","g": "m","n": "p"
            },{
                "val": "esques","g": "f","n": "p"
            }]
        },
        "n64": {
            "ending": "ong",
            "declension": [{
                "val": "ong","g": "m","n": "s"
            },{
                "val": "ongue","g": "f","n": "s"
            },{
                "val": "ongs","g": "m","n": "p"
            },{
                "val": "ongues","g": "f","n": "p"
            }]
        },
        "n65": {
            "ending": "in",
            "declension": [{
                "val": "in","g": "m","n": "s"
            },{
                "val": "igne","g": "f","n": "s"
            },{
                "val": "ins","g": "m","n": "p"
            },{
                "val": "ignes","g": "f","n": "p"
            }]
        },
        "n66": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "e","g": "f","n": "s"
            }]
        },
        "n67": {
            "ending": "iers",
            "declension": [{
                "val": "iers","g": "m","n": "s"
            },{
                "val": "ierce","g": "f","n": "s"
            },{
                "val": "iers","g": "m","n": "p"
            },{
                "val": "ierces","g": "f","n": "p"
            }]
        },
        "n68": {
            "ending": "ant",
            "declension": [{
                "val": "ant","g": "m","n": "s"
            },{
                "val": "antine","g": "f","n": "s"
            },{
                "val": "ants","g": "m","n": "p"
            },{
                "val": "antines","g": "f","n": "p"
            }]
        },
        "n69": {
            "ending": "ut",
            "declension": [{
                "val": "ut","g": "m","n": "s"
            },{
                "val": "use","g": "f","n": "s"
            },{
                "val": "uts","g": "m","n": "p"
            },{
                "val": "uses","g": "f","n": "p"
            }]
        },
        "n70": {
            "ending": "doux",
            "declension": [{
                "val": "doux","g": "m","n": "s"
            },{
                "val": "douce","g": "f","n": "s"
            },{
                "val": "doux","g": "m","n": "p"
            },{
                "val": "douces","g": "f","n": "p"
            }]
        },
        "n71": {
            "ending": "empereur",
            "declension": [{
                "val": "empereur","g": "m","n": "s"
            },{
                "val": "impératrice","g": "f","n": "s"
            },{
                "val": "empereurs","g": "m","n": "p"
            },{
                "val": "impératrices","g": "f","n": "p"
            }]
        },
        "n72": {
            "ending": "hébreu",
            "declension": [{
                "val": "hébreu","g": "m","n": "s"
            },{
                "val": "hébraïque","g": "f","n": "s"
            },{
                "val": "hébreux","g": "m","n": "p"
            },{
                "val": "hébraïques","g": "f","n": "p"
            }]
        },
        "n73": {
            "ending": "vieux",
            "declension": [{
                "val": "vieux","g": "m","n": "s"
            },{
                "val": "vieille","g": "f","n": "s"
            },{
                "val": "vieux","g": "m","n": "p"
            },{
                "val": "vieilles","g": "f","n": "p"
            },{
                "val": "vieil","g": "m","n": "s"
            }]
        },
        "n74": {
            "ending": "c",
            "declension": [{
                "val": "c","g": "m","n": "s"
            },{
                "val": "cque","g": "f","n": "s"
            },{
                "val": "cs","g": "m","n": "p"
            },{
                "val": "cques","g": "f","n": "p"
            }]
        },
        "n75": {
            "ending": "quelqu'un",
            "declension": [{
                "val": "quelqu'un","g": "m","n": "s"
            },{
                "val": "quelqu'une","g": "f","n": "s"
            },{
                "val": "quelques-uns","g": "m","n": "p"
            },{
                "val": "quelques-unes","g": "f","n": "p"
            }]
        },
        "n76": {
            "ending": "tout",
            "declension": [{
                "val": "tout","g": "m","n": "s"
            },{
                "val": "toute","g": "f","n": "s"
            },{
                "val": "tous","g": "m","n": "p"
            },{
                "val": "toutes","g": "f","n": "p"
            }]
        },
        "n77": {
            "ending": "us",
            "declension": [{
                "val": "us","g": "m","n": "s"
            },{
                "val": "i","g": "m","n": "p"
            }]
        },
        "n78": {
            "ending": "um",
            "declension": [{
                "val": "um","g": "m","n": "s"
            },{
                "val": "a","g": "m","n": "p"
            }]
        },
        "n79": {
            "ending": "um",
            "declension": [{
                "val": "um","g": "m","n": "s"
            },{
                "val": "a","g": "f","n": "s"
            },{
                "val": "a","g": "m","n": "p"
            },{
                "val": "a","g": "f","n": "p"
            }]
        },
        "n80": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "es","g": "m","n": "p"
            }]
        },
        "n81": {
            "ending": "eu",
            "declension": [{
                "val": "eu","g": "m","n": "s"
            },{
                "val": "ei","g": "m","n": "p"
            }]
        },
        "n82": {
            "ending": "man",
            "declension": [{
                "val": "man","g": "m","n": "s"
            },{
                "val": "men","g": "m","n": "p"
            }]
        },
        "n83": {
            "ending": "y",
            "declension": [{
                "val": "y","g": "m","n": "s"
            },{
                "val": "ies","g": "m","n": "p"
            }]
        },
        "n84": {
            "ending": "man",
            "declension": [{
                "val": "man","g": "f","n": "s"
            },{
                "val": "men","g": "f","n": "p"
            }]
        },
        "n85": {
            "ending": "y",
            "declension": [{
                "val": "y","g": "f","n": "s"
            },{
                "val": "ies","g": "f","n": "p"
            }]
        },
        "n86": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "i","g": "m","n": "p"
            }]
        },
        "n87": {
            "ending": "o",
            "declension": [{
                "val": "o","g": "m","n": "s"
            },{
                "val": "i","g": "m","n": "p"
            }]
        },
        "n88": {
            "ending": "o",
            "declension": [{
                "val": "o","g": "m","n": "s"
            },{
                "val": "o","g": "f","n": "s"
            },{
                "val": "i","g": "m","n": "p"
            },{
                "val": "i","g": "f","n": "p"
            }]
        },
        "n89": {
            "ending": "or",
            "declension": [{
                "val": "or","g": "m","n": "s"
            },{
                "val": "ores","g": "m","n": "p"
            }]
        },
        "n90": {
            "ending": "o",
            "declension": [{
                "val": "o","g": "m","n": "s"
            },{
                "val": "a","g": "m","n": "p"
            }]
        },
        "n91": {
            "ending": "o",
            "declension": [{
                "val": "o","g": "m","n": "s"
            },{
                "val": "a","g": "f","n": "s"
            },{
                "val": "a","g": "m","n": "p"
            },{
                "val": "a","g": "f","n": "p"
            }]
        },
        "n92": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "e","g": "m","n": "p"
            }]
        },
        "n93": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "er","g": "m","n": "p"
            }]
        },
        "n94": {
            "ending": "ar",
            "declension": [{
                "val": "ar","g": "m","n": "s"
            },{
                "val": "our","g": "m","n": "p"
            }]
        },
        "n95": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "a","g": "m","n": "p"
            }]
        },
        "n96": {
            "ending": "oy",
            "declension": [{
                "val": "oy","g": "m","n": "s"
            },{
                "val": "oyim","g": "m","n": "p"
            }]
        },
        "n97": {
            "ending": "oï",
            "declension": [{
                "val": "oï","g": "m","n": "s"
            },{
                "val": "oïm","g": "m","n": "p"
            }]
        },
        "n98": {
            "ending": "ai",
            "declension": [{
                "val": "ai","g": "m","n": "s"
            },{
                "val": "ayin","g": "m","n": "p"
            }]
        },
        "n99": {
            "ending": "e",
            "declension": [{
                "val": "e","g": "m","n": "s"
            },{
                "val": "i","g": "m","n": "p"
            }]
        },
        "n100": {
            "ending": "a",
            "declension": [{
                "val": "a","g": "f","n": "s"
            },{
                "val": "ae","g": "f","n": "p"
            }]
        },
        "n101": {
            "ending": "gens",
            "declension": [{
                "val": "gens","g": "f","n": "s"
            },{
                "val": "gentes","g": "f","n": "p"
            }]
        },
        "n102": {
            "ending": "au",
            "declension": [{
                "val": "au","g": "m","n": "s"
            },{
                "val": "aude","g": "f","n": "s"
            },{
                "val": "aux","g": "m","n": "p"
            },{
                "val": "audes","g": "f","n": "p"
            }]
        },
        "n103": {
            "ending": "ète",
            "declension": [{
                "val": "ète","g": "m","n": "s"
            },{
                "val": "étesse","g": "f","n": "s"
            },{
                "val": "ètes","g": "m","n": "p"
            },{
                "val": "étesses","g": "f","n": "p"
            }]
        },
        "n104": {
            "ending": "ain",
            "declension": [{
                "val": "ain","g": "m","n": "s"
            },{
                "val": "ine","g": "f","n": "s"
            },{
                "val": "ains","g": "m","n": "p"
            },{
                "val": "ines","g": "f","n": "p"
            }]
        },
        "n105": {
            "ending": "in",
            "declension": [{
                "val": "in","g": "m","n": "s"
            },{
                "val": "ineresse","g": "f","n": "s"
            },{
                "val": "ins","g": "m","n": "p"
            },{
                "val": "ineresses","g": "f","n": "p"
            }]
        },
        "n106": {
            "ending": "eg",
            "declension": [{
                "val": "eg","g": "m","n": "s"
            },{
                "val": "ègue","g": "f","n": "s"
            },{
                "val": "egs","g": "m","n": "p"
            },{
                "val": "ègues","g": "f","n": "p"
            }]
        },
        "n107": {
            "ending": "targui",
            "declension": [{
                "val": "targui","g": "m","n": "s"
            },{
                "val": "targuia","g": "f","n": "s"
            },{
                "val": "touareg","g": "m","n": "p"
            },{
                "val": "targuiat","g": "f","n": "p"
            }]
        },
        "n108": {
            "ending": "eau",
            "declension": [{
                "val": "eau","g": "m","n": "s"
            },{
                "val": "elle","g": "f","n": "s"
            },{
                "val": "eaux","g": "m","n": "p"
            },{
                "val": "elles","g": "f","n": "p"
            },{
                "val": "el","g": "m","n": "s"
            }]
        },
        "n109": {
            "ending": "ou",
            "declension": [{
                "val": "ou","g": "m","n": "s"
            },{
                "val": "olle","g": "f","n": "s"
            },{
                "val": "ous","g": "m","n": "p"
            },{
                "val": "olles","g": "f","n": "p"
            },{
                "val": "ol","g": "m","n": "s"
            }]
        },
        "pn1": {
            "ending": "je",
            "declension": [{
                "val": "je","g": "x","n": "s","pe": 1
            },{
                "val": "nous","g": "x","n": "p","pe": 1
            },{
                "val": "tu","g": "x","n": "s","pe": 2
            },{
                "val": "vous","g": "x","n": "p","pe": 2
            },{
                "val": "il","g": "m","n": "s","pe": 3
            },{
                "val": "elle","g": "f","n": "s","pe": 3
            },{
                "val": "ils","g": "m","n": "p","pe": 3
            },{
                "val": "elles","g": "f","n": "p","pe": 3
            },{
                "val": "on","g": "m","n": "s","pe": 3
            },{
                "val": "j'","g": "x","n": "s","pe": 1
            }]
        },
        "pn2": {
            "ending": "me",
            "declension": [{
                "val": "me","g": "x","n": "s","pe": 1
            },{
                "val": "nous","g": "x","n": "p","pe": 1
            },{
                "val": "te","g": "x","n": "s","pe": 2
            },{
                "val": "vous","g": "x","n": "p","pe": 2
            },{
                "val": "le","g": "m","n": "s","pe": 3
            },{
                "val": "la","g": "f","n": "s","pe": 3
            },{
                "val": "les","g": "x","n": "p","pe": 3
            },{
                "val": "m'","g": "x","n": "s","pe": 1
            },{
                "val": "t'","g": "x","n": "s","pe": 2
            },{
                "val": "l'","g": "m","n": "s","pe": 3
            },{
                "val": "l'","g": "f","n": "s","pe": 3
            }]
        },
        "pn3": {
            "ending": "me",
            "declension": [{
                "val": "me","g": "x","n": "s","pe": 1
            },{
                "val": "nous","g": "x","n": "p","pe": 1
            },{
                "val": "te","g": "x","n": "s","pe": 2
            },{
                "val": "vous","g": "x","n": "p","pe": 2
            },{
                "val": "lui","g": "x","n": "s","pe": 3
            },{
                "val": "leur","g": "x","n": "p","pe": 3
            },{
                "val": "m'","g": "x","n": "s","pe": 1
            },{
                "val": "t'","g": "x","n": "s","pe": 2
            }]
        },
        "pn4": {
            "ending": "moi",
            "declension": [{
                "val": "moi","g": "x","n": "s","pe": 1
            },{
                "val": "nous","g": "x","n": "p","pe": 1
            },{
                "val": "toi","g": "x","n": "s","pe": 2
            },{
                "val": "vous","g": "x","n": "p","pe": 2
            },{
                "val": "lui","g": "m","n": "s","pe": 3
            },{
                "val": "elle","g": "f","n": "s","pe": 3
            },{
                "val": "eux","g": "m","n": "p","pe": 3
            },{
                "val": "elles","g": "f","n": "p","pe": 3
            }]
        },
        "pn5": {
            "ending": "mézigue",
            "declension": [{
                "val": "mézigue","g": "m","n": "s","pe": 1
            },{
                "val": "mézigues","g": "m","n": "p","pe": 1
            },{
                "val": "tézigue","g": "m","n": "s","pe": 2
            },{
                "val": "tézigues","g": "m","n": "p","pe": 2
            },{
                "val": "sézigue","g": "m","n": "s","pe": 3
            },{
                "val": "sézigues","g": "m","n": "p","pe": 3
            }]
        },
        "pn6": {
            "ending": "me",
            "declension": [{
                "val": "me","g": "x","n": "s","pe": 1
            },{
                "val": "nous","g": "x","n": "p","pe": 1
            },{
                "val": "te","g": "x","n": "s","pe": 2
            },{
                "val": "vous","g": "x","n": "p","pe": 2
            },{
                "val": "se","g": "x","n": "x","pe": 3
            },{
                "val": "m'","g": "x","n": "s","pe": 1
            },{
                "val": "t'","g": "x","n": "s","pe": 2
            },{
                "val": "s'","g": "x","n": "x","pe": 3
            }]
        },
        "pn7": {
            "ending": "moi",
            "declension": [{
                "val": "moi","g": "x","n": "s","pe": 1
            },{
                "val": "nous","g": "x","n": "p","pe": 1
            },{
                "val": "toi","g": "x","n": "s","pe": 2
            },{
                "val": "vous","g": "x","n": "p","pe": 2
            },{
                "val": "soi","g": "x","n": "x","pe": 3
            }]
        },
        "pn8": {
            "ending": "moi-même",
            "declension": [{
                "val": "moi-même","g": "x","n": "s","pe": 1
            },{
                "val": "nous-mêmes","g": "x","n": "p","pe": 1
            },{
                "val": "toi-même","g": "x","n": "s","pe": 2
            },{
                "val": "vous-mêmes","g": "x","n": "p","pe": 2
            },{
                "val": "lui-même","g": "m","n": "s","pe": 3
            },{
                "val": "elle-même","g": "f","n": "s","pe": 3
            },{
                "val": "eux-mêmes","g": "m","n": "p","pe": 3
            },{
                "val": "elles-mêmes","g": "f","n": "p","pe": 3
            }]
        },
        "pn9": {
            "ending": "soi-même",
            "declension": [{
                "val": "soi-même","g": "x","n": "s","pe": 3
            }]
        },
        "pn10": {
            "ending": "en",
            "declension": [{
                "val": "en","g": "x","n": "x"
            }]
        },
        "pn11": {
            "ending": "y",
            "declension": [{
                "val": "y","g": "x","n": "x"
            }]
        },
        "pn12": {
            "ending": "mien",
            "declension": [{
                "val": "mien","g": "m","n": "s","pe": 1
            },{
                "val": "mienne","g": "f","n": "s","pe": 1
            },{
                "val": "miens","g": "m","n": "p","pe": 1
            },{
                "val": "miennes","g": "f","n": "p","pe": 1
            },{
                "val": "tien","g": "m","n": "s","pe": 2
            },{
                "val": "tienne","g": "f","n": "s","pe": 2
            },{
                "val": "tiens","g": "m","n": "p","pe": 2
            },{
                "val": "tiennes","g": "f","n": "p","pe": 2
            },{
                "val": "sien","g": "m","n": "s","pe": 3
            },{
                "val": "sienne","g": "f","n": "s","pe": 3
            },{
                "val": "siens","g": "m","n": "p","pe": 3
            },{
                "val": "siennes","g": "f","n": "p","pe": 3
            }]
        },
        "pn13": {
            "ending": "nôtre",
            "declension": [{
                "val": "nôtre","g": "m","n": "s","pe": 1
            },{
                "val": "nôtre","g": "f","n": "s","pe": 1
            },{
                "val": "nôtres","g": "m","n": "p","pe": 1
            },{
                "val": "nôtres","g": "f","n": "p","pe": 1
            },{
                "val": "vôtre","g": "m","n": "s","pe": 2
            },{
                "val": "vôtre","g": "f","n": "s","pe": 2
            },{
                "val": "vôtres","g": "m","n": "p","pe": 2
            },{
                "val": "vôtres","g": "f","n": "p","pe": 2
            },{
                "val": "leur","g": "m","n": "s","pe": 3
            },{
                "val": "leur","g": "f","n": "s","pe": 3
            },{
                "val": "leurs","g": "m","n": "p","pe": 3
            },{
                "val": "leurs","g": "f","n": "p","pe": 3
            }]
        },
        "pn14": {
            "ending": "ce",
            "declension": [{
                "val": "ce","g": "n","n": "s","pe": 3
            },{
                "val": "c'","g": "n","n": "s","pe": 3
            },{
                "val": "ç'","g": "n","n": "s","pe": 3
            }]
        },
        "pn15": {
            "ending": "celui",
            "declension": [{
                "val": "celui","g": "m","n": "s","pe": 3
            },{
                "val": "celle","g": "f","n": "s","pe": 3
            },{
                "val": "ceux","g": "m","n": "p","pe": 3
            },{
                "val": "celles","g": "f","n": "p","pe": 3
            }]
        },
        "pn16": {
            "ending": "ceci",
            "declension": [{
                "val": "ceci","g": "n","n": "s","pe": 3
            }]
        },
        "pn17": {
            "ending": "celui-ci",
            "declension": [{
                "val": "celui-ci","g": "m","n": "s","pe": 3
            },{
                "val": "celle-ci","g": "f","n": "s","pe": 3
            },{
                "val": "ceux-ci","g": "m","n": "p","pe": 3
            },{
                "val": "celles-ci","g": "f","n": "p","pe": 3
            }]
        },
        "pn18": {
            "ending": "ça",
            "declension": [{
                "val": "ça","g": "n","n": "s","pe": 3
            }]
        },
        "pn19": {
            "ending": "cela",
            "declension": [{
                "val": "cela","g": "n","n": "s","pe": 3
            }]
        },
        "pn20": {
            "ending": "celui-là",
            "declension": [{
                "val": "celui-là","g": "m","n": "s","pe": 3
            },{
                "val": "celle-là","g": "f","n": "s","pe": 3
            },{
                "val": "ceux-là","g": "m","n": "p","pe": 3
            },{
                "val": "celles-là","g": "f","n": "p","pe": 3
            }]
        },
        "pn21": {
            "ending": "qui",
            "declension": [{
                "val": "qui","g": "m","n": "s","pe": 3
            },{
                "val": "qui","g": "f","n": "s","pe": 3
            },{
                "val": "qui","g": "m","n": "p","pe": 3
            },{
                "val": "qui","g": "f","n": "p","pe": 3
            }]
        },
        "pn22": {
            "ending": "que",
            "declension": [{
                "val": "que","g": "m","n": "s"
            },{
                "val": "que","g": "f","n": "s"
            },{
                "val": "que","g": "m","n": "p"
            },{
                "val": "que","g": "f","n": "p"
            },{
                "val": "qu'","g": "m","n": "s"
            },{
                "val": "qu'","g": "f","n": "s"
            },{
                "val": "qu'","g": "m","n": "p"
            },{
                "val": "qu'","g": "f","n": "p"
            }]
        },
        "pn23": {
            "ending": "dont",
            "declension": [{
                "val": "dont","g": "m","n": "s"
            },{
                "val": "dont","g": "f","n": "s"
            },{
                "val": "dont","g": "m","n": "p"
            },{
                "val": "dont","g": "f","n": "p"
            }]
        },
        "pn24": {
            "ending": "lequel",
            "declension": [{
                "val": "lequel","g": "m","n": "s"
            },{
                "val": "laquelle","g": "f","n": "s"
            },{
                "val": "lesquels","g": "m","n": "p"
            },{
                "val": "lesquelles","g": "f","n": "p"
            }]
        },
        "pn25": {
            "ending": "auquel",
            "declension": [{
                "val": "auquel","g": "m","n": "s"
            },{
                "val": "à laquelle","g": "f","n": "s"
            },{
                "val": "auxquels","g": "m","n": "p"
            },{
                "val": "auxquelles","g": "f","n": "p"
            }]
        },
        "pn26": {
            "ending": "duquel",
            "declension": [{
                "val": "duquel","g": "m","n": "s"
            },{
                "val": "de laquelle","g": "f","n": "s"
            },{
                "val": "desquels","g": "m","n": "p"
            },{
                "val": "desquelles","g": "f","n": "p"
            }]
        },
        "pn27": {
            "ending": "où",
            "declension": [{
                "val": "où"
            }]
        },
        "pn28": {
            "ending": "quand",
            "declension": [{
                "val": "quand"
            }]
        },
        "pn29": {
            "ending": "quoi",
            "declension": [{
                "val": "quoi"
            }]
        },
        "pn30": {
            "ending": "qui",
            "declension": [{
                "val": "qui"
            }]
        },
        "pn31": {
            "ending": "que",
            "declension": [{
                "val": "que"
            },{
                "val": "qu'"
            }]
        },
        "pn32": {
            "ending": "comment",
            "declension": [{
                "val": "comment"
            }]
        },
        "pn33": {
            "ending": "combien",
            "declension": [{
                "val": "combien"
            }]
        },
        "pn34": {
            "ending": "pourquoi",
            "declension": [{
                "val": "pourquoi"
            }]
        },
        "pn35": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "le","g": "f","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            },{
                "val": "lles","g": "f","n": "p"
            }]
        },
        "d1": {
            "ending": "le",
            "declension": [{
                "val": "le","g": "m","n": "s"
            },{
                "val": "la","g": "f","n": "s"
            },{
                "val": "les","g": "m","n": "p"
            },{
                "val": "les","g": "f","n": "p"
            },{
                "val": "l'","g": "m","n": "s"
            },{
                "val": "l'","g": "f","n": "s"
            }]
        },
        "d2": {
            "ending": "au",
            "declension": [{
                "val": "au","g": "m","n": "s"
            },{
                "val": "à la","g": "f","n": "s"
            },{
                "val": "aux","g": "m","n": "p"
            },{
                "val": "aux","g": "f","n": "p"
            }]
        },
        "d3": {
            "ending": "du",
            "declension": [{
                "val": "du","g": "m","n": "s"
            },{
                "val": "de la","g": "f","n": "s"
            },{
                "val": "des","g": "m","n": "p"
            },{
                "val": "des","g": "f","n": "p"
            }]
        },
        "d4": {
            "ending": "un",
            "declension": [{
                "val": "un","g": "m","n": "s"
            },{
                "val": "une","g": "f","n": "s"
            },{
                "val": "des","g": "m","n": "p"
            },{
                "val": "des","g": "f","n": "p"
            }]
        },
        "d5": {
            "ending": "mon",
            "declension": [{
                "val": "mon","g": "m","n": "s","pe": 1
            },{
                "val": "ma","g": "f","n": "s","pe": 1
            },{
                "val": "mes","g": "m","n": "p","pe": 1
            },{
                "val": "mes","g": "f","n": "p","pe": 1
            },{
                "val": "ton","g": "m","n": "s","pe": 2
            },{
                "val": "ta","g": "f","n": "s","pe": 2
            },{
                "val": "tes","g": "m","n": "p","pe": 2
            },{
                "val": "tes","g": "f","n": "p","pe": 2
            },{
                "val": "son","g": "m","n": "s","pe": 3
            },{
                "val": "sa","g": "f","n": "s","pe": 3
            },{
                "val": "ses","g": "m","n": "p","pe": 3
            },{
                "val": "ses","g": "f","n": "p","pe": 3
            },{
                "val": "mon","g": "f","n": "s","pe": 1
            },{
                "val": "ton","g": "f","n": "s","pe": 2
            },{
                "val": "son","g": "f","n": "s","pe": 3
            }]
        },
        "d6": {
            "ending": "notre",
            "declension": [{
                "val": "notre","g": "m","n": "s","pe": 1
            },{
                "val": "notre","g": "f","n": "s","pe": 1
            },{
                "val": "nos","g": "m","n": "p","pe": 1
            },{
                "val": "nos","g": "f","n": "p","pe": 1
            },{
                "val": "votre","g": "m","n": "s","pe": 2
            },{
                "val": "votre","g": "f","n": "s","pe": 2
            },{
                "val": "vos","g": "m","n": "p","pe": 2
            },{
                "val": "vos","g": "f","n": "p","pe": 2
            },{
                "val": "leur","g": "m","n": "s","pe": 3
            },{
                "val": "leur","g": "f","n": "s","pe": 3
            },{
                "val": "leurs","g": "m","n": "p","pe": 3
            },{
                "val": "leurs","g": "f","n": "p","pe": 3
            }]
        },
        "d7": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "tte","g": "f","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            },{
                "val": "s","g": "f","n": "p"
            },{
                "val": "t","g": "m","n": "s"
            }]
        },
        "d8": {
            "ending": "",
            "declension": [{
                "val": "","g": "m","n": "s"
            },{
                "val": "le","g": "f","n": "s"
            },{
                "val": "s","g": "m","n": "p"
            },{
                "val": "les","g": "f","n": "p"
            }]
        }
    },
    "punctuation": {
        "pc1": {
            "b": "",
            "a": ""
        },
        "pc2": {
            "b": " ",
            "a": " "
        },
        "pc3": {
            "b": " ",
            "a": ""
        },
        "pc4": {
            "b": "",
            "a": " "
        },
        "pc5": {
            "b": " ",
            "a": "",
            "pos": "l"
        },
        "pc6": {
            "b": "",
            "a": " ",
            "pos": "r"
        },
        "pc7": {
            "b": " ",
            "a": " ",
            "pos": "l"
        },
        "pc8": {
            "b": " ",
            "a": " ",
            "pos": "r"
        }
    },
    "sentence_type": {
        "exc": {
            "type": "exclamative",
            "punctuation": "!"
        },
        "int": {
            "type": "interrogative",
            "punctuation": "?",
            "prefix": {
                "base": "est-ce que",
                "yon": "est-ce que",
                "wos": "qui est-ce qui",
                "wod": "qui est-ce que",
                "woi": "à qui est-ce que",
                "wad": "qu'est-ce que",
                "whe": "où est-ce que",
                "how": "comment est-ce que",
                "muc": "combien"
            }
        },
        "dec": {
            "type": "declarative",
            "punctuation": "."
        }
    },
    "propositional": {
        "base": "que",
        "subject": "qui",
        "pronoun": {
            "alias": "pro",
            "type": "Pro"
        },
        "cdInfo": {
            "alias": "cdInfo"
        }
    },
    "regular": {
        "av": {
            "ending": "",
            "option": [{
                "val": ""
            }]
        },
        "ave": {
            "ending": "e",
            "option": [{
                "val": "e"
            },{
                "val": "'"
            }]
        },
        "pp": {
            "ending": "",
            "option": [{
                "val": ""
            }]
        },
        "ppe": {
            "ending": "e",
            "option": [{
                "val": "e"
            },{
                "val": "'"
            }]
        }
    },
    "verb_option": {
        "neg": {
            "prep1": "ne",
            "prep2": "pas",
            "autres": ["pas","jamais","plus","guère","nullement","rien","que"]
        },
        "prog": {
            "aux": "être",
            "keyword": "en train de"
        }
    },
    "usePronoun": {
        "S": "je",
        "VP": "le",
        "PP": "moi",
        "Pro": "moi"
    },
    "date": {
        "format": {
            "non_natural": {
                "year-month-date-day": "[d]\/[m]\/[Y]",
                "year-month-date": "[d]\/[m]\/[Y]",
                "year-month": "[m]\/[Y]",
                "month-date": "[d]\/[m]",
                "month-date-day": "[d]\/[m]",
                "year": "[Y]",
                "month": "[m]",
                "date": "[d]",
                "day": "[d]",
                "hour:minute:second": "[H]:[i]:[s]",
                "hour:minute": "[H]:[i]",
                "minute:second": "[i]:[s]",
                "hour": "[H]",
                "minute": "[i]",
                "second": "[s]"
            },
            "natural": {
                "year-month-date-day": "le [l] [j] [F] [Y]",
                "year-month-date": "le [j] [F] [Y]",
                "year-month": "en [F] [Y]",
                "month-date": "le [j] [F]",
                "month-date-day": "le [l] [j] [F]",
                "year": "en [Y]",
                "month": "en [F]",
                "date": "le [j]",
                "day": "le [l]",
                "hour:minute:second": "à [H]h [i]min [s]s",
                "hour:minute": "à [H]h[i]",
                "minute:second": "à [i]min [s]s",
                "hour": "à [H]h",
                "minute": "à [i]min",
                "second": "à [s]s"
            },
            "relative_time": {
                "-": "il y a [x] jours",
                "-6": "[l] dernier",
                "-5": "[l] dernier",
                "-4": "[l] dernier",
                "-3": "[l] dernier",
                "-2": "avant-hier",
                "-1": "hier",
                "0": "aujourd'hui",
                "1": "demain",
                "2": "après-demain",
                "3": "[l] prochain",
                "4": "[l] prochain",
                "5": "[l] prochain",
                "6": "[l] prochain",
                "+": "dans [x] jours"
            }
        },
        "text": {
            "weekday": ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],
            "month": {
                "1": "janvier",
                "2": "février",
                "3": "mars",
                "4": "avril",
                "5": "mai",
                "6": "juin",
                "7": "juillet",
                "8": "août",
                "9": "septembre",
                "10": "octobre",
                "11": "novembre",
                "12": "décembre"
            }
        }
    },
    "number": {
        "symbol": {
            "group": " ",
            "decimal": ","
        },
        "number": ["zéro"]
    },
    "union": "ou"
}



////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// Feature                                                                        //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



var feature = {
    "category": {
        "alias": "c",
        "word": {
            "noun": "N",
            "verb": "V",
            "determiner": "D",
            "pronoun": "Pro",
            "adjective": "A",
            "adverb": "Adv",
            "preposition": "P",
            "conjunction": "C",
            "complementizer": "Com",
            "punctuation": "Pc"
        },
        "phrase": {
            "noun": "NP",
            "verb": "VP",
            "adjective": "AP",
            "adverb": "AdvP",
            "prepositional": "PP",
            "propositional": "SP",
            "coordinated": "CP",
            "sentence": "S"
        }
    },
    "tense": {
        "alias": "t",
        "base": "b",
        "gerund": "g",
        "indicative": {
            "present": "p",
            "imperfect": "i",
            "past": "ps",
            "simple_past": "ps",
            "compound_past": "pc",
            "pluperfect": "pq",
            "simple_future": "f",
            "futur antérieur": "fa"
        },
        "imperative": {
            "present": "ip"
        },
        "conditional": {
            "present": "c",
            "past": "cp"
        },
        "subjunctive": {
            "present": "s",
            "imperfect": "si",
            "past": "spa",
            "pluperfect": "spq"
        },
        "infinitive": {
            "present": "npr",
            "past": "npa",
            "future": "nf"
        },
        "participle": {
            "present": "pr",
            "past": "pp",
            "future": "pf"
        }
    },
    "type": {
        "verb": {
            "alias": "vt"
        },
        "noun": {
            "alias": "nt"
        },
        "pronoun": {
            "alias": "pt",
            "personnal": "p",
            "reflexive": "rx",
            "demonstrative": "d",
            "indefinite": "i",
            "relative": "r",
            "interrogative": "in",
            "existential": "ex",
            "possessive": "po",
            "adverbial": "a"
        }
    },
    "person": {
        "alias": "pe",
        "unapplicable": null,
        "unspecified": "x",
        "p1": 1,
        "p2": 2,
        "p3": 3
    },
    "gender": {
        "alias": "g",
        "unapplicable": null,
        "unspecified": "x",
        "masculine": "m",
        "feminine": "f",
        "neuter": "n",
        "either": "x"
    },
    "number": {
        "alias": "n",
        "unapplicable": null,
        "unspecified": "x",
        "singular": "s",
        "plural": "p",
        "either": "x"
    },
    "owner": {
        "alias": "own",
        "singular": "s",
        "plural": "p",
        "either": "x"
    },
    "form": {
        "alias": "f",
        "comparative": "co",
        "superlative": "su"
    },
    "antepose": {
        "alias": "pos",
        "default": "post",
        "before": "pre",
        "after": "post"
    },
    "typography": {
        "alias": "typo",
        "ucfist": "ucf",
        "before": "b",
        "after": "a",
        "surround": "sur",
        "position": {
            "alias": "pos",
            "left": "l",
            "right": "r"
        },
        "complementary": "compl"
    },
    "sentence_type": {
        "alias": "typ",
        "declarative": "dec",
        "exclamative": "exc",
        "interrogative": "int",
        "context_wise": ["dec","exc","int"],
        "interro_prefix": {
            "default": "base",
            "yesOrNo": "yon",
            "whoSubject": "wos",
            "whoDirect": "wod",
            "whoIndirect": "woi",
            "whatDirect": "wad",
            "where": "whe",
            "how": "how",
            "howMuch": "muc"
        }
    },
    "verb_option": {
        "alias": "vOpt",
        "negation": "neg",
        "passive": "pas",
        "progressive": "prog",
        "perfect": "perf"
    },
    "cdInfo": {
        "alias": "cdInfo"
    },
    "liaison": {
        "alias": "lier"
    },
    "toPronoun": {
        "alias": "toPro"
    },
    "html": {
        "alias": "html",
        "element": "elt",
        "attribute": "attr"
    },
    "phonetic": {
        "alias": "phon",
        "elision": "ev",
        "hVoyelle": "hAn"
    },
    "date": {
        "alias": "DT"
    },
    "numerical": {
        "alias": "NO"
    },
    "display_option": {
        "alias": "dOpt",
        "raw": "raw",
        "max_precision": "mprecision",
        "natural": "nat",
        "year": "year",
        "month": "month",
        "date": "date",
        "day": "day",
        "hour": "hour",
        "minute": "minute",
        "second": "second",
        "relative_time": "rtime",
        "determiner": "det",
        "natural_language": "nl"
    }
}




////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// JSrealB loader    Fr                                                           //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
    

var language = "fr";
try{
    JSrealBResource[language]["lexicon"] = lexiconFr;
    JSrealBResource[language]["rule"] = ruleFr;
    if(typeof JSrealBResource.common.feature !== "undefined")
    {
        JSrealB.init(language, lexiconFr, ruleFr, 
            JSrealBResource.common.feature);
    }
    else{
        JSrealBResource.common.feature = feature;

        JSrealB.init(language, lexiconFr, ruleFr, feature);
    }
    console.log("Langue française chargée.")
}
catch(e){
    console.warn("Error loading JSrealB Fr: "+e)
}


