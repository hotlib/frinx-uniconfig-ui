import React, { useContext, useState } from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./auth/AuthProvider";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import KibanaFrame from "./components/dashboard/KibanaFrame";
import Header from "./components/header/Header";
import TaskList from "./components/tasks/taskList/TaskList";
import List from "./components/uniconfig/deviceTable/List";
import DeviceView from "./components/uniconfig/deviceView/DeviceView";
import SubApp from "./components/workflows/frinx-workflow-ui/src/App";

function App() {
  const [isBuilderActive, setIsBuilderAcive] = useState(false);
  const { currentUser } = useContext(AuthContext);

  let routes = (
    <Switch>
      <PrivateRoute exact path="/" component={Dashboard} />
      <PrivateRoute exact path="/devices" component={List} />
      <PrivateRoute path="/devices/edit/:id" component={DeviceView} />
      <PrivateRoute path="/tasks" component={TaskList} />
      {currentUser && (
        <Route
          exact
          path={[
            "/workflows/builder",
            "/workflows/builder/:name/:version",
            "/workflows/:type",
            "/workflows/:type/:wfid",
          ]}
          render={() => <SubApp setBuilderActive={setIsBuilderAcive} />}
        />
      )}
      <PrivateRoute exact path="/inventory" component={KibanaFrame} />
      <Route path="/login" component={Login} />
    </Switch>
  );

  return (
    <div className="App">
      {isBuilderActive ? null : <Header />}
      {routes}
    </div>
  );
}

export default withRouter(App);
