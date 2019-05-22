'use strict';
/*
===================================================================
* File name   : session.js
* Author      : Teysseire Guillaume
* Create At   : 23/11/2016
* Update At   : 
* Description : MiddleWares de gestion des sessions utilisateur
===================================================================
*/

const timestamp   = global.service.get('timestamp');
const Container   = global.service.get('Container');
const uuid        = global.require('uuid');

const time_session_out = global.config.session_time;
const cookie_name      = global.config.session_cookie_name;

//listes des sessions
let liste_session = new Container();
let _params = undefined; // buffer de params


/*
===================================================================
=
=  Cookie existe ?
=
===================================================================
*/
liste_session.issetTab = function( tab )
{
	if(tab[ this.cookie_name ] )
		return true;
	return false;
}


/*
===================================================================
=
=  Detecte ou créer automatiqueemnt une session
=
===================================================================
*/
liste_session.autoSession = function( tab_cookie, callback )
{
	//get cookie
	let session_id = tab_cookie[ this.cookie_name ];

	//verifier l'existence du cookie et de la session
	if( session_id == undefined || !this.isset( session_id ) )
	{
		//creation session
		let session = new Container();

		//créer l'ID et verifier ca disponibilité
		do
		{
			session_id   = uuid.v4();
			session.id   = session_id;
			session.name = this.cookie_name;
		}while( liste_session.isset(session_id) ); 

		//Session data
		session.data   = {};

		//Création time out
		session.update     = timestamp();
		session.update_out = time_session_out;

		//Création de la gestion des groupes
		session.grp = new Array('PUBLIC');

		//Time Répétition setTimeOut !
		session.time = new Array();

		//Gestion protection doublon CTRL
		session.doublon = new Array();

		//deconnexion de la session
		session.logout = function()
		{
			this.logout_callback('session.expired');

			//suppresion session
			liste_session.remove( session_id );

			//Arret des setTimeOut
			for( var i=0; i<session.time.length; i++ )
				clearTimeout( session.time[i] );

			//Vider contenu
			this.grp     = new Array('PUBLIC');
			this.data    = {};
			this.doublon = new Array();
		}

		//fonction de callback sync
		session.sync_callback   = function(){};

		//fonction de callback logout
		session.logout_callback = function(){};
		
		//stockage session
		this.add( session_id, session );

		//callback pour creation cookie
		callback( this.cookie_name, session_id );
	}

	//renvoi l'id de session
	return session_id;
};


/*
===================================================================
=
=  Appelle tout les  sync_callback qui ont le groupe authorisation
=
===================================================================
*/
liste_session.sendByAllGrp = function( ctrl_name, rep, transmitter_id )
{
	this.forEach(function(id, sess)
	{
		//verifier l'exitence de la fonction sync
		if( sess.sync_callback != undefined )
		//verifier que on est pas l'emetteur
		if( sess.id != transmitter_id )
		{
			let ctrl = _params.ctrl.getCtrl( ctrl_name );
			if( ctrl == undefined )
				return;

			//verifier les droits d'envoi
			if( ctrl.verifGrp( sess.grp ))
			{
				sess.sync_callback( ctrl_name, rep );
			}

		}
	});
};


/*
===================================================================
=
=  Appelle tout les  sync_callback défini par grp
=
===================================================================
*/
liste_session.sendByGrp = function( ctrl_name, rep, grp, transmitter_id )
{
	this.forEach(function(id, sess)
	{
		//verifier l'exitence de la fonction sync
		if( sess.sync_callback != undefined )
		//verifier que on est pas l'emetteur
		if( sess.id != transmitter_id )
		//verifier que on posséde ce groupe
		if( sess.grp.indexOf( grp ) > -1 )
			sess.sync_callback( ctrl_name, rep );
	});
};



/*
===================================================================
=
=  Envoyer un message a tout le monde
=
===================================================================
*/
liste_session.sendAll = function( name, data )
{
	this.forEach(function(id, sess)
	{
		//verifier l'exitence de la fonction sync
		if( sess.sync_callback != undefined )
			sess.sync_callback( name, data );
	});
}


/*
===================================================================
=
=  Fonction callback de synchronisation
=
===================================================================
*/
liste_session.sync_callback = function(){};


/*
===================================================================
=
=  Fonction callback de deconnexion
=
===================================================================
*/
liste_session.logout_callback = function(){};


/*
===================================================================
=
=  Deconnexion de tout les utilisateurs
=
===================================================================
*/
liste_session.allLogout = function( msg )
{
	this.forEach(function(id, sess)
	{
		sess.logout_callback( msg );
	});
}
//ajout de l'event de deconnexion
global.srvStop.use(function( config, next)
{
	liste_session.allLogout( config );
	next();
});




module.exports = function( params, next )
{
	//pointer !
	_params = params;
	
	/*
	===================================================================
	=
	=  Gestions des sessions
	=
	===================================================================
	*/
	//,om du cooie de la session
	liste_session.cookie_name = cookie_name;

	//lancement de la verification des sessions
	verifsession();


	/*
	===================================================================
	=
	=  Enregistement des sessions
	=
	===================================================================
	*/
	params.session = liste_session;


	/*
	===================================================================
	=
	=  MiddleWares suivant
	=
	===================================================================
	*/
	next();
}




/*
===================================================================
=
=  Fontion de nettoyage de la mémoire des utilisateurs 
=
===================================================================
*/
function verifsession()
{
	//recherche de client à qui le time d'utilisation et trop vieux
	let time_actu = timestamp();
	liste_session.forEach(function( id, value )
	{
		if( value != undefined )
		if( value.update != undefined )
		if( value.update+value.update_out < time_actu )
			value.logout();
	});

	//relancer la fonction
	setTimeout(verifsession, time_session_out*1000);
}



/*
===================================================================
=
=  Ajout de la fonction remove au array de ce fichier
=
===================================================================
*/
Array.prototype.remove = function( name )
{
	var index = this.indexOf( name );
	if (index > -1)
		   this.splice(index, 1);
}


/*
===================================================================
=
= Ajout de la fonction add au array de ce fichier,
= Elle permet un ajout unique dans un array 
=
===================================================================
*/
Array.prototype.add = function( name )
{
	var index = this.indexOf( name );
	if( index === -1 )
		this.push( name );
}
/*
===================================================================
=
= Renvoi si le array contient le contenu du segond
=
===================================================================
*/
Array.prototype.findOf = function( tab )
{
	for( let i=0; i<tab.length; i++ )
	if( this.indexOf( tab[i] ) === -1 )
		return false;
	return true;
}