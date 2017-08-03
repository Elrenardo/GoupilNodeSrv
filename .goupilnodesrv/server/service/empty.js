'use strict';
/*
===================================================================
* File name   : empty.js
* Create At   : 07/12/2016
* Update At   : 
* Description : verifie si une variable et pas vide
===================================================================
*/

  //  discuss at: http://locutus.io/php/empty/
  // original by: Philippe Baumann
  //    input by: Onno Marsman (https://twitter.com/onnomarsman)
  //    input by: LH
  //    input by: Stoyan Kyosev (http://www.svest.org/)
  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Onno Marsman (https://twitter.com/onnomarsman)
  // improved by: Francesco
  // improved by: Marc Jansen
  // improved by: Rafał Kukawski (http://blog.kukawski.pl)
  //   example 1: empty(null)
  //   returns 1: true
  //   example 2: empty(undefined)
  //   returns 2: true
  //   example 3: empty([])
  //   returns 3: true
  //   example 4: empty({})
  //   returns 4: true
  //   example 5: empty({'aFunc' : function () { alert('humpty'); } })
  //   returns 5: false


module.exports = function empty (mixedVar)
{
  let undef;
  let key;
  let i;
  let len;
  let emptyValues = [undef, null, false, 0, '', '0'];


  for (i = 0, len = emptyValues.length; i < len; i++)
  if (mixedVar === emptyValues[i])
      return true;


  if (typeof mixedVar === 'object')
  {
    for (key in mixedVar)
    if (mixedVar.hasOwnProperty(key))
        return false;

    return true;
  }

  return false;
}