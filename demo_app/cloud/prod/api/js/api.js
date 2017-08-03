
//Jquery
$(initLoaderPage);

//Main soft
function initLoaderPage()
{
    //load page menu
    $('*[data-page]').unbind().click(function()
    {
        let name   = $(this).attr('data-page');
        
        //sauvegarde global page charge
        if( $(this).attr('data-name') != undefined )
            window.isiklub_pageLoad = $(this).attr('data-name');
        else
            window.isiklub_pageLoad = name;

        loadPage( name );
    });
}



/*charger une page*/
function loadPage( name )
{
    let $main = $( "#api_pageLoader" );

    //disparition en fondu
    $main.fadeOut("slow",function()
    {
        $main.html('').unbind();
        $main.load('./html/'+name+'.html',function()
        {
            //gestion des tableaux et interface
            GestTab();

            //refresh gestion page
            initLoaderPage();

            //réaparation en fondu
            $main.fadeIn("slow");
        });
    });
}


function debounce(callback, delay){
    var timer;
    return function(){
        var args = arguments;
        var context = this;
        clearTimeout(timer);
        timer = setTimeout(function(){
            callback.apply(context, args);
        }, delay)
    }
}



function throttle(callback, delay) {
    var last;
    var timer;
    return function () {
        var context = this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + delay) {
            // le délai n'est pas écoulé on reset le timer
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                callback.apply(context, args);
            }, delay);
        } else {
            last = now;
            callback.apply(context, args);
        }
    };
}


function GestTab()
{
    //add table thead
    $('thead th ').attr('data-sort',"string");
    //trie table
    var table =  $("table").stupidtable();

    $('.pre-arrow').remove();
    //$('table thead th[data-sort]').append('<i class="fa fa-arrows-v pre-arrow" aria-hidden="true"></i>');

    //Array filtre
    table.on("aftertablesort", function (event, data)
    {
        $('.pre-arrow').remove();
        var th = $(this).find("th");
        th.find(".arrow").remove();
        var dir = $.fn.stupidtable.dir;

        //var arrow = data.direction === dir.ASC ? "&uarr;" : "&darr;";
        //th.eq(data.column).append('<span class="arrow">' + arrow +'</span>');
        var arrow = data.direction === dir.ASC ? "down" : "up";
        th.eq(data.column).append('<i class="arrow fa fa-chevron-'+arrow+'" aria-hidden="true"></i>');
    });
    //-----------------------------------------------------

    //Exporteur EXCEL
    $(".exportExcel").click(function(e)
    {
      let table = $(this).attr('id-table');
      let name  = $(this).attr('table-name');

      let html = $('#'+table).html();
      //enlever les accents qui pose probléme pour excel
      html = html.replace('/€/g','');
      html = html.replace('/é/g','e');
      html = html.replace('/è/g','e');
      html = html.replace('/ê/g','e');
      html = html.replace('/ë/g','e');
      html = html.replace('/ç/g','c');
      html = html.replace('/à/g','a');

      window.open('data:application/vnd.ms-excel; charset=UTF-8,' + encodeURIComponent(html) );
      e.preventDefault();
    });
}