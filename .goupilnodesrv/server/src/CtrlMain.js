'use strict';
/*
===================================================================
* File name   : CtrlMain.js
* Author      : Teysseire Guillaume
* Create At   : 24/12/2016
* Update At   : 27/01/2017
* Description : class de configuration d'un ctrl
===================================================================
*/
const AuthMain   = global.service.get('AuthMain');
const moveFile   = global.service.get('moveFile');
const objCompare = global.service.get('objCompare');
const cmd        = global.require('node-cmd');


module.exports = function( ctrl_name, ctrl_callback )
{
	let grp       = new AuthMain();

	let params_on   = false;
	let params      = {};
	let para_obli   = Array();
	let para_remove = Array();

	let files     = Array();
	let doublon   = undefined;

	/* Ajouter une authorisation */
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

	/* executer le ctrl*/
	this.exec = function( sess, params, end )
	{
		let obj = this;
		let buffer = {};
		buffer.fonc = ctrl_callback;
		buffer.sess = sess.data;
		buffer.grp  = sess.grp;

		//buffer.ctrl = this;
		buffer.sync = function( only_grp ){
			obj.sync( 1, only_grp );
		};

		//logout
		buffer.logout = function()
		{
			//deconnexion
			sess.logout();
		};
		//execute un ctrl
		buffer.execCtrl = function( ctrl_name, params )
		{
			return obj.app.ctrlMain( ctrl_name, params, sess );
		};
		//modifier le temps d'update de la deco
		buffer.setTimeOut = function( value )
		{
			sess.update_out = value;
		};
		buffer.getTimeOut = function()
		{
			return sess.update+sess.update_out;
		};
		/*Envoyer un message a un groupe*/
		buffer.sendMsg = function( grp, name, msg )
		{
			obj.app.sendMsg( grp, name, msg );
		};
		/*Envoyer un message a tout le monde*/
		buffer.sendAllMsg = function( name, msg )
		{
			obj.app.sendAll( name, msg);
		};
		/*Deplacer un fichier */
		buffer.moveFile = function( tmp_path, target_path )
		{
			return moveFile( tmp_path, target_path );
		}

		/*Executer une fonction en différer sur le temps en millisigonde *1000*/
		buffer.addTimeOut = function( time, callback )
		{
			let tache = setTimeout( callback , time );

			sess.time.push( tache );
			return tache;
		}
		/*Annuler un TimeOut */
		buffer.stopTimeOut = function( tache )
		{
			clearTimeout( tache );
		}

		/*Exécuter une commande callback: function(err, data, stderr)*/
		buffer.cmd = function( str, callback )
		{
			cmd.get( str, callback);
		}

		/*refresh WebApp*/
		buffer.refreshCloud = function()
		{
			global.refresh_cloud();
		}

		/*reboot server*/
		buffer.reboot = function()
		{
			process.exit();
		}

		//vérification des doublons
		if( doublon != undefined )
		{
			if( objCompare( doublon, params) == true )
			{
				end('DUPLICATE REQ');
				return;//Stop exécution
			}
			else
				doublon = params;
		}

		//suppresion des paramettre remove
		let elem = '';
		for( var i=0; i < para_remove.length; i++ )
		{
			elem = para_remove[i];
			params[ elem ] = null;
			delete params[ elem ];
		}

		//execution de la fonction
		buffer.fonc( params, end );
	}

	/* renvoi le nom du ctrl */
	this.getName = function()
	{
		return ctrl_name;
	}

	/*envoyer un paramettre au ctrl */
	this.addParam = function( name, type, callback )
	{
		params_on = true;
		para_obli.push( name );
		params[ name ] = buildParam( name, type, true, callback );
		return this;
	}

	/*envoyer un paramettre facultatif au ctrl */
	this.addParamFac = function( name, type, callback )
	{
		params_on = true;
		params[ name ] = buildParam( name, type, false, callback );
		return this;
	}

	/*envoyer un paramettre obligatoire mais qui sera supprimé avant l'éxécution */
	this.addParamRemove = function( name, type, callback )
	{
		params_on = true;
		para_obli.push( name );
		para_remove.push( name );
		params[ name ] = buildParam( name, type, true, callback );
		return this;
	}

	/*aucun paramettres a passer au ctrl*/
	this.noParams = function()
	{
		params_on = true;
		return this;
	}

	/*ajoute la reception de un fichier*/
	this.addFileHttp = function( name, nb )
	{
		if( nb == undefined  )
			nb = 1;

		files.push({'name':name, 'maxCount':nb });
		return this;
	}
	this.getFileHttp = function()
	{
		return files;
	}

	/*fonction de verification de reception des variables */
	this.verifParams = function( type_params, get_params )
	{
		//si le mode verif params est pas actif
		if( params_on == false )
			return 1;

		let buffer = 0;
		let p      = 0;

		//verifier les paramettres obligatoire
		for( var n=0; n<para_obli.length; n++ )
		if( get_params[ para_obli[n] ] == undefined )
			return 'Param lost: '+para_obli[n];

		//traiter les paramettres
		for( var i in get_params )
		if( i != '_url')//SPECIAL
		if( i != 'files')//SPECIAL FICHIER
		{
			//verifier l'existence du params
			if( params[ i ] == undefined )
				return 'Param not authorised:'+i;

			var value = get_params[i];
			var name  = params[i].type;
			var para  = params[i].params;
			var callb = params[i].callback;

			//verifier le type
			var resu = type_params[ name ]( value, para );

			if( resu != 1 )
				return 'Param: '+i+'['+name+'] => '+resu+': '+typeof(value);


			//callback verif
			if( callb != undefined )
			{
				resu = callb(p);
				if( resu != 1 )
					return resu;
			}
		}
		return 1;
	}


	/*protection contre les doublons*/
	this.noDuplicate = function()
	{
		doublon = {':ini_doublon:':'XxXxX'};//default contenu pour avoir un test toujours faut !
		return this;
	}
};



/* constructions des paramettres */
function buildParam( name, type, obli, callback )
{
	let buffer = {};
	buffer.name = name;
	buffer.obli = obli;

	buffer.min = -1
	buffer.max = -1;

	//calcule size pour le string et number
	let tab = type.split(',');

	//type
	buffer.type  = tab[0];

	tab.shift();
	buffer.params = tab;

	buffer.callback = callback;
	return buffer;
}