
module.exports = function( App )
{


	/*Type params string*/
	App.addParamType('string',function( input )
	{
		//verifier le type
		if( typeof(input.value) != 'string' )
			return 'bad typeof';

		//params
		let min  = input.params[0];
		let max  = input.params[1];
		let size = input.value.length;

		if( min != undefined )
		{
			if( size < min )
				return 'bad min size';

			if( max != undefined )
			if( size > max)
				return 'bad max size';
		}
		return true;
	});



	/*Type char */
	App.addParamType('varchar',function( input )
	{
		//verifier le type
		if( typeof(input.value) != 'string' )
			return 'bad typeof';

		if( input.value.length == 1 )
			return true;
		return false;
	});



	/*Type params string*/
	App.addParamType('number',function( input )
	{
		//verifier le type
		if( typeof(input.value) != 'number' )
			return 'bad typeof';

		//params
		let min = input.params[0];
		let max = input.params[1];

		if( min != undefined )
		{
			if( input.value < min )
				return 'bad min size';

			if( max != undefined )
			if( input.value > max)
				return'bad max size';
		}
		return true;
	});



	/*Type params phone*/
	App.addParamType('phone',function( input )
	{
		if( typeof(input.value) != 'string' )
			return 'bad typeof';

		if( input.value.length == 0 )
			return true;

		//Mode international
		if( input.value[0] == '+')
		{
			return true;
		}
		//Mode Normal 0XXXXX
		else
		{
			if( input.value.length != 10 )
				return false;

			var reg = new RegExp("^0[1-9]([-. ]?[0-9]{2}){4}$");
		    if(reg.test(input.value))
		    	return true;
		    return false;
		}
	    return false;
	});



	/*Type params phone*/
	App.addParamType('email',function( input )
	{
		if( typeof(input.value) != 'string' )
			return 'bad typeof';

		if( input.value.length == 0 )
			return true;

		var reg = new RegExp('^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$', 'i');
	    if(reg.test(input.value))
	    	return true;
	    return false;
	});



	/*Type uuid v4*/
	App.addParamType('uuidv4',function( input )
	{
		if( typeof(input.value) != 'string' )
			return 'bad typeof';

		let tab = input.value.split('-');

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
	App.addParamType('date',function( input )
	{
		if( typeof(input.value) != 'string' )
			return 'bad typeof';

		let tab = input.value.split('-');

		if( tab.length == 3 )
			return true;
		return 'bad date';
	});



	/*type date format SQL aaaa-mm-jj hh:mm:ss*/
	App.addParamType('datetime',function( input )
	{
		if( typeof(input.value) != 'string' )
			return 'bad typeof';

		let buf = input.value.split(' ');
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
	App.addParamType('time',function( input )
	{
		if( typeof(input.value) != 'string' )
			return 'bad typeof';

		let tab = input.value.split(':');
		if( tab.length == 3 )
			return true;
		return 'bad time';
	});



	/*Type params string ou nombre*/
	App.addParamType('numting',function( input )
	{
		if( typeof(input.value) == 'string' )
			return true;
		if( typeof(input.value) == 'number' )
			return true;

		return false;
	});



	/*Type bool*/
	App.addParamType('bool',function( input )
	{
		if( typeof(input.value) == 'number' )
		{
			if( input.value == true )
				return 1;
			if( input.value == false )
				return 1;
		}
		return 0;
	});



	/*Type login*/
	App.addParamType('login',function( input )
	{
		if( typeof(input.value) == 'string' )
		{
			if( input.value.length > 5 )
				return true;
			return 'too small( 5 min )';
		}
		return false;
	});



	/*Type password (Character + special character + number size 7 min, max 15 )*/
	App.addParamType('password',function( input )
	{
		if( typeof(input.value) == 'string' )
		{
			paswd= /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
			if(input.value.match(paswd))
				return true;
			return 'Error format password';
		}
		return false;
	});
}