import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { addProducts, findProducts, clear } from './db';

function loadProduct(id, onLoad) {
  return fetch(`/product/${id}`)
    .then(r => r.json())
    .then(json => {
      onLoad();
      return json;
    });
}

async function loadProducts(setState, onLoad, onAdd) {
  const ids = await (await fetch('/search')).json();
  const data = await Promise.all(ids.map(id => loadProduct(id, onLoad)));

  addProducts(data, onAdd);
}

async function search({ query, state, setState }) {
  const searchResults = await findProducts(query);
  setState({ searchResults });
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
    this.state = { added: 0, loaded: 0, products: {}, searchResults: [] };
    this.boundSetState = this.setState.bind(this);
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
        <p className="App-intro">
          <button
            onClick={() =>
              new Promise((resolve, reject) => {
                Notification.requestPermission(result => {
                  if (result !== 'granted')
                    return reject(Error('Denied notification permission'));
                  resolve();
                });
              })
                .then(() => {
                  return navigator.serviceWorker.ready;
                })
                .then(reg => {
                  return reg.sync.register('syncTest');
                })
            }
          >
            Test sync
          </button>
          <button
            onClick={async () => {
              await clear();
              let i = 0;
              let j = 0;
              await loadProducts(
                this.boundSetState,
                () => {
                  this.boundSetState({ loaded: i++ });
                },
                () => {
                  this.boundSetState({ added: j++ });
                },
              );
            }}
          >
            Load products
          </button>
        </p>
        <p>{this.state.loaded} products loaded</p>
        <p>{this.state.added} products added</p>
        <ul>
          {this.state.searchResults.map(item => (
            <li key={item.id}>
              <h2>{item.product.name}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: item.product.description }}
              />
              <button onClick={() => buy(item.product)}>
                Buy for {priceOfProduct(item.product)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
