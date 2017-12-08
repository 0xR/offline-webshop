import React, { Component } from 'react';
import glamorous from 'glamorous';

export const Container = glamorous.div({
  maxWidth: 1200,
  padding: 40,
});

export const SearchField = glamorous.input({
  width: '100%',
  padding: 20,
  display: 'block',
  boxSizing: 'border-box',
});

export const List = glamorous.ul({
  listStyle: 'none',
  margin: -10,
  padding: 0,
  display: 'flex',
  flexFlow: 'row',
  flexWrap: 'wrap',
  justifyContent: 'stretch',
});

export const Item = glamorous.li({
  listStyle: 'none',
  position: 'relative',
  margin: 10,
  padding: 10,
  paddingBottom: 40,
  background: 'white',
  // background: 'white linear-gradient(135deg, rgba(0,0,0,0.05) 0%,rgba(0,0,0,0) 100%);',
  boxSizing: 'border-box',

  '@media screen and (min-width: 360px)': {
    width: 'calc(100% - 20px)',
  },
  '@media screen and (min-width: 560px)': {
    width: 'calc(50% - 20px)',
  },
  '@media screen and (min-width: 760px)': {
    width: 'calc(33.333% - 20px)',
  },
  '@media screen and (min-width: 960px)': {
    width: 'calc(25% - 20px)',
  },
});

export const Button = glamorous.button({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'black',
  width: '100%',
  padding: 10,
  boxSizing: 'border-box',
  borderRadius: 0,
  border: 0,
  color: 'white',
})
