const mysql      = global.require('mysql');
const Container  = global.service.get('Container');

let tab_bdd = new Container();


function Database( App )
{
	let bdd = undefined;

	/*
	===================================================================
	=
	=  Connexion BDD
	=
	===================================================================
	*/
	this.connect = function( database )
	{
		//connexion BDD
		bdd = mysql.createConnection( 
		{
		  host     : global.config.bdd_host,
		  port     : global.config.bdd_port,
		  user     : global.config.bdd_user,
		  password : global.config.bdd_password,
		  database : database
		});

		bdd.connect(function(err)
		{
			if (err)
			{
				global.debug('/!\\ Error connecting BDD: ' + err.stack);
				process.exit(2);
			}
			global.debug('Connected BDD as '+database+': ' + bdd.threadId);

			//Deconnexion BDD lors de l'arret du server
			App.useStopSrv(function(config, next)
			{
				//Deconnexion
				bdd.end();
				global.debug('/!\\ Close BDD: '+database);
				next();
			});
		});

		return this;
	}


	/*
	===================================================================
	=
	=  Query
	=
	===================================================================
	*/
	this.query = function( req, tab )
	{
		return new Promise(function( resolve, reject )
		{
			bdd.query( req, tab, function( error, results, fields )
			{
				//error
				if( (error != undefined) )
					reject(error.code);//error
				else
					resolve( results, fields );//ok
			});
		});
	}

	/*
	===================================================================
	=
	=  Mysql DATE
	=
	===================================================================
	*/
	this.buildDateMysql = function( d )
	{
		let date = {};
		if( d == undefined )
			date = new Date();
		else
			date = new Date(d);

		return date.toISOString().substring(0, 19).replace('T', ' ');
	}

	/*
	===================================================================
	=
	=  Convertit un objet en requete SQL
	=
	===================================================================
	*/
	this.buildParamSQL = function( params )
	{
		let para = '';
		let tab = [];
		for( var i in params )
		{
			para += '`'+i+'`=?,';
			tab.push( params[i] );
		}
		para = para.substring(0, para.lastIndexOf(","));

		return {"para":para, "tab":tab };
	}
}



/*=============================================================================================*/
module.exports = function( App )
{
	/*
	===================================================================
	=
	=  Gestionnaire de BDD
	=
	===================================================================
	*/
	App.newBDD = function( database )
	{
		let bdd = new Database(this);
		if( tab_bdd.add( database, bdd ))
		{
			bdd.connect( database );
			return bdd;
		}
		return tab_bdd.get(database);
	}

	/*
	===================================================================
	=
	=  renvoi une BDD
	=
	===================================================================
	*/
	App.getBDD = function( database )
	{
		return tab_bdd.get( database );
	}
}