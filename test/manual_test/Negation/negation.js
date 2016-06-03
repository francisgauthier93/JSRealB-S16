function addTable(verbe,temps,language){
    // console.log("addTable("+verbe+','+temps+")");
    var $tableau=$("#tableau"+(language=='fr'?"FR":"EN");    // find the table element
    var $row=$("<tr/>");                // create a new row
    for (var t=0;t<temps.length;t++) // fill the title of the table
        $row.append("<th style='padding-top:10px'>"+temps[t][0]+"</th>")
    $tableau.append($row); // add it to the table
    // generate a row for the 6 persons (3 singular and 3 plural)
    for(var n=0;n<2;n++){  // la forme (var n in "sp") ne fonctionne pas car JSrealB a ajouté des choses au prototype de String...
        var nb="sp"[n];
        for(var p=1;p<=3;p++){  
            $row=$("<tr/>");
            for(var t=0;t<temps.length;t++){ // a row at 3 tenses
                var pronom=""+Pro(language=="fr"?"je":"I").pe(p).n(nb).g("f");
                var v=""+V(verbe).t(temps[t][1]).pe(p).n(nb);
                if (temps[t][0].substr(0,10)=="Subjonctif")
                    $row.append("<td style='padding-right:10px'>"+S("que",pronom,v).a(" ")+"</td>");
                else
                    $row.append("<td style='padding-right:10px'>"+S(pronom,v).a(" ")+"</td>");
            }
            $tableau.append($row);
        }
    }
}
