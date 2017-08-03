'use strict';
/*
===================================================================
* File name   : socketio.js
* Author      : Teysseire Guillaume
* Create At   : 23/11/2016
* Update At   : 
* Description : MiddleWares de gestion du serveur web socket
===================================================================
*/

const sockio     = global.require('socket.io');
const srv_logout = 'srvlogout';



module.exports = function( params, next )
{
	/*
	===================================================================
	=
	=  Ecoute sur le port WebSocket
	=
	===================================================================
	*/
	let io = sockio.listen( params.server );


	/*
	===================================================================
	=
	=  Identification automatique a la connexion du client
	=
	===================================================================
	*/
	io.use(function(socket, next)
	{
		//detection de la session
		let tab_cookies = parseCookie(socket.handshake.headers.cookie);

		//gestion automatique de la création de session
		let session_id = params.session.autoSession( tab_cookies, function( name, id )
		{
			let days = 7;
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000)); // set day value to expiry
			var expires = "; expires="+date.toGMTString();

			socket.handshake.headers.cookie = name+"="+id+expires+"; path=/";
		});
		
		//récupérer la session
		socket.session = params.session.get( session_id );

		//sync callback
		socket.session.sync_callback = function( _name, _rep)
		{
			socket.emit( _name, _rep );
			//io.emit( _name, _rep);
		};
		//logout callback
		socket.session.logout_callback = function( data)
		{
			socket.emit( srv_logout, data );
			socket.disconnect(0);
		}

		//next middlewares...
		next();
	});


	/*
	===================================================================
	=
	= Configurations des socket pour chaque client
	=
	===================================================================
	*/
	io.on('connection', function( socket )
	{
		//deconnexion user
		socket.on('disconnect', function(){
			//socket.session.logout();/!\ NE PAS FERMER LA SESSION !
		});

		//création des socket ctrl
		params.ctrl.forEachCtrl(function( name, ctrl)
		{
			socket.on( name, function( msg )
			{
				/* execution du main ctrl */
				params.ctrl.ctrlMain( name, msg, socket.session )
				.then(function(rep)
				{
					socket.emit( name, rep );
				})
				.catch(function(rep)
				{
					if( rep == undefined || rep == '' )
						rep = 400;

					//global.debug('/!\\ ctrl socket.io error');
					//global.debug( rep );
					socket.emit( name, rep );
				});
			});
		});
	});


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
=  Fonction de parsage des cookies
=
===================================================================
*/
function parseCookie( texte )
{
	//verifier le type
	if( typeof(texte) != 'string')
		return [];

	//si string alors parsé le contenu
	let cookie = {};
	let tab = texte.split('; ');
	for( var i in tab )
	if( tab[i] != undefined )
	if( tab[i].split != undefined )
	{
		let split = tab[i].split('=');
		cookie[ split[0] ] = split[1];
	}

	return cookie;
}