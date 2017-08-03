'use strict';
/*
===================================================================
* File name   : config.js
* Author      : Teysseire Guillaume
* Create At   : 21/11/2016
* Update At   : 
* Description : Paramettre et config de chargement du serveur
              :  global.config.XXXX
===================================================================
*/

module.exports = {
	/*Répertoire app*/
	'path_app' : 'C:/nodejs/goupilnodesrv2/app',

	/*Port utilisé par le serveur*/
	'server_port': 9000,

	/* Mettre à jour automatiquement l'App */
	'update_auto_app':1,

	/* Mettre à jour automatiquement le cloud */
	'update_auto_cloud':1,

	/* Activer le cache du cloud */
	'cloud_cache':1,

	/* Dossier ou ce situe les fichiers de l'application*/
	'path_app'  : 'ctrl',

	/* Dossier ou ce situe les cloud */
	'path_cloud'  : 'cloud',

	/*Dossier d'emplacement des middleware serveur*/
	'path_middleware': 'server/middleware',

	/* ordres de chargements des fichiers middleswares du serveur */
	'middleware'       : [
		'service.js',
		'session.js',
		'ctrl.js',
		'express.js',
		'socketio.js',
		'end.js'
	],

	/* Dossier ou ce citue les fichiers service */
	'path_service'   : 'server/service',

	/* Durée d'une session inactive avant suppression*/
	'session_time'   : 60*15,

	/* Nom du cookie d'identification des sessions */
	'session_cookie_name' : 'GoupilEngine.uid',

	/*Dossier sous surveillance app:reload */
	'watchapp':[
		'ctrl'
	],

	/*Tempory cache*/
	'tmp' : 'tmp/',

	/*Tempory file storage*/
	'tmp_uploads' : 'tmp/uploads',

	/* Limit size fie */
	'tmp_upload_max_size' : 10*1024*1024,

	/*Key SSl private */

	'sslprivatekey' :'ssl/privatekey.pem',
	/*Key SSL certificate */

	'sslcertificate' :'ssl/certificate.pem',
	/*CA Key SSL */
	'sslchaine':'ssl/chaine.pem'
};