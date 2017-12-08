import lunr from 'lunr';
import Dexie from 'dexie';

const db = new Dexie('products');
var pipeline = new lunr.Pipeline();

function getTokenStream(text) {
  return pipeline.run(lunr.tokenizer(text));
}

db.version(1).stores({
  products: '&id,product,*tokens',
});
db.open();

export default db;

export const addProducts = products =>
  db.transaction('rw', db.products, () => {
    products.forEach(p => {
      var tokenStream = getTokenStream(
        p.name +
          ' ' +
          p.description +
          ' ' +
          p.attributes.reduce((acc, item) => {
            return acc + ' ' + item.value;
          }, '') +
          ' ' +
          p.categories.reduce((acc, item) => {
            return acc + ' ' + item.name;
          }, ''),
      );
      var insert = {
        id: p.id,
        tokens: tokenStream.map(i => i.str),
        product: p,
      };
      console.log('adding product:', insert, p);
      db.products.add(insert);
    });
  });

export const findProducts = async query => {
  var docs = [];

  await db.transaction('r', db.products, () => {
    db.products
      .where('tokens')
      .equals(query)
      .each(function(doc) {
        docs.push(doc);
      });
  });
  return docs;
};

export const clear = async () => {
  // await new Promise(function (resolve, reject) {
  //   var req = indexedDB.deleteDatabase('products');
  //   req.onsuccess = resolve;
  //   req.onerror = resolve;
  // });
};
