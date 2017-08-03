'use strict';
/*
===================================================================
* File name   : compact.js
* Author      : Teysseire Guillaume
* Create At   : 01/08/2016
* Update At   : 
* Description : compacte une chaine de caractére
===================================================================
*/

module.exports = function( input )
{
	let output = input;

	//enlever les tabulations
	output = output.replace(/\t/g, '');
	//On énléve les espaces
	output = output.replace(/( )+/g, ' ');
	output = output.replace(/(\n|\r|(\n\r))( )+/g, '\n\r');

	//enlever HTML commentaire
	output = output.replace(/(<!--)(.*?)(-->)/g,"");//REPLACE <!-- ... -->
	
	output = output.replace(/(\/\*)(.*?)(\*\/)/g,"");// REPLACE /* ... */

	var test = false;
	do{
		output = output.replace(/(\n|\r|(\n\r))(\/\/)(.*?)(\n|\r|(\n\r))/g,""); //REPLACE : // ...
		test = (output == output.replace(/(\n|\r|(\n\r))(\/\/)(.*?)(\n|\r|(\n\r))/g,""));
	}while( test != true );

	output = findCutCom( output );
	output = findCutCom( output );
	output = findCutCom( output );
	output = findCutCom( output );

	//output = output.replace(/(\/\/)(.*?)(\n|\r|(\n\r))/g,""); //REPLACE : // ...

	//enlever les retour ligne
	//output = output.replace(/\n|\r|(\n\r)/g, ' ');

	return output;
};

let compte = 0;
function findCutCom( output )
{
	var buffer = output.slice(compte, output.length );
	var val = buffer.search('//');
	if( val == -1 )
		return output;

	compte = compte+val;

	var copie = buffer.slice(val, buffer.length);
	
	var valstop  = copie.search('">');
	var valend   = copie.search('\n\r');

	if( valstop != -1 )
	if( valstop < valend )
		return output;


	return output.slice( 0, val )+output.slice( val+valend, output.length );

}