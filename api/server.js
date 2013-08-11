var request = require('request');
var cheerio = require('cheerio');
var Q = require('q');
var CONFIG = require('config').Scripts;

console.log(CONFIG);

function getVimPageUrl(page, perPage) {
  var showMe = perPage >>> 0 || 20;
  var resultPtr = (page >>> 0 || 0) * showMe;
  var baseUrl = 'http://www.vim.org/scripts/script_search_results.php?';

  var params = [
    'show_me=' + showMe,
    'result_ptr=' + resultPtr
  ].join('&');

  return baseUrl + params;
}

function fetchPage(url) {
  var deferred = Q.defer();
  request(url, function(error, resp, body) {
    if(error) {
      deferred.reject(new Error(error));
    } else {
      deferred.resolve(body);
    }
  });
  return deferred.promise;
}

function parsePage(html) {
  var $ = cheerio.load(html);
  var list = $('h1').next().find('tr');
  list = list.slice(2, list.length - 1);
  var result = [];

  //reload the partial html into cheerio
  $ = cheerio.load(list);

  $('tr').each(function(index, element) {

  /****
   * what i need:
   * {
   *  "name": "Move",
   *  "id": 4687,
   *  "type": "utility",
   *  "rating" 4,
   *  "downloads": 7,
   *  "summary": "vim-move moves single lines and selected text up and down"
   *  }
   */

    var $td = $(element).find('td');
    result.push({
      "name": $td.eq(0).text(),
      "id": $td.eq(0).find('a').attr('href').match(/script_id=(\d+)/)[1],
      "type": $td.eq(1).text(),
      "rating": $td.eq(2).text(),
      "downloads": $td.eq(3).text(),
      "summary": $td.eq(4).text()
    });
  });

  return result;
}

fetchPage(getVimPageUrl(0, 1)).then(function(html) {
  console.log(parsePage(html));
});

