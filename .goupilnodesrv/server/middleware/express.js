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
const multer       = global.require('multer');
const relativeURL  = global.service.get('relativeURL');
const passport     = global.require('passport');

/* Port HTTTP*/
const port = global.config.server_port;

/* Dossier temporaire du fichier uploadé */
const tmp_upload = global.config.tmp_uploads;
/* Dossier cache cloud */
const tmp_cloud = global.config.tmp_uploads;

/* Limit max size file upload */
const tmp_upload_size_max = global.config.tmp_upload_max_size;


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
				res.sendFile( rep );
			})
			.catch(function(rep){
				next();
			});
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
		    requestCert: false,
    		rejectUnauthorized: false
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
	let buffer = 0;
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
	{
		//test boolean
		if( params[i] == 'true' )
			params[i] = true;
		if( params[i] == 'false' )
			params[i] = false;

		//Si commence pas par un zero
		if( params[i][0] != '0')
		{
			//verfier si la chaine peux etre convertie en nombre
			buffer = Number(params[i]);
			if( !isNaN(buffer))
				params[i] = buffer;
		}
		else
		{
			//special cas si envoi juste du zero
			if( params[i] == '0' )
				params[i] = 0;
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
	//Authorisé les requettes AJAX vers le server
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader("Access-Control-Allow-Headers", "Accept, X-Access-Token, X-Application-Name, X-Request-Sent-Time");
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