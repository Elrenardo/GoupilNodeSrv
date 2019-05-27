# GoupilNodeSrv
Server NodeJS TempsRéel

<br/><br/><br/>
# Setup Server:
__.goupilnodesrv__ : Contient les fichiers du server et l'application<br/>
__.demo_app__ : Contient une application pour le server.<br/>

Pour lancer le server : 
```
//Activer les DEBUG
set DEBUG=app:server,-not_this

//Lancer le server PATH_APP : Path vers l'application que le server dois lancer
node main.js app=PATH_APP
```

<br/><br/><br/>
# Setup Application : 
__cloud__ : Contient les différents cloud accésible via HTTP.<br/>
__ctrl__ : Contient les Controlleurs et logique métier de l'application.<br/>
__ssl__ : Clef SSL pour le HTTPS.<br/>
__tmp__ : Fichier temporaire généré par le serveur.<br/>
__config.js__ : Contient la configuration de l'application, disponible n'importe ou :
```js
const value = global.config.XXXX;
```


<br/><br/><br/>
# Créer un Controlleur ( dans ./ctrl/ )
Contient les Controlleurs et logique métier de l'application.

exemple.js
```js
//VARIABLE GLOBAL ICI 
module.exports = function( App )
{
  //CONTROLLEUR ICI
}
// FONCTION PROPRE FICHIER
```

Charger des extension NPM du serveur ou SERVICE:
```js
//Charge le programme de création UUID [NPM]
const uuid = global.require('uuid');

//Charge le service pour déplacer des fichiers
const moveFile = global.service.get('moveFile');

module.exports = function( App )
{
  //CONTROLLEUR ICI
}
```
Listes des extensions NPM:
```js
//Génération de UID V1 ou V4
const uuid = global.require('uuid');

//Envoi de mail via Nodemailer
const nodemailer = global.require('nodemailer');

//SQL requette ( Ctrl spécial existe déja dans "ctrl/" )
const mysql = global.require('mysql');

//Cryptage ( exemple: mot de passe )
const bcrypt = global.require('bcrypt');

//Detection changement de fichier 
const watch = global.require('watch');
```

Listes des services :
```js
//Contenaire de stockage
const container = global.service.get('container');

//Charge le service pour déplacer des fichiers
const moveFile = global.service.get('moveFile');

//Copier un fichier
const copyFile = global.service.get('copyFile');

//Lister contenu fichier en recursif
const dirRec = global.service.get('dirRec');

//Supprimer un dossier
const rmdir = global.service.get('rmdir');

//Comparer deux object
const objCompare = global.service.get('objCompare');

//Timestamp en segonde
const timestamp = global.service.get('timestamp');

//Verifier si le fichier existe
const verifFile = global.service.get('verifFile');

```

<br/><br/><br/>
Dans la zone des Controlleur vous pouvez créer appeler plusieurs type de fonction via l'objet __App__ :<br/>

```js
//===================================================================
//Création d'un Controlleur
//===================================================================
App.newCtrl('NAME', function( params, end ) // params: listes des parammettre joins )
{
  //LOGIQUE METIER ICI
  end(true);//Réponse au client ( string, object, array )
})
.noParams(); //Aucun Paramettre à joindre


//===================================================================
//Création d'un cloud
//===================================================================
//Ajouter le fichier index dans le répértoire cloud
App.newCloud('/', 'index');
//Toute les appel HTTP à la racine du site / serons redirectionné vers cloud/index



//===================================================================
//Renvoyer le nombre de personne utilisant le serveur:
//===================================================================
let nb = App.getNbUser();


//===================================================================
//Renvoyer la liste des tous les CTRL disponibles
//===================================================================
let list_ctrl = App.getAllCtrl();


//===================================================================
//Ajouter une fonction lors de l'arret du serveur
//===================================================================
App.useStopSrv(function()
{
  //INSTRUCTION !
});


//===================================================================
//Envoyer un message à un groupe:
//===================================================================
App.sendMsg( 'NOM DU GROUPE', 'Mon titre', 'Corps de message!' );


//===================================================================
//Envoyer un message à tout le monde : 
//===================================================================
App.sendAllMsg( 'Mon titre', 'Corps de message!');


//===================================================================
//Créer un nouveau type de paramettre pour les "newCtrl"
//===================================================================
App.addParamType( 'NOM TYPE', function( value )
{
  return 1;//TYPE CORRECT !
  return 0;//TYPE INCORRECT !:
});


//===================================================================
//Afficher un debug
//===================================================================
App.debug("OUPS CRASH !");
global.debug('hello world !');
console.log('MESSAGE');


//===================================================================
//Créer une tache CRON:
//===================================================================
let tache = App.newCron('* * * * *',function()
{
  //INSCTRUCTION
});


//===================================================================
//Créer une tache CRON qui sera exécuté sur tout les membres connecté:
//===================================================================
let tache = App.newCronMember('* * * * *',function( sess )
{
  //INSCTRUCTION
});


//===================================================================
//Annuler une tache CRON
//===================================================================
App.cancelCron( tache );


//===================================================================
//Exécuter une commande Console:
//===================================================================
App.cmd('ps -A',function(err, data, stderr)
{
  //INSCTRUCTION
});


//===================================================================
//Ajouter un TimeOut en millisegonde : 1minute = 1*60*1000 !
//===================================================================
let to = App.addTimeOut( 5*60*1000, function()
{
 //INSCTRUCTION DANS 5 MINUTES
});


//===================================================================
//Ajouter un TimeOut en millisegonde pour tout les membres
//===================================================================
let to = App.addTimeOutMember( 10*60*1000, function(sess)
{
  //INSCTRUCTION DANS 10 MINUTES
});


//===================================================================
//Annuler un TimeOut
//===================================================================
App.stopTimeOut( to );

```


# Variable et fonction d'un __newCtrl__:
```js
App.newCtrl('NAME', function( params, end ) // params: listes des parammettre joins )
{
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Accés à la session
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.sess;
  
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Deconnecion
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.logout();
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Exécuter un ctrl dans un ctrl
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.execCtrl( 'CTRl_NAME', {'text':'Liste des paramettre format JSON' )
  .then(function( params, end )
  {
    //REPONSE DU CTRL 
  });
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Modifier le temps avant deconnexion USER si pas d'activiter
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.setTimeOut( 100 );
  let time = this.getTimeOut();
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Envoyer un message a un groupe
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.sendMsg( 'NOM DU GROUPE', 'TITRE', 'CONTENU' );
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Envoyer un message a tout le monde
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	this.sendAllMsg( 'TITRE', 'CONTENU' );
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Déplacer un fichier
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.moveFile( 'PATH FICHIER', 'PATH DESTINATION' );
  
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Exécuter une fonction dans X millisegonde
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  let time = this.addTimeOut( 1*60*1000, function()
  {
   //INSTRUCTION
  });
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Annuler un TimeOut
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.stopTimeOut( time );
  
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Exécuter une commande console
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.cmd('ps -A', function(err, data, stderr)
  {
    //INSTRUCTION
  });
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Ajouter le membre éxécuter cette methode dans un groupe
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.grp.add('ADMIN');
  
  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Supprimer le membre d'un groupe
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  this.grp.remove('ADMIN');

  
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  ////Réponse au client ( string, object, array ) OBLIGATOIRE
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  end(true);
});
```
<br/><br/><br/>
# Ajouter des paramettres à un Controlleur:
```js
App.newCtrl('NAME', function( params, end ) // params: listes des parammettre joins )
{
  end(true);
})
.addGrp('CAISSE') //SEUL UN MEMBRE DE CAISSE PEUX ACCEDER A CE CTRL
.addParam('name'   , 'string,2,10')// name est un string comprix entre 2 & 10
.addParamFac('tva'    , 'numting')// string ou nombre mais ce paramettre et facultatif !
.addParamFac('credit' , 'number');// numbre avec paramettre facultatif
.addFileHttp('file'); //Accepte la reception d'un fichier nommé "file" paramettre optionnel
```

<br/><br/><br/>
# Autoriser un CLOUD uniquement a un groupe
```js
App.newCloud('/admin', 'admin')
.addGrp('ADMIN'); //Seul un admin pourra voir ces fichiers ! 

```

<br/><br/><br/>
# Controlleur Générique fourni dans le server dans le dossier __ctrl__

CONTROLLEUR:
* ping
* getNbUser
* getGrp
* time
* date
* getAllCtrl
* testParams[ROOT]
* reboot[ROOT]
* rebootCloud[ROOT]
* config[ROOT]


TYPE VARIABLES:
* string
* varchar
* number
* phone
* email
* uuidv4
* date
* datetime
* time
* numting
* bool
* login ( 5 character min )
* password ( 7/15 character, character special et numbre )

