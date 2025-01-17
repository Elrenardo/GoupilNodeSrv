'use strict';
/*
===================================================================
* File name   : dirRec.js
* Author      : Teysseire Guillaume
* Create At   : 21/11/2016
* Update At   : 
* Description : Fonction de parcour de dossier réculsif
===================================================================
*/

//dépendence gestion fichier
const fs = require('graceful-fs');//require('fs');
const relativeURL = require( global.dirname+'server/service/relativeURL');


//fonction parcour de fichier récursif
function dirRec(dir, ext )
{
    var results = []
    var list = fs.readdirSync(dir);
    //list.reverse();
    list.forEach(function(file)
    {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory())
        	results = results.concat(dirRec(file, ext ));
        else
        {
            //so on demande que une extension !
            if( ext != undefined )
            {
                let p = file.split('.');
                //verifier si ces bien un fichier JS
                if( p != undefined )
                if( p[ p.length-1 ] == ext)
                    results.push( relativeURL(file) );
            }
            else
        	   results.push(  relativeURL(file) );
        }
    });
    return results;
}

//export
module.exports = dirRec;