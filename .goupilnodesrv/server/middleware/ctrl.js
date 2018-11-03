'use strict';
/*
===================================================================
* File name   : ctrl.js
* Author      : Teysseire Guillaume
* Create At   : 23/11/2016
* Update At   : 
* Description : gestion des ctrl et cloud
===================================================================
*/
const MiddleWares = global.service.get('Middlewares');
const Container   = global.service.get('Container');
const dirRec      = global.service.get('dirRec');
const getNameFile = global.service.get('getNameFile');
const relativeURL = global.service.get('relativeURL');
const verifFile   = global.service.get('verifFile');
const fs          = global.require('fs');
const watch       = global.require('watch');
const task_cron   = global.require('node-cron');
const cmd         = global.require('node-cmd');


//Definition des class cloud et ctrl
const CloudMain   = require('../src/CloudMain.js');
const CtrlMain    = require('../src/CtrlMain.js');

//config Midllewares ctrl
const mw_ctrl_config = require( '../src/ctrl_fw.js');



//Conteneur des cloud et ctrl
var ctrl      = new Container();
var cloud     = new Container();

//App
let ctrlApp = undefined;

//Session
let session = undefined;


//Fonction d'éxécution d'un ctrl
let execCtrl = function( name, params, session )
{
	return new Promise(function( resolve, reject)
	{
		let config = {};
		config.name         = name;
		config.params       = params;
		config.session      = session;
		config.win_callback = resolve;
		config.err_callback = reject;

		if( ctrl.isset( name ) )
		{
			config.ctrl = ctrl.get( name );

			config.ctrl.app = ctrlApp;

			//configuration du middleware ctrl
			let ctrl_fw = new MiddleWares();
			mw_ctrl_config( ctrl_fw );//build middleware
			ctrl_fw.liste_ctrl = ctrl;
			ctrl_fw.liste_session = session;

			return ctrl_fw.run( config );
		}
		//sinon
		reject(404);
	});
}


//Fonction d'éxécution d'un cloud
let execCloud = function( name, file, session )
{
	return new Promise(function(resolve, reject)
	{
		if( cloud.isset( name ) )
		{
			let cloud_exec = cloud.get( name );
			
			//verification auth
			if( !cloud_exec.verifGrp( session.grp) )
				return reject(403);

			//ajout du fichier en paramettre
			let filename = cloud_exec.getPath();
			if( file != undefined )
				filename += '/'+file;

			//chercher un fichier
			verifFile( filename )
			.then(function(file){
				resolve( file );
			})
			//fichier existe pas alors on test le dossier !
			.catch(function(err){
				//verifier si c'est un dossier
				verifFile( filename+'/index.html' )
				.then(function(file){
					//ok c'était un dossier
					resolve( file );
				})
				//fichier existe pas alors on test le dossier !
				.catch(function(err){
					//élement introuvable !
					reject(404);
				});
			});
		}
	});
}


/*
===================================================================
=
=  Modules
=
===================================================================
*/
module.exports = function( params, next )
{
	session = params.session;


	ctrlApp = new CtrlApp( session );


	/*
	===================================================================
	=
	=  Chargement des Controllers
	=
	===================================================================
	*/
	//lister les fichiers
	try{
		//Ficher ctrl Main server
		let tab_ctrl = dirRec( global.dirname+'ctrl', 'js');
		//fichier ctrl App
		tab_ctrl = tab_ctrl.concat( dirRec( global.config.path_app, 'js') );

		//inclure les controllers
		//parcourir les fichier
		for(var i= 0; i < tab_ctrl.length; i++)
		{
			let buffer = tab_ctrl[i];

			//nom du fichier
			let name = getNameFile( buffer );
			//contenu du fichier
			let ctrl = require( buffer );

			//vérifier le ctrl
			if( (ctrl!=undefined) && (typeof(ctrl)=='function') )
				ctrl( ctrlApp );
			else
				global.debug('Ctrl error: "'+name+'" not compatible !');
		}
	}catch(err){
		global.debug('/!\\ Error: '+global.config.path_app+' lost !');
		global.debug( err );
	}


	/*
	===================================================================
	=
	=  Surveiller la modifiation des fichier ctrl
	=
	===================================================================
	*/
	let file_callback = function( f, stat )
	{
		//changement programme ctrl => arret !
		global.debug('/!\\ Fichier CTRL update !');
		process.exit();
	}
	
	//si l'update auto est actif
	if( global.config.update_auto_app )
	for( var i=0; i<global.config.watchapp.length; i++ )
	{
		let file = global.config.watchapp[ i ];
		watch.createMonitor( file, function(monitor)
		{
			monitor.on("created", file_callback);
			monitor.on("changed", file_callback);
			monitor.on("removed", file_callback);
		});
	}

	/*
	===================================================================
	=
	=  Enregistement des ctrl
	=
	===================================================================
	*/
	params.ctrl = ctrlApp;


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
=  Gestionnaire principale App
=
===================================================================
*/
function CtrlApp( liste_session )
{

	/* nouveaux controller */
	this.newCtrl = function( name, callback )
	{
		let buffer = new CtrlMain( name, callback );
		ctrl.add( name, buffer );
		global.debug('Ctrl add: '+name );

		return buffer;
	}


	/* nouveaux controller sans duplication */
	this.newCtrlUpd = function( name, callback )
	{
		let buffer = new CtrlMain( name, callback );
		ctrl.add( name, buffer );
		global.debug('Ctrl Upd add: '+name );

		return buffer.noDuplicate();
	}


	/* Nouveau Cloud */
	this.newCloud = function( name, path )
	{
		if( global.config.cloud_cache )
			path = global.config.tmp_uploads+path;//Cache tmp fichier !
		else
			path = global.config.path_cloud+path;//Cache cloud direct

		path = relativeURL(path);

		let buffer = new CloudMain( name, path );
		cloud.add( name, buffer );
		global.debug('Drive add: '+name+ ' => '+path );
		return buffer;
	}


	/* Nouveau Storage */
	this.newStorage = function( name, path )
	{
		path = global.config.path_storage+path;//Cache fichier !
		path = relativeURL(path);

		let buffer = new CloudMain( name, path );
		cloud.add( name, buffer );
		global.debug('Storage drive add: '+name+ ' => '+path );
		return buffer;
	}



	/* get controller */
	this.getCtrl = function( name )
	{
		return ctrl.get( name );
	}


	this.getCloud = function( name )
	{
		return cloud.get( name );
	}



	/* boucler le contenu */
	this.forEachCtrl = function( callback )
	{
		ctrl.forEach( callback );
	}

	this.forEachCloud = function( callback )
	{
		cloud.forEach( callback );
	}

	/*renvoi le nombre d'user connecte*/
	this.getNbUser = function()
	{
		return liste_session.nb();
	}
	/*renvoi la listes des ctrl disponible*/
	this.getAllCtrl = function()
	{
		return ctrl.getAllIndex();
	}



	/*éxécution d'un controller */
	/*this.execCtrl = function( ctrl_name, params, callback )
	{
		//TODO SESSION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		let c = ctrl.get( ctrl_name );
		c.exec( undefined, params, callback );//<=---- ICI SESSION != UNDEFINED 
	}*/

	/*éxécution d'un controller SYS*/
	this.ctrlMain = function( ctrl_name, params, session )
	{
		return execCtrl( ctrl_name, params, session );
	}


	/*execute un cloud SYS*/
	this.cloudMain = function( name, file, session )
	{
		return execCloud( name, file, session );
	}


	/*Ajouter une instruction lors de l'arret du serveur*/
	this.useStopSrv = function( callback )
	{
		global.srvStop.use( callback );
		return this;
	}


	/*Envoyer un message a un groupe*/
	this.sendMsg = function( grp, name, msg )
	{
		liste_session.sendByGrp( name, msg, grp, undefined );
		return this;
	}

	/*Envoyer un message a tout le monde*/
	this.sendAllMsg = function( name, msg )
	{
		liste_session.sendAll( name, msg);
		return this;
	}

	/*Add pattern params */
	this.addParamType = function( name, callback )
	{
		if( global.type_params == undefined )
			global.type_params = {};

		global.type_params[ name ] = callback;
		global.debug('ADD type param: '+name );
	}


	/*DEBUG*/
	this.debug = function( str )
	{
		global.debug( str );
	}


	/* Ajouter une tache Cron global sans user */
	this.newCron = function( str, callback )
	{
		global.debug('Cron add: '+str );

		//verifier la tache cron
		if( !task_cron.validate(str) )
		{
			global.debug('Cron Error syntaxe: '+str );
			return;
		}

		//créer la tache cron
		return task_cron.schedule( str, callback );
	}


	/* Ajouter une tache Cron executer pour tout les membres */
	this.newCronMember = function( str, callback )
	{
		global.debug('Cron member add: '+str );
		
		//verifier la tache cron
		if( !task_cron.validate(str) )
		{
			global.debug('Cron member Error syntaxe: '+str );
			return;
		}

		//créer la tache cron
		let tache = task_cron.schedule( str, function()
		{
			liste_session.forEach(function( name, member )
			{
				callback( member.data );
			});
		});

		//renvoi de la tache
		return tache;
	}

	/*Annuler une tache cron */
	this.cancelCron = function( cron )
	{
		cron.destroy();
	}


	/*Exécuter une commande callback: function(err, data, stderr)*/
	this.cmd = function( str, callback )
	{
		cmd.get( str, callback);
	}


	/*Exécuter un timeOut en millisegonde *1000 */
	this.addTimeOut = function( time, callback )
	{
		return setTimeout( callback , time );
	}

	/*Exécuter un timeOut en millisegonde pour tout les membres *1000 */
	this.addTimeOutMember = function( time, callback )
	{
		return setTimeout( function()
		{
			liste_session.forEach(function( name, member )
			{
				callback( member.data );
			});
		}, time );
	}

	/*Annuler un TimeOut */
	this.stopTimeOut = function( tache )
	{
		clearTimeout( tache );
	}
}
