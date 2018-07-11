var sharedb = require('sharedb/lib/client');
var richText = require('rich-text');
var Quill = require('quill');
sharedb.types.register(richText.type);

// Open WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);

// For testing reconnection
window.disconnect = function() {
  connection.close();
};
window.connect = function() {
  var socket = new WebSocket('ws://' + window.location.host);
  connection.bindToSocket(socket);
};

// Create local Doc instance mapped to 'examples' collection document with id 'richtext'
var doc = connection.get('examples', 'richtext2');
doc.subscribe(function(err) {
  if (err) throw err;
  var quill = new Quill('#editor', {theme: 'snow'});
  quill.setContents(doc.data);
  quill.on('text-change', function(delta, oldDelta, source) {
    if (source !== 'user') return;
    console.log("[OUT] send change",delta, doc.version);
    setTimeout(function() { doc.submitOp(delta, {source: quill}); }, 100);
  });
  doc.on('op', function(op, source) {
    if (source === quill) return;
    console.log("[I N] get change",op, doc.version);
    quill.updateContents(op);
  });
  var c,retc = /char=([A-Za-z0-9]+)/.exec(window.location.search);
  if(retc) {
    c = retc[1];
  } else {
    c = null;
  }
  console.log(c);
  var ret = /auto=(\d+)/.exec(window.location.search);
  if(ret) {
    setInterval(function() {
      var t = String.fromCharCode(Math.round(Math.random() * 26 + 65))
      quill.insertText(0,t, "user")
    }, +ret[1]);
  }
});

