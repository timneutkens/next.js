module.exports=(()=>{"use strict";var r={454:(r,e)=>{var o="";if(typeof EventSource!=="function"){throw new Error("Environment doesn't support lazy compilation (requires EventSource)")}var i=decodeURIComponent(o.slice(1));var n;var t=new Map;var a=new Set;var f=function updateEventSource(){if(n)n.close();if(t.size){n=new EventSource(i+Array.from(t.keys()).join("@"));n.onerror=function(r){a.forEach(function(e){e(new Error("Problem communicating active modules to the server: "+r.message+" "+r.filename+":"+r.lineno+":"+r.colno+" "+r.error))})}}else{n=undefined}};e.keepAlive=function(r){var e=r.data;var o=r.onError;var i=r.active;var n=r.module;a.add(o);var u=t.get(e)||0;t.set(e,u+1);if(u===0){f()}if(!i&&!n.hot){console.log("Hot Module Replacement is not enabled. Waiting for process restart...")}return function(){a.delete(o);setTimeout(function(){var r=t.get(e);if(r===1){t.delete(e);f()}else{t.set(e,r-1)}},1e3)}}}};var e={};function __nccwpck_require__(o){if(e[o]){return e[o].exports}var i=e[o]={exports:{}};var n=true;try{r[o](i,i.exports,__nccwpck_require__);n=false}finally{if(n)delete e[o]}return i.exports}__nccwpck_require__.ab=__dirname+"/";return __nccwpck_require__(454)})();