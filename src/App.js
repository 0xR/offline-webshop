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
  setState({ ids });
  buildIndex(ids, setState);
}

async function search({ query, state, setState }) {
  const results = (await idx).search(query);
  console.log(results, state);
  debugger;
}

class App extends Component {
  constructor() {
    super();
    this.state = { products: {} };
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
            search({
              query: e.target.elements.query.value,
              state: this.state,
              setState: this.boundSetState,
            });
          }}
        >
          <input name="query" />
        </form>
        <p className="App-intro">
          <button>Load products</button>
        </p>
        <p>Loaded {Object.keys(this.state.products).length} products</p>
      </div>
    );
  }
}

export default App;
