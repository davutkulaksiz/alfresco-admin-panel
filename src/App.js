import React from "react";
import Login from "./pages/login/Login";
import Demo from "./pages/demo/Demo";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

const App = () => {
  return (
    <div className="container">
      <Router>
        <Switch>
          <Route path="/login" render={(props) => <Login {...props} />} />
          <Route path="/demo" render={(props) => <Demo {...props} />} />
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
