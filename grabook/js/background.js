if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str) {
    return this.substr(0, str.length) == str;
  };
}
if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function(str) {
    return this.substr(-str.length) == str;
  };
}

var app_config = function() {
  var _config_url = "http://a.qibaowu.cn/crx/appconfig.json";
  var _config = null;

  var load_config = function() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", _config_url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        _config = JSON.parse(xhr.responseText);
        console.log('[Grabook]get config ok.');
      }
    }
    xhr.send();
  }
  var debug_config = function() {
    console.log('[Grabook]app config:' + _config);
  }
  var version_compare = function(stra, strb) {
    var straArr = stra.split('.');
    var strbArr = strb.split('.');
    var maxLen = Math.max(straArr.length, strbArr.length);
    var result, sa, sb;
    for (var i = 0; i < maxLen; i++) {
      sa = ~~straArr[i];
      sb = ~~strbArr[i];
      if (sa > sb) {
        result = 1;
      } else if (sa < sb) {
        result = -1;
      } else {
        result = 0;
      }
      if (result !== 0) { return result; }
    }
    return result;
  }
  var check_update = function(this_version) {
    if (_config == null || typeof this_version != "string") { return false; }
    var result = version_compare(_config.update_version, this_version);
    if (result > 0) {
      return true;
    } else {
      return false;
    }
  }
  var get_menuconfig = function() {
    return _config.menu_config;
  }
  var get_pagescripts = function(page_url) {
    if (_config == null) { return null; }
    var items = _config.page_scripts;
    for ( var i in items) {
      var matches = items[i].matches;
      for ( var j in matches) {
        if (page_url.startsWith(matches[j])) { return items[i].scripts; }
      }
    }
    return null;
  }
  var get_searchurl = function(mkt){
    return _config.search_urls[mkt];
  }

  load_config();
  return {
    "check_update": check_update,
    "get_menuconfig": get_menuconfig,
    "get_pagescripts": get_pagescripts,
    "debug_config": debug_config
  };
}();

var base_api = function() {
  var load_url = function(url, tabid) {
    if (tabid < 1) {
      chrome.tabs.create({
        "url": url
      });
    } else {
      chrome.tabs.update(tabid, {
        "url": url
      })
    }
  }

  var grap_this = function() {
    chrome.tabs.getSelected(function(tab) {
      console.log("[Grabook]grap_this: " + tab.url);
    });
  }

  var get_json = function(url, receive) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        receive(xhr.responseText);
        console.log('[Grabook]get json ok.');
      }
    }
    xhr.send();
  }

  return {
    "load_url": load_url,
    "get_json": get_json,
    "grap_this": grap_this
  }
}();

var grab_book = function() {
  var _grab_bind_tab = -1;
  var _grab_bind_evt = null;
  var _isbn_grabing;

  var get_grabing = function(tabid, isbn){
    return _isbn_grabing;
  }

  var bind_grab_event = function(tabid, bind_evt){
    _grab_bind_tab = tabid;
    _grab_bind_evt = bind_evt;
    return true;
  }

  var grab_by_isbn = function(tabid, isbn) {
    _isbn_grabing = isbn;
    var search_url = app_config.get_searchurl("amazon");
    if(search_url){
      base_api.load_url(search_url+isbn);
      return true;
    }else{
      return {"ret":"FAIL", "msg":"no search."};
    }
  }

  var on_grab_event = function(tabid, evt){
    if(_grab_bind_tab>0){
      tab_call(_grab_bind_tab, "on_grab_event", evt, null);
    }
    return true;
  }

  var submit_book = function(tabid, book){
    if(_grab_bind_tab>0){
      tab_call(_grab_bind_tab, "submit_book", book, null);
    }
    return true;
  }

  return {
    "bind_grab_event": bind_grab_event,
    "grab_by_isbn": grab_by_isbn,
    "on_grab_event": on_grab_event 
  }
}();

var tab_events = function() {
  var insert_script = function(tabid, scripts, index) {
    if (scripts != null && index < scripts.length) {
      var script = scripts[index];
      if (script.startsWith("http://")) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", script, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            console.log('[Grabook]excute script:', tabid, script);
            chrome.tabs.executeScript(tabid, {
              code: xhr.responseText
            });
            insert_script(tabid, scripts, index + 1);
            console.log('[Grabook]request finish:', tabid, script);
          }
        }
        xhr.send();
        console.log('[Grabook]load script:', tabid, script);
      } else {
        console.log('[Grabook]excute script:', tabid, script);
        chrome.tabs.executeScript(tabid, {
          file: script
        });
        insert_script(tabid, scripts, index + 1);
      }
    }
  }
  var insert_scripts = function(tab) {
    var scripts = app_config.get_pagescripts(tab.url);
    insert_script(tab.id, scripts, 0);
  }

  var on_tabcreated = function(tab) {
    console.log('[Grabook]tab created:', tab.id, tab.url);
  }
  var on_tabupdated = function(tabId, changeInfo, tab) {
    if (changeInfo.status == "complete") {
      console.log('[Grabook]tab complete:', tab.id, tab.url);
      insert_scripts(tab);
    }
  }

  return {
    "on_tabcreated": on_tabcreated,
    "on_tabupdated": on_tabupdated
  }
}();
chrome.tabs.onUpdated.addListener(tab_events.on_tabupdated);

function tab_call(tabid, func, arg, callback) {
  chrome.tabs.sendRequest(tabid, {"call":func,"arg":arg}, callback);
}
var bgp_api = {
  "base_api":base_api,
  "grap_book":grab_book
}
chrome.extension.onRequest.addListener(function(request, sender, response) {
  var src = (sender.tab ? sender.tab.url : "extension");
  var call = request.call.split(".");
  if (typeof bgp_api[call[0]][call[1]] == "function") {
    ret = bgp_api[call[0]][call[1]](sender.tab.id, request.arg);
    if(typeof response == "function"){
      response(ret);
    }
    console.log("[Grabook]bgp_api",call[0],call[1],"called from",src,"result",ret);
  } else {
    console.log("[Grabook]unknown msg:",request,"from",src);
  }
});