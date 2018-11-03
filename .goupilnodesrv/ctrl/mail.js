const nodemailer = require('nodemailer');
let   storage_mail = undefined;

module.exports = function( App )
{

	/*
	===================================================================
	=
	=  login via une addresse mail
	=
	===================================================================
	*/
	App.newCtrl('mail_login',function( params, end )
	{

		//Add groupe mail
		grp.add('MAIL');


	})
	.addParam('host','string')
	.addParam('username','string')
	.addParam('password','string');



	/*
	===================================================================
	=
	=  Envoyer un mail via une addresse 
	=
	===================================================================
	*/
	App.newCtrl('mail_send',function( params, end )
	{

	})
	.addGrp('MAIL')
	.addParam('from','string')
	.addParam('to','string')
	.addParam('subject','string')
	.addParam('body','string');

}