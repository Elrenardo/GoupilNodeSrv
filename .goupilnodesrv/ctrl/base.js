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



	//ctrl test params 
	App.newCtrl('testParams', function( params, end){
		end( params );
	})
	.addGrp( global.config.grp_admin );



	//Ctrl de reboot manuel
	App.newCtrl('reboot', function(params,end)
	{
		this.reboot();
	})
	.addGrp( global.config.grp_admin )
	.noParams();



	//Ctrl de reboot cloud
	App.newCtrl('rebootCloud', function(params,end)
	{
		this.refreshCloud();
	})
	.addGrp( global.config.grp_admin )
	.noParams();



	//Renvoi la config
	App.newCtrl('config', function(params,end)
	{
		end( global.config );
	})
	.addGrp( global.config.grp_admin )
	.noParams();



	//deconnexion ( exemple )
	/*App.newCtrl('logout', function( params, end)
	{
		while(this.grp.length > 0) {
		    this.grp.pop();
		}
		this.grp.add('PUBLIC');

		this.logout();
		end(true);
	})
	.noParams();*/
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