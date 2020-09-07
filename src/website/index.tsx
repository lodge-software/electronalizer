import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// We find our app DOM element as before
const app = document.getElementById('app');

// Here's an example of a couple of simple React components
const Emphasis: React.FunctionComponent = (props) => <em>{props.children}</em>;

// You can see how we can mix html and nested components together
const App = () => (
  <div>
    Hello, <Emphasis>world</Emphasis>
  </div>
);

Emphasis.propTypes = {
  children: PropTypes.node.isRequired,
};

// Finally, we render our top-level component to the actual DOM.
ReactDOM.render(<App />, app);
