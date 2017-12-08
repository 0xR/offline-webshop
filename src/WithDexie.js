import lunr from 'lunr';
import Dexie from 'dexie';
import React, { Component } from 'react';

var attempt = Date.now(), reminder = {};

var db;
var log = console.log.bind(console);

var pipeline = new lunr.Pipeline();

function getTokenStream(text) {
  return pipeline.run(lunr.tokenizer(text));
}

function search(query) {
  var docs = [];
  return db.transaction('r', db.cards, function () {
    // debugger;
    db.cards.where("tokens").equals(query).each(function (doc) {
      docs.push(doc);
    });
    // db.cards.each(function (doc) {
    //   docs.push(doc);
    // });
  }).then(function () {
    return docs;
  });
}

// Helpers
function start(label, type) {
    return result => {
        reminder[type] = label;
        if(type !== 'group') console.log(label);
        console[type || 'time'](label);
        return result;
    };
}

function stop(type) {
    return result => {
        console[(type || 'time') + 'End'](reminder[type]);
        return result;
    };
}

const load = async () => {
      await start('Attempt ' + attempt, 'group')();
      await start('Destroying database')();
      
      await new Promise(function (resolve, reject) {
        var req = indexedDB.deleteDatabase('test');
        req.onsuccess = resolve;
        req.onerror = resolve;
      });

      await stop()();
      await start('Creating database')();

      await new Promise(function (resolve, reject) {
        db = new Dexie("test");
        db.version(1).stores({
          cards: "&name,text,*tokens",
        });
        db.open();
        resolve();
      });

      await stop()();
      await start('Downloading cards')();

      const data = await fetch('./cards').then(r => r.json());

      await stop()();
      await start('Transforming object to array');

      const mapped = Object.keys(data).map(name => {
          return data[name];
      });

      await stop()();
      await start('Inserting data')();

      db.transaction("rw", db.cards, () => {
        mapped.forEach(card => {
          var tokenStream = getTokenStream(card.name + ' ' + card.text);
          var cardToInsert = {
            name: card.name,
            text: card.text,
            tokens: tokenStream.map(i => i.str)
          };
          console.log('adding:', cardToInsert);
          db.cards.add(cardToInsert);
        });
      });

      await stop()();

      await start('Searching for "Kitten"')();
      const kitten = await search('kitten').then(log);
      await stop()();

        //   .then(start('Searching for "cat"'))
      //   .then(function() {
      //     return search('cat').then(log);
      //   })
      //   .then(stop())
      //   .then(start('Searching for "flying"'))
      //   .then(function() {
      //     return search('flying').then(log);
      //   })
      //   .then(stop())
      //   .catch(console.error.bind(console))
      //   .then(console.log.bind(console, 'Done!'))
      //   .then(stop('group'), stop('group'));

}

class App extends Component {
  componentDidMount() {
    load();
    // Promise.resolve()
    //   .then(start('Attempt ' + attempt, 'group'))
    //   .then(start('Destroying database'))
    //   .then(function() {
    //     return new Promise(function (resolve, reject) {
    //       var req = indexedDB.deleteDatabase('test');
    //       req.onsuccess = resolve;
    //       req.onerror = resolve;
    //     });
    //   })
    //   .then(stop())
    //   .then(start('Creating database'))
    //   .then(function() {
    //     return new Promise(function (resolve, reject) {
    //       db = new Dexie("test");
    //       db.version(1).stores({
    //         cards: "&name,text,*tokens",
    //       });
    //       db.open();
    //       resolve();
    //     });
    //   })
    //   .then(stop())
    //   .then(start('Downloading cards'))
    //   .then(() => fetch('./cards'))
    //   .then(res => res.json())
    //   .then(d => {
    //     return { cards: d };
    //   })
    //   .then(stop())
    //   .then(start('Transforming object to array'))
    //   .then(function(result) {
    //     result.cards = Object.keys(result.cards).map(function(name) {
    //         return result.cards[name];
    //     });
    //     return result;
    //   })
    //   .then(stop())
    //   .then(start('Inserting data'))
    //   .then(function(result) {
    //     return db.transaction("rw", db.cards, function () {
    //       result.cards.forEach(function (card) {
    //         var tokenStream = getTokenStream(card.name + ' ' + card.text);
    //         var cardToInsert = {
    //           name: card.name,
    //           text: card.text,
    //           tokens: tokenStream.map(i => i.str)
    //         };
    //         console.log('adding:', cardToInsert);
    //         db.cards.add(cardToInsert);
    //       });
    //     });
    //   })
    //   .then(stop())
    //   .then(start('Searching for "Kitten"'))
    //   .then(function() {
    //       return search('kitten').then(log);
    //   })
    //   .then(stop())
    //   .then(start('Searching for "cat"'))
    //   .then(function() {
    //     return search('cat').then(log);
    //   })
    //   .then(stop())
    //   .then(start('Searching for "flying"'))
    //   .then(function() {
    //     return search('flying').then(log);
    //   })
    //   .then(stop())
    //   .catch(console.error.bind(console))
    //   .then(console.log.bind(console, 'Done!'))
    //   .then(stop('group'), stop('group'));

  }
  render() {
    return (
      <div className="App">
      </div>
    );
  }
}

export default App;
