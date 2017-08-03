'use strict';
/*
===================================================================
* File name   : CloudMain.js
* Author      : Teysseire Guillaume
* Create At   : 24/12/2016
* Update At   : 
* Description : class de configuration d'un cloud
===================================================================
*/
const AuthMain    = global.service.get('AuthMain');


module.exports = function( cloud_name, cloud_path )
{
	let grp     = new AuthMain();
	let update  = true;

	/* Ajouter un groupe */
	this.addGrp = function( name )
	{
		grp.addAuth( name );
		return this;
	}

	/* supprimer une authorisation */
	this.removeGrp = function( name )
	{
		grp.removeAuth( name );
		return this;
	}

	/* verifie si un ctrl a l'authorisation pour utiliser ce ctrl*/
	this.verifGrp = function( tab_grp )
	{
		return grp.verifAuth( tab_grp );
	}

	/* renvoi le nom du ctrl */
	this.getName = function()
	{
		return ctrl_name;
	}

	this.getPath = function()
	{
		return cloud_path;
	}

	/*desactive l'event de modification*/
	this.noUpdate = function()
	{
		update = false;
		return this;
	}

	this.getUpdate = function()
	{
		return update;
	}
};