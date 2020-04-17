import React, { useCallback, useContext } from "react";
import Particles from "react-particles-js";
import { Redirect, withRouter } from "react-router-dom";
import { Button, Container, Form, Grid, Icon, Input } from "semantic-ui-react";
import { AuthContext } from "../../auth/AuthProvider";
import fire from "../../auth/Fire";
import "./Login.css";
import logoWhite from "./logoWhite.png";

function Login(props) {
  const { currentUser } = useContext(AuthContext);

  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();
      const { email, password } = event.target.elements;
      try {
        await fire
          .auth()
          .signInWithEmailAndPassword(email.value, password.value);
        props.history.push("/");
      } catch (error) {
        console.log(error);
        alert(error);
      }
    },
    [props.history]
  );

  if (currentUser) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="accessPanel">
      <Grid columns="2">
        <Grid.Column width="9">
          <div className="loginWindow">
            <h1>Sign in with</h1>
            <Button.Group fluid>
              <Button icon disabled>
                <Icon name="google" /> Google
              </Button>
              <Button.Or />
              <Button icon disabled>
                <Icon name="github" /> Github
              </Button>
            </Button.Group>
            <hr
              className="hr-text"
              data-content="sign in usign frinx.io account"
            />
            <Form onSubmit={handleLogin}>
              <Form.Field>
                <Input iconPosition="left" placeholder="Email" name="email">
                  <Icon name="at" />
                  <input />
                </Input>
              </Form.Field>
              <Form.Field>
                <Input
                  iconPosition="left"
                  placeholder="Password"
                  name="password"
                  type="password"
                >
                  <Icon name="lock" />
                  <input />
                </Input>
              </Form.Field>

              <Button circular primary fluid type="submit" size="large">
                Sign In
              </Button>
            </Form>
            <div style={{ marginTop: "10px" }}>
              <p>
                Don't have an account?{" "}
                <a href="https://frinx.io/register" target="_blank">
                  Register here.
                </a>
              </p>
            </div>
          </div>
        </Grid.Column>
        <Grid.Column className="gradientBg" width="7">
          <div
            style={{
              display: "flex",
              position: "absolute",
              width: "95%",
              height: "95%",
              alignItems: "center",
              justifyContent: "center",
              opacity: "0.6",
            }}
          >
            <img style={{ height: "200px" }} src={logoWhite} />
          </div>

          <Particles
            style={{
              width: "100%",
              height: "100%",
            }}
            height="400px"
            params={{
              particles: {
                number: {
                  value: 10,
                },
                size: {
                  value: 3,
                },
              },
              interactivity: {
                events: {
                  onhover: {
                    enable: true,
                    mode: "repulse",
                  },
                },
              },
            }}
          />
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default withRouter(Login);
