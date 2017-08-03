
/* Gestion communication client/server */
function CtrlSocket( endCallobackLoad )
{
	$(function()
	{
		let socket = io();
		/*sauvegarde socket dans le scope window */
		window.app_socket = socket;

		/*event server logout*/
		socket.on('srvlogout',function(msg)
		{
			console.log('Deconnexion par le server: '+msg);
			document.location.href="/";
		});


		/*event reload HTML*/
		socket.on('cloud:upd',function(msg)
		{
			document.location.href = '/';
		});

		//Charger les ctrls
		$.getJSON("/getAllCtrl", function(data, status)
		{
			for( var i=0; i<data.length; i++)
			{
				let name_ctrl = data[i];
				console.log('CTRL ADD: '+name_ctrl );
				window[ name_ctrl ] = function( params )
				{
					return new Promise(function(resolve,reject)
					{
						$.ajax(
					    {
					        type: 'GET',
					        url: "/"+name_ctrl, params,
					        success: function(data)
					        {
					           	//verifier si c'est du JSON
								if( IsJsonString(data) )
									data = JSON.parse(data);
								//end 
								resolve(data);
					        },
					        error: function(XMLHttpRequest, textStatus, errorThrown)
					        {
					        	console.log('failure !');
					        }
					    });
					});
				};
			}
			//End loading
			endCallobackLoad();
		});
	});
}

//verifier si une chaine peut etre convertie en JSON
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}