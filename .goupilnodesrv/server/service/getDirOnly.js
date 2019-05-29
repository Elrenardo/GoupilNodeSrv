'use strict';
/*
===================================================================
* File name   : getDirOnly.js
* Author      : Teysseire Guillaume
* Create At   : 14/11/2016
* Update At   : 
* Description : renvoi uniquement les dossiers non recursif
===================================================================
*/

//dépendence gestion fichier
let fs = require('graceful-fs');//require('fs');

function getDirOnly( dir )
{
    var results = []
    var list = fs.readdirSync(dir);
    list.forEach(function(file)
    {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory())
        	results.push(file);
    });
    return results;
}



//export
module.exports = getDirOnly;