import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ide from './components/ide/ide';


export class Application extends React.Component {
  render() {
    return (
      <>
        <Router>
            <Switch>
              <Route path="/" component={ide} />
            </Switch>
        </Router>
      </>
    );
  }
}