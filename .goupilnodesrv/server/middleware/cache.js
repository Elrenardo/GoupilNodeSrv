'use strict';
/*
===================================================================
* File name   : cache.js
* Author      : Teysseire Guillaume
* Create At   : 12/08/2016
* Update At   : 
* Description : Création du cache des fichiers cloud
===================================================================
*/
const watch        = global.require('watch');
const compact      = global.service.get('compact');
const mkdirp       = global.require('mkdirp');
const rmdir        = global.service.get('rmdir');
const copyDir      = global.service.get('copyDir');


/* Dossier temporaire du fichier uploadé */
const tmp_upload = global.config.tmp_uploads;
/* Dossier cache cloud */
const tmp_cloud = global.config.tmp_uploads;




module.exports = function( params, next )
{

	/*
	===================================================================
	=
	=  Construction du cache et copie du cloud
	=
	===================================================================
	*/
	function buildCache( callback )
	{
		if( callback == undefined )
			callback = function(){};

		//nettoyage tmp upload
		try{
			//reset uploads
			rmdir( tmp_upload );
			mkdirp( tmp_upload);

			//reset cloud
			rmdir( tmp_cloud );
			mkdirp( tmp_cloud, function()
			{
				copyDir( global.config.path_cloud, global.config.tmp_uploads, function( data, ext, end)
				{
					//On vérifie que compress est actif
					if( global.config.cloud_compact )
					if( ext=='html' || ext=='js' )
						data = compact( data );

					end( data);
				})
				.then(function()
				{
					//END
					callback();
				})
				.catch(function(err){console.log( err );});
			});
			
		}catch(err)
		{
			global.debug('/!\\ NO TMP DIR OUTPUT !');
			global.debug( err );
			//arret serveur
			process.exit();
		};
	}



	/*
	===================================================================
	=
	=  Fonction de modification des clouds
	=
	===================================================================
	*/
	params.refresh_cloud = function()
	{
		//reset cloud + rebuild
		buildCache(function()
		{
			/*let url = relativeURL(global.dirname+global.config.path_cloud);
			f = relativeURL(f);
			let t = f.split( url );
			console.log( t[1] );*/

			//prévenir la modification du fichier
			params.session.sendAll('cloud:upd','reload');
		});
	};
	//global refresh
	global.refresh_cloud = params.refresh_cloud;


	/*
	===================================================================
	=
	=  Detection modification du cache cloud
	=
	===================================================================
	*/
	if( global.config.update_auto_cloud )//si l'update auto est actife
	watch.createMonitor( global.config.path_cloud, function(monitor)
	{
		monitor.on("created", params.refresh_cloud );
		monitor.on("changed", params.refresh_cloud );
		monitor.on("removed", params.refresh_cloud );
	});


	/*
	===================================================================
	=
	=  Création de la zone temp et copie du cloud
	=
	===================================================================
	*/
	buildCache(function()
	{
		//Next
		next();
	});

}