'use strict';
/*
===================================================================
* File name   : ctrl_fw.js
* Author      : Teysseire Guillaume
* Create At   : 24/12/2016
* Update At   : 27/01/2017
* Description : configuration du middlewares ctrl_fw
===================================================================
*/
//const MiddleWares = global.service.get('Middlewares');
const timestamp   = global.service.get('timestamp');


//let ctrl_fw = new MiddleWares();

module.exports = function( ctrl_fw )
{
	/*
	===================================================================
	=
	=  3: éxcution du ctrl
	=
	===================================================================
	*/
	ctrl_fw.use(function(config, next)
	{
		config.ctrl.exec( config.session, config.params, function( rep )
		{
			//update timestamp d'arret
			config.session.update = timestamp();

			//end callback de contacte de réponse ( socket + http )
			if( config.win_callback != undefined )
			{
				try
				{
					config.win_callback( rep );
				}
				catch(error)
				{
					console.log('/!\\ ERROR CTRL EXEC:');
					console.log( error );
				}
			}

			//next middlewares
			next();
		});
	});

	/*
	===================================================================
	=
	=  2: verifier les paramettres
	=
	===================================================================
	*/
	ctrl_fw.use(function(config, next)
	{
		//verifier que les params ne sont pas null
		if( config.params == null )
			config.params = {};

		//verfier les params
		let ret = config.ctrl.verifParams( global.type_params, config.params );

		if( ret == 1 )
			next();//suivant
		else
			if( config.win_callback != undefined )//envoi de l'erreur
				config.win_callback( ret );
	});


	/*
	===================================================================
	=
	=  1: verification des droits d'accés au ctrl
	=
	===================================================================
	*/
	ctrl_fw.use(function(config, next)
	{
		if( config.ctrl.verifGrp( config.session.grp) )
			next();
		else
			if( config.err_callback != undefined )
				config.err_callback(401);
	});



	/*
	===================================================================
	=
	=  0: debug
	=
	===================================================================
	*/
	/*ctrl_fw.use(function(config, next)
	{
		global.debug('-------------- DEBUG REQ ----------');
		global.debug( config );
		next();
	});*/

};