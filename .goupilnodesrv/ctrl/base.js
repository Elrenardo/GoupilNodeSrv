//Definir le fuseau horraire de l'APP
//process.env.TZ = 'Europe/Paris';

module.exports = function( App )
{

	/* Ctrl PING-PONG */
	App.newCtrl('ping',function( params, end )
	{
		end('pong');
	})
	.noParams();

	/* Renvoi le nombre d'utilisateur */
	App.newCtrl('getNbUser', function( params, end)
	{
		end( App.getNbUser() );
	})
	.noParams();

	/* Renvoi les droits de l'user */
	App.newCtrl('getGrp', function( params, end )
	{
		end(this.grp);
	})
	.noParams();

	/*Renvoi le timestamp du server*/
	App.newCtrl('time', function( params, end )
	{
		let ts = (new Date().getTime());
		end(ts);
	})
	.noParams();

	/*Renvoi la date serveur format DATETIME*/
	App.newCtrl('date', function( params, end )
	{
		end( (new Date()).toISOString() );
	})
	.noParams();

	/*Renvoi la liste des ctrl */
	App.newCtrl('getAllCtrl', function( params, end )
	{
		end( App.getAllCtrl() );
	})
	.noParams();

	//deconnexion
	App.newCtrl('logout', function( params, end)
	{
		this.logout();
		end(true);
	})
	.noParams();

	//ctrl test params 
	App.newCtrl('testParams', function( params, end){
		end( params );
	});

	//Ctrl de reboot manuel
	App.newCtrl('reboot', function(params,end)
	{
		process.exit();
	})
	.addGrp('ADMIN')
	.noParams();



	/*Type params string*/
	App.addParamType('string',function( value, params)
	{
		//verifier le type
		if( typeof(value) != 'string' )
			return 'bad typeof';

		//params
		let min  = params[0];
		let max  = params[1];
		let size = value.length;

		if( min != undefined )
		{
			if( size < min )
				return 'bad min size';

			if( max != undefined )
			if( size > max)
				return 'bad max size';
		}
		return 1;
	});


	/*Type char */
	App.addParamType('varchar',function( value, params)
	{
		//verifier le type
		if( typeof(value) != 'string' )
			return 'bad typeof';

		if( value.length == 1 )
			return 1;
		return 0;
	});


	/*Type params string*/
	App.addParamType('number',function( value, params)
	{
		//verifier le type
		if( typeof(value) != 'number' )
			return 'bad typeof';

		//params
		let min = params[0];
		let max = params[1];

		if( min != undefined )
		{
			if( value < min )
				return 'bad min size';

			if( max != undefined )
			if( value > max)
				return'bad max size';
		}
		return true;
	});


	/*Type params phone*/
	App.addParamType('phone',function( value, params)
	{
		if( typeof(value) != 'string' )
			return 'bad typeof';

		if( value.length == 0 )
			return true;

		var reg = new RegExp("^0[1-9]([-. ]?[0-9]{2}){4}$");
	    if(reg.test(value))
	    	return true;
	    return false;
	});


	/*Type params phone*/
	App.addParamType('email',function( value, params)
	{
		if( typeof(value) != 'string' )
			return 'bad typeof';

		if( value.length == 0 )
			return true;

		var reg = new RegExp('^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$', 'i');
	    if(reg.test(value))
	    	return true;
	    return false;
	});


	/*Type uuid v4*/
	App.addParamType('uuidv4',function( value, params)
	{
		if( typeof(value) != 'string' )
			return 'bad typeof';

		let tab = value.split('-');

		if( tab.length == 5 )
		if( tab[0].length == 8 )
		if( tab[1].length == 4 )
		if( tab[2].length == 4 )
		if( tab[3].length == 4 )
		if( tab[4].length == 12 )
			return true;
		return ' bad uuidv4';
	});


	/*type date format SQL aaaa-mm-jj*/
	App.addParamType('date',function( value, params)
	{
		if( typeof(value) != 'string' )
			return 'bad typeof';

		let tab = value.split('-');

		if( tab.length == 3 )
			return true;
		return 'bad date';
	});


	/*type date format SQL aaaa-mm-jj hh:mm:ss*/
	App.addParamType('datetime',function( value, params)
	{
		if( typeof(value) != 'string' )
			return 'bad typeof';

		let buf = value.split(' ');
		if( buf.length == 2 )
		{
			let tab = buf[0].split('-');
			if( tab.length == 3 )
			{
				tab = buf[1].split(':');
				if( tab.length == 3 )
					return true;
			}
		}
		return 'bad datetime';
	});


	/*type date format SQL hh:mm:ss*/
	App.addParamType('time',function( value, params)
	{
		if( typeof(value) != 'string' )
			return 'bad typeof';

		let tab = value.split(':');
		if( tab.length == 3 )
			return true;
		return 'bad time';
	});


	/*Type params string ou nombre*/
	App.addParamType('numting',function( value, params)
	{
		if( typeof(value) == 'string' )
			return 1;
		if( typeof(value) == 'number' )
			return 1;

		return 0;
	});


	/*Type bool*/
	App.addParamType('bool',function( value, params)
	{
		if( typeof(value) == 'number' )
		{
			if( value == true )
				return 1;
			if( value == false )
				return 1;
		}
		return 0;
	});


};


//Date format SQL
if ( !Date.prototype.toISOString ) {
  ( function() {
    
    function pad(number) {
      if ( number < 10 ) {
        return '0' + number;
      }
      return number;
    }
 
    Date.prototype.toISOString = function() {
      return this.getUTCFullYear() +
        '-' + pad( this.getUTCMonth() + 1 ) +
        '-' + pad( this.getUTCDate() ) +
        'T' + pad( this.getUTCHours() ) +
        ':' + pad( this.getUTCMinutes() ) +
        ':' + pad( this.getUTCSeconds() ) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };
  
  }() );
}