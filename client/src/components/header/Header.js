import React, { useContext } from "react";
import { Badge, Nav, Navbar } from "react-bootstrap";
import { NavLink, withRouter } from "react-router-dom";
import { Icon } from "semantic-ui-react";
import { AuthContext } from "../../auth/AuthProvider";
import fire from "../../auth/Fire";
import "./Header.css";
import logo from "./logo-min.png";

const Header = ({ history }) => {
  const { currentUser } = useContext(AuthContext);

  const getGreeting = () => {
    let d = new Date();
    let time = d.getHours();

    if (time <= 12 && time > 5) {
      return "Good morning";
    }
    if (time > 12 && time <= 17) {
      return "Good afternoon";
    }
    if (time > 17 || time <= 5) {
      return "Good evening";
    }
  };

  const signOut = () => {
    fire.auth().signOut();
    history.push("/login");
  };

  return (
    <Navbar className="navbarHeader">
      <Navbar.Brand>
        <NavLink to="/">
          <img alt="" src={logo} />
          <Badge
            style={{ fontSize: "55%", marginLeft: "10px" }}
            variant="light"
          >
            {process.env.REACT_APP_VERSION}
          </Badge>
        </NavLink>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text style={{ textAlign: "right" }}>
          {getGreeting()}, <b>{currentUser?.email}</b>
          <br />
        </Navbar.Text>
        <Nav>
          <div className="nav-linkHeader" onClick={() => signOut()}>
            <Icon name="sign-out" size="large" />
          </div>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default withRouter(Header);
