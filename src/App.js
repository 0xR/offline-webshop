import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Builder } from 'lunr';

async function getProduct(id) {
  return await (await fetch(`/product/${id}`)).json();
}

const builder = new Builder();
builder.field('description');
builder.field('name');

let resolveIdx;
const idx = new Promise(resolve => {
  resolveIdx = resolve;
});

async function buildIndex(ids, setState) {
  let stored = 0;

  const products = {};

  function storeProduct(id, product) {
    products[id] = product;
    builder.add(product);
    setState({ products });
    stored++;
    if (stored === ids.length) {
      const idx = builder.build();
      resolveIdx(idx);
    }
  }

  ids.map(id => getProduct(id).then(product => storeProduct(id, product)));
}

async function getProducts(setState) {
  const ids = await (await fetch('/search')).json();
  buildIndex(ids, setState);
}

async function search({ query, state, setState }) {
  const results = (await idx).search(query).map(({ ref }) => ref);
  setState({ searchResults: results });
}

function priceOfProduct(product) {
  return product.colorVariants[0].price;
}

function buy(product) {
  return new Promise((resolve, reject) => {
    Notification.requestPermission(result => {
      if (result !== 'granted')
        return reject(Error('Denied notification permission'));
      resolve();
    });
  })
    .then(() => {
      return navigator.serviceWorker.ready;
    })
    .then(registration => {
      return registration.sync.register(
        JSON.stringify({
          event: 'buy',
          id: product.id,
          name: product.name,
          quantity: 1,
          expectedPrice: priceOfProduct(product),
        }),
      );
    });
}

class App extends Component {
  constructor() {
    super();
    this.state = { products: {}, searchResults: [] };
    this.boundSetState = this.setState.bind(this);
    getProducts(this.boundSetState);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <form
          onSubmit={e => {
            e.preventDefault();
            search({
              query: e.target.elements.query.value,
              state: this.state,
              setState: this.boundSetState,
            });
          }}
        >
          <input name="query" />
        </form>
        <p>Loaded {Object.keys(this.state.products).length} products</p>
        <ul>
          {this.state.searchResults.map(id => {
            const product = this.state.products[id];
            return (
              <li key={id}>
                {product.name}
                <button onClick={() => buy(product)}>
                  Buy for {priceOfProduct(product)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default App;
