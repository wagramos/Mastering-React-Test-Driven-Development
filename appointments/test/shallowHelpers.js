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

export const type = typeName => element => element.type === typeName;
export const id = id => element => element.props && element.id === id;
export const className = className => element => element.props.className === className;
export const click = element => element.props.onClick();

const elementsMatching = (element, matcherFn) => {
  if (matcherFn(element)) {
    return [element];
  }
  return childrenOf(element)
    .reduce((acc, child) => [
      ...acc,
      ...elementsMatching(child, matcherFn)
    ], []);
};

export const createShallowRenderer = () => {
  let renderer = new ShallowRenderer();

  return {
    render: component => renderer.render(component),
    elementMatching: matcherFn => elementsMatching(renderer.getRenderOutput(), matcherFn)[0],
    elementsMatching: matcherFn => elementsMatching(renderer.getRenderOutput(), matcherFn),
    child: n => childrenOf(renderer.getRenderOutput())[n],
  };
};