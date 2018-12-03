import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Wrangle from './components/wrangle/wrangle';


export class Application extends React.Component {
  render() {
    return (
      <>
        <Router>
            <Switch>
              <Route path="/" component={Wrangle} />
            </Switch>
        </Router>
      </>
    );
  }
}