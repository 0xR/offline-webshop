const Koa = require('koa');
const fs = require('fs-extra');

const search = require('./data/search-0-952.json');
const uniqueIds = Array.from(
  new Set(search.products.map(({ id }) => id.replace(/_.*/, ''))),
);

const products = Promise.all(
  uniqueIds.map(id => {
    return fs.readJson(`./data/products/product-${id}.json`);
  }, {}),
).then(productsJson =>
  productsJson.reduce((result, product, i) => {
    return {
      ...result,
      [uniqueIds[i]]: product,
    };
  }, {}),
);

const productRegex = /\/product\/(\d{6})$/;

const app = new Koa();
app.use(async ctx => {
  if (ctx.url === '/search') {
    ctx.body = uniqueIds;
  } else if (productRegex.test(ctx.url)) {
    const id = productRegex.exec(ctx.url)[1];
    ctx.body = (await products)[id];
  }
});

app.listen(4000);
