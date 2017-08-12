
let compteur_var = 0;

module.exports = function( App )
{

	App.useStopSrv(function(config, next)
	{
		global.debug('hello world !');
		next();
	});
	App.useStopSrv(function(config, next)
	{
		global.debug('hello world 222!');
		next();
	});

	//ctrl test 1
	let s = App.newCtrl('hello/print', function( params, end){
		this.sess.add('compte',0);

		let compte = this.sess.get('compte');
		compte++;
		this.sess.set('compte', compte );

		end('Valeur de compte: '+compte);
	});


	//ctrl test 0
	App.newCtrl('hello/add', function( params, end){
		console.log( params );
		end('Welcome sur Hello Add !!');
	}).addParam('toto','number');


	//ctrl test params 
	App.newCtrl('test_params', function( params, end){
		console.log( params );
		end( params );
	});





	App.newCtrl('addAdmin',function( params, end)
	{
		this.grp.add('ADMIN');
		end('Admin Add !');
	});

	App.newCtrl('removeAdmin',function( params, end)
	{
		this.grp.remove('ADMIN');
		end('Admin remove !');
	}).addGrp('ADMIN');


	//test variable global
	let c = App.newCtrl('getVarGlobal',function( params, end )
	{
		compteur_var++;
		end( compteur_var );
	});
	//c.addGrp('ADMIN');
	//c.ctrlEnd('getVarGlobal');


	App.newCtrl('resetVarGlobal',function( params, end )
	{
		compteur_var = 0;
		end('reset');
	})
	.addGrp('ADMIN');


	//Ajout cloud principal
	App.newCloud('/', 'index');

	//new cloud test
	App.newCloud('/test','aaa')
	.addGrp('ADMIN');

	//new cloud test
	App.newCloud('/prod','prod');

	//App storage
	App.newStorage('/store','data');



	App.newCtrl('meuh',function( params, end)
	{
		this.sess.meuh = 'Vache !';
		end('meuhlol');
	});
	
	//TODO no rep send !
	
	App.newCtrl('exec',function( params, end)
	{
		this.execCtrl('meuh').then(function(data)
		{
			end(data);
		});
	});

	function reload()
	{
		App.sendAllMsg('test','hello !');
		App.sendMsg('ADMIN','test', 'Hello Admin !');
		setTimeout(reload,3000);
	}
	reload();


	App.newCtrl('upload', function( params, end)
	{
		console.log( params.files );
		this.moveFile( params.files.file[0].path, global.path_app+'toto.jpg' ).then(function(file)
		{
			end(file);
		});
	})
	.addFileHttp('file');


	//tache cron toute les minutes
	App.newCron('* * * * *',function()
	{
		App.debug('Tache Cron run !');
	});

	///Voir tout les membres logé toute les minutes
	App.newCronMember('* * * * *',function(member)
	{
		console.log( member );
	});

	/*Cron Ctrl*/
	App.newCtrl('test_time',function( params, end )
	{
		end(true);
		App.debug('/!\\ ENREGISTREMENT USER TACHE !');
		this.addTimeOut( 1000*30, function()
		{
			App.debug('EXEC: test_time');
		});
	});

}