import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

export const childrenOf = element => {
  if (typeof element === 'string') {
    return []
  }
  const { props: { children } } = element;
  if (!children) {
    return [];
  }
  if (typeof children === 'string') {
    return [element.props.children];
  }
  if (!Array.isArray(children)) {
    return [children];
  }
  return element.props.children
};

export const createShallowRenderer = () => {
  let renderer = new ShallowRenderer();

  return {
    render: component => renderer.render(component),
    child: n => childrenOf(renderer.getRenderOutput())[n]
  };
};