'use strict';
/*
===================================================================
* File name   : timestamp.js
* Author      : Teysseire Guillaume
* Create At   : 01/08/2017
* Update At   : 
* Description : supprimer un fichier
===================================================================
*/
var fs = global.require('fs');


function deleteFolderRecursive(path)
{
    if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

module.exports = function( path )
{
  deleteFolderRecursive(path);
};