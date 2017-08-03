
/* GESTION DE CTRL POUR L ENVOI DE NOTIFICATION PUSH MOBILE & PC */
module.exports = function( App )
{
	let server_key = undefined;

	/*
	===================================================================
	=
	= Défini la clef fourni par fcm.googleapis ( FIREBASE )
	=
	===================================================================
	*/
	App.newCtrl('push_setServerKey',function( params, end )
	{
		server_key = params.key;
	})
	.addGrp('PUSH-NOTIF')
	.addParam('key' , 'string');


	/*
	===================================================================
	=
	= Anvoi une notification Push via Firebase
	=
	===================================================================
	*/
	App.newCtrl('push_send',function( params, end )
	{
		//préparation de la commande
		let cmd = 'curl -X POST -H "Authorization: key='+server_key+'" -H "Content-Type: application/json" -d \'{"notification": {"title": "'+params.title+'", "body": "'+params.body+'", "icon": "'+params.icon+'", "click_action": "'+params.url+'"}, "to": "'+params.token+'" }\' "https://fcm.googleapis.com/fcm/send"';
		
		//exécution de la commande
		this.cmd( cmd, function(err, data, stderr)
		{
			end( data );
		});
	})
	.addGrp('PUSH-NOTIF')
	.addParam('token' , 'string')
	.addParam('title' , 'string,0,255')
	.addParam('body' , 'string,0,255')
	.addParam('icon' , 'string,0,255')
	.addParam('url' , 'string,0,255');

};