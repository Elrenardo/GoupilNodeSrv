//connexion Server
CtrlSocket(function()
{
	console.log('END load CtrlSocket');

	test();


	//charger page
	loadPage('exemple1');

    //enlever le loader
    setTimeout(function()
    {
        $('#api_loader').fadeOut("slow");
    }, 500);
});

function test()
{
	window.ping().then(function(rep)
	{
		console.log( rep );
	});
	
	//setTimeout(test, 1000);
}