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
	this.SQL_date = function( d )
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
	=  Convertit un objet en requete SQL insert
	=
	===================================================================
	*/
	this.SQL_insert = function( bdd_name, params )
	{
		let para = '';
		let tab = [];
		let val = '';
		for( var i in params )
		{
			para += '`'+i+'`,';
			val += '?,';
			tab.push( params[i] );
		}

		para = para.substring(0, para.lastIndexOf(","));
		val  = val.substring(0, val.lastIndexOf(","));

		return { sql:"INSERT INTO `"+bdd_name+"` ("+para+") VALUES ("+val+")", values:tab };
	}


	/*
	===================================================================
	=
	=  Convertit un objet en requete SQL update
	=
	===================================================================
	*/
	this.SQL_update = function( bdd_name, params )
	{
		let para = '';
		let tab = [];
		for( var i in params )
		{
			para += '`'+i+'`=?,';
			tab.push( params[i] );
		}
		para = para.substring(0, para.lastIndexOf(","));

		return { sql:"UPDATE `"+bdd_name+"` SET "+para+" ", values:tab };
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