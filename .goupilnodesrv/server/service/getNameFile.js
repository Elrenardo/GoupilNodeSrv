'use strict';
/*
===================================================================
* File name   : getNameFile.js
* Author      : Teysseire Guillaume
* Create At   : 14/11/2016
* Update At   : 
* Description : renvo le nom d'un fichier a partir d'un path
===================================================================
*/


function getNameFile( file )
{
    let tab = file.split('/');
    return (tab[ tab.length-1 ]).split('.')[0];
}



//export
module.exports = getNameFile;