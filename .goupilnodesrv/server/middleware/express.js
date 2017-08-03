'use strict';
/*
===================================================================
* File name   : express.js
* Author      : Teysseire Guillaume
* Create At   : 23/11/2016
* Update At   : 
* Description : MiddleWares du framework expressJS pour la gestion HTTP
===================================================================
*/
const fs           = global.require('fs');
const http         = global.require('http');
const https        = global.require('https');
const helmet       = global.require('helmet');
const bodyParser   = global.require('body-parser')
const compression  = global.require('compression');
const cookieParser = global.require('cookie-parser');
const express      = global.require('express');
const watch        = global.require('watch');
const multer       = global.require('multer');
const relativeURL  = global.service.get('relativeURL');
const passport     = global.require('passport');
const compact      = global.service.get('compact');
const pathSepDirFile = global.service.get('pathSepDirFile');
const mkdirp       = global.require('mkdirp');
const rmdir        = global.service.get('rmdir');

/* Port HTTTP*/
const port = global.config.server_port;

/* Dossier temporaire du fichier uploadé */
const tmp_upload = global.config.tmp_uploads;
/* Dossier cache cloud */
const tmp_cloud = global.path_app+global.config.tmp+'cloud';

/* Limit max size file upload */
const tmp_upload_size_max = global.config.tmp_upload_max_size;


//nettoyage tmp upload
try{
	//reset uploads
	rmdir( tmp_upload );
	mkdirp( tmp_upload );

	//reset cloud
	rmdir( tmp_cloud );
	
}catch(err)
{
	global.debug('/!\\ NO TMP DIR OUTPUT !');
	global.debug( err );
	//arret serveur
	process.exit();
};


//configuration du stockage de fichier temporaire
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmp_upload);
  },
  filename: function (req, file, cb) {
  	//création memoire buffer
  	let buf = file.originalname.split('.');
    cb(null, Date.now()+'.'+buf[buf.length-1]);
  }
});

//multer de reception des fichiers
const upload = multer({ 'storage': storage, 'limits': { 'fileSize': tmp_upload_size_max } });




module.exports = function( params, next )
{

	var app = express();
	/*
	===================================================================
	=
	=  Configuration de express
	=
	===================================================================
	*/

	//configuration middleware Express
	app.use(compression());//compression gzip/deflate
	app.disable('x-powered-by');//disable fail security !
	app.use(helmet());//protection http
	app.use(cookieParser());//gestion cookies

	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}));
	app.use(bodyParser.json());       // to support JSON-encoded bodies

	//password session
	app.use(passport.initialize());
    app.use(passport.session());



	/*
	===================================================================
	=
	=  Identification automatique a chaque requette du client
	=
	===================================================================
	*/
	app.use(function( req, res, next )
	{
		//gestion automatique de la création de session
		let session_id = params.session.autoSession( req.cookies, function( name, id )
		{
			res.cookie( name, id );
		});
		//stocage session
		req.session = params.session.get( session_id );

		//next middlewares
		next();
	});



	/*
	===================================================================
	=
	=  Création des ctrl dans express
	=
	===================================================================
	*/
	let endExpCtrl = function( req, res, id, end_callback )
	{
		ctrlExpress( req, params.ctrl, id )
		.then(function(rep){
			sendRepExpress( rep, res );
			end_callback();
		})
		.catch(function(rep){
			if( rep == undefined || rep == '' )
				rep = 400;
			//definir un status d'erreur
			res.sendStatus(rep);
			end_callback();
		});
	}

	//création ctrl
	params.ctrl.forEachCtrl(function( id, value )
	{
		let up = value.getFileHttp();
		//Si Ctrl avec upload FILE !
		if( up[0] != undefined )
		{
			let upfile = upload.fields( value.getFileHttp() );
			//request ctrl 
			app.all( '/'+id, function( req, res )
			{
				//upload file
				upfile(req, res,function(err)
				{
					if (err)//error
						res.sendStatus(400);
					else//ok
						endExpCtrl( req, res, id, function()
						{
							//vider le cache
							for( var i in req.files )
							{
								var elem = req.files[i];
								for( var p=0; p<elem.length; p++ )
								{
									var path = elem[p].path;
									if( fs.existsSync(path) )
										fs.unlink( path );
								}
							}
						});
				});
			});
		}
		else//Sinon Ctrl normal
		{
			app.all( '/'+id, function( req, res )
			{
				endExpCtrl( req, res, id, function(){} );
			});	
		}
	});


	/*
	===================================================================
	=
	=  Fonction de modification des clouds
	=
	===================================================================
	*/
	let file_callback = function( f, stat )
	{
		/*let url = relativeURL(global.dirname+global.config.path_cloud);
		f = relativeURL(f);
		let t = f.split( url );
		console.log( t[1] );*/
		params.session.sendAll('cloud:upd','reload');

		//reset cloud
		rmdir( tmp_cloud );
	}


	/*
	===================================================================
	=
	=  Création des cloud dans express
	=
	===================================================================
	*/
	params.ctrl.forEachCloud(function( id, value )
	{
		//app.use( id, express.static( value.getPath() ));
		let i =  id+'/*';
		if( id == '/' )
			i = id+'*';

		//route
		app.use( i, function(req,res,next)
		{
			cloudExpress( req, params.ctrl, id )
			.then(function(rep)
			{
				//On vérifie que le cache est actif
				/*if( global.config.cloud_cache )
				{
					//Verifier l'exstention
					let ext = rep.split('.');
					ext = ext[ ext.length-1 ];

					//Si le fichier n'est pas un fichier texte
					if( ext!='html' && ext!='css' && ext!='js' )
					{
						res.sendFile( rep );
						return;
					}

					//Fichier CACHE
					let p = pathSepDirFile( rep );
					p.dir = p.dir.split( global.path_app.replace(/\\/g,'/') )[1];

					let path = global.path_app+global.config.tmp+p.dir;
					let file = path+'/'+p.file;

					//verifier que le cache existe
					fs.stat( file, function(err, stat)
					{
						//Si CACHE EXISTE 
	    				if(err == null)
	    				{
	    					res.sendFile( file );
	    					return;
	    				}
	    				//Création du cache
						fs.readFile( rep , "utf8", function(err, data)
						{

							//création des répértoire path
							mkdirp( path, function()
							{
								//création du fichier compressé
								fs.writeFile( file, compact( data ),function(err){
									//Envoi du fichier CACHE
									res.sendFile( file );
								});
							});
						});
					});
				}
				else//Envoi du fichier dans le CLOUD*/
					res.sendFile( rep );
			})
			.catch(function(rep){
				next();
			});
		});

		//detection update file
		if( global.config.update_auto_cloud )//si l'update auto est actife
		if( value.getUpdate() )
		watch.createMonitor( value.getPath(), function(monitor)
		{
			monitor.on("created", file_callback);
			monitor.on("changed", file_callback);
			monitor.on("removed", file_callback);
		});

	});



	/*
	===================================================================
	=
	=  Création du serveur HTTPS ou HTTP
	=
	===================================================================
	*/
	let server = undefined;
	let callback = function(){
		global.debug('Server start in '+port);
	};
	try//server HTTPS
	{
		var options = {
		    key : fs.readFileSync( global.config.sslprivatekey ),
		    cert: fs.readFileSync( global.config.sslcertificate ),
		    ca  : fs.readFileSync( global.config.sslchaine ),
		};
		server = https.createServer(options, app).listen(port, callback);
	}
	catch(err)//server HTTP
	{
		server = http.createServer(app);
		server.listen(port,callback);
	}


	/*
	===================================================================
	=
	=  Enregistement
	=
	===================================================================
	*/
	params.server = server;


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
=  fusion des paramettres et appelle du CTRL correspondant
=
===================================================================
*/
function ctrlExpress( req, ctrlApp, name_ctrl )
{
	//créatin d'un paramettre global
	let params   = Object.assign({}, req.body, req.query);//, {'_url':req.params[2]} );

	//compactages des variables files
	if( (params['files'] != undefined) || (req.file != undefined) || (req.files!=undefined) )
	{
		delete params.files;
		params.files = Object.assign({},req.file,req.files, req.body['files'] );
	}


	//convertir string en number
	for( var i in params )
	if( params[i] != undefined )
	if( params[i][0] != undefined )
	if( params[i][0] != '0')
	{
		if( !isNaN(Number(params[i])) ){
			params[i] = Number(params[i]);
		}
	}

	//main controller
	return ctrlApp.ctrlMain( name_ctrl, params, req.session );
}



/*
===================================================================
=
=  gestion appel cloud et de résultat de cloud 
=
===================================================================
*/
function cloudExpress( req, ctrlApp, id )
{
	//main cloud
	return ctrlApp.cloudMain( id, req.params[0], req.session );
}




/*Réposne HTTP standart */
function sendRepExpress( rep, res )
{
	//pas de cache
	res.setHeader('Cache-Control','private, no-cache, no-store, must-revalidate');
	res.setHeader('Expires','-1');
	res.setHeader('Pragma','no-cache');

	if(rep == undefined )
		rep = 'EMPTY';

	switch( typeof(rep) )
	{
		//sinon JSON encode 
		case 'object':
		case 'number':
		case 'boolean':
			res.setHeader('Content-Type', 'application/javascript');
			res.send( JSON.stringify(rep) );
			break;

		//configuration non defini ?
		default:
			res.setHeader('Content-Type', 'text/html');
			res.send(rep);
			break;
	}
}