'use strict';
/*
===================================================================
* File name   : main.js
* Author      : Teysseire Guillaume
* Create At   : 21/11/2016
* Update At   : 
* Description : Fichier de démarrage du serveur à exécuter avec nodeJs
                Activer DEBUG console:   set DEBUG=app:server,-not_this
===================================================================
*/
//NodeJS package
const debug       = require('debug')('app:server');//Active debug: set DEBUG=app:server,-not_this
const cluster     = require('cluster');

//correctif pour les link !
const path = require("path");
__dirname  = path.resolve(".");

/*
===================================================================
=
=  Configuration chargement + global
=
===================================================================
*/
global.debug    = debug;
global.dirname  = __dirname+'/';
global.path_app = undefined;
global.config   = undefined;

/*
===================================================================
=
=  Gestion du cluster maitre
=
===================================================================
*/
if (cluster.isMaster)
{
    //création d'un cluster
    cluster.fork();
    //gestion de l'arret du cluster
    cluster.on('exit', function(deadWorker, code, signal)
    {
    	//arret server en cas de bug majeur !
    	if( code > 1 )
    		process.exit();

        debug('/!\\ REBOOT SERVER /!\\ '+(new Date()) );
        // Restart the worker
        cluster.fork();
    });
}


/*
===================================================================
=
=  Gestion lcuster server
=
===================================================================
*/
if( cluster.isWorker )
{
    /*
    ===================================================================
    =
    =  Build config APP dir ( Main config + app config )
    =
    ===================================================================
    */
    process.argv.forEach( function(val, index)
    {
        let t = val.split('=');
        if( t[0] != undefined )
        if( t[1] != undefined )
        if( t[0] == 'app' )
        {
            global.path_app = t[1]+'/';
            global.config = Object.assign({}, require( global.dirname+'main_config.js'), require( global.path_app+'config.js'));
        }
    });

    global.config.path_app       = global.path_app+global.config.path_app+'/';
    global.config.path_cloud     = global.path_app+global.config.path_cloud+'/';
    global.config.sslprivatekey  = global.path_app+global.config.sslprivatekey;
    global.config.sslcertificate = global.path_app+global.config.sslcertificate;
    global.config.sslchaine      = global.path_app+global.config.sslchaine;
    global.config.tmp_uploads    = global.path_app+global.config.tmp_uploads+'/';
    for( var i in global.config.watchapp ){
        global.config.watchapp[i] = global.path_app+global.config.watchapp[i];
    }
    

    /*
    ===================================================================
    =
    =  Main Middlewares
    =
    ===================================================================
    */
    //GoupilEngine Package
    const MiddleWares = require( global.dirname+global.config.path_service+'/Middlewares.js');
    let app = new MiddleWares();




    /*
    ===================================================================
    =
    =  Middlewares d'arret du serveur
    =
    ===================================================================
    */
    global.srvStop = new MiddleWares();



    /*
    ===================================================================
    =
    =  Event d'arret du serveur
    =
    ===================================================================
    */
    function srvEndMsg(){
        debug("/!\\ server stop !");
        process.exit(); 
    }
    process.on('exit', (code) => {
        debug("/!\\ exit server event !");
        global.srvStop.run('Stop server',function(){
        	process.exit();
        });
    });
    process.on('SIGINT', function()
    {
        debug("/!\\ SIGINT server event !");
        global.srvStop.run('Kill server',srvEndMsg);
        return false;
    });
    process.on('SIGHUP', function()
    {
        debug("/!\\ SIGHUP server event !");
        global.srvStop.run('Kill server',srvEndMsg);
        return false;
    });
    process.on('uncaughtException', function(err)
    {
        debug("/!\\ uncaughtException server event!");
        debug( err );
        global.srvStop.run('Error server',function(){
        	process.exit(2);
        });
    });



    /*
    ===================================================================
    =
    =  Chargementes des Middlewares
    =
    ===================================================================
    */
    let files = global.config.middleware.reverse();
    for( let i in files )
    {
        let file = __dirname+'/'+global.config.path_middleware+'/'+files[i];
        debug('Server Middleware add: '+file );
        app.use(function( params, next )
        {
            require( file )( params, next );
        });
    }


    /*
    ===================================================================
    =
    =  Exécutions des middlewares
    =
    ===================================================================
    */
    app.run();
}