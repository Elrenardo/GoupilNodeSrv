
//Ajout Bcrypt pour cryptage password
const bcrypt = global.require('bcrypt');


module.exports = function( App )
{

	/* Hash de password */
	App.passwordHash = function( password )
	{
		return bcrypt.hashSync( password, 10);
	};

	/*Comparaison password et hash*/
	App.passwordHashComp = function( password, hash)
	{
		return bcrypt.compareSync( password, hash);
	};

};