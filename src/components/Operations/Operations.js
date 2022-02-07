import React from "react";
import { useState } from "react";
import { Redirect } from "react-router-dom";
import Input from "../Input/Input";
import Button from "../Button/Button";
import tick from "../../assets/tick.svg";
import denied from "../../assets/denied.svg";
import Loader from "../Loader/Loader";
import "./Operations.css";

const Operations = () => {
  const [users, setUsers] = useState([]);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showFirstPage, setShowFirstPage] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");

  const token = sessionStorage.getItem("token");

  const resetErrors = () => {
    /**
     * Have to remove previous warnings in case of sequential searches
     */

    if (showError === true) {
      setShowError(false);
    }

    if (registered === true) {
      setRegistered(false);
    }

    if (emailError === true) {
      setEmailError(false);
    }

    if (usernameError === true) {
      setUsernameError(false);
    }
  };

  const setInitialStates = () => {
    setUsername("");
    setFirstname("");
    setLastname("");
    setEmail("");
    setPassword("");
  };

  const validateEmail = (email) => {
    const validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    const ok = validRegex.exec(email);

    if (ok) {
      return true;
    } else {
      return false;
    }
  };

  const checkUsername = (name) => {
    const opts = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };

    fetch(`http://127.0.0.1:8080/alfresco/s/api/people/${name}`, opts).then(
      (res) => {
        if (res.status === 404) {
          return false;
        } else {
          return true;
        }
      }
    );
  };

  const addUser = (event) => {
    event.preventDefault();

    console.log(username, password, firstname, lastname, email);
    setLoading(true);
    const opts = {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        userName: username,
        firstName: firstname,
        lastName: lastname,
        email: email,
        password: password,
      }),
    };

    resetErrors();
    if (validateEmail(email)) {
      if (checkUsername(username)) {
        fetch(
          `http://127.0.0.1:8080/alfresco/s/api/people?alf_ticket=${token}`,
          opts
        )
          .then((res) => {
            if (res.status === 200) {
              return res.json();
            } else {
              throw new Error("Promise Chain Cancelled");
            }
          })
          .then((data) => {
            setLoading(false);
            setRegistered(true);
            setShowUsers(false);
          })
          .catch((error) => {
            setLoading(false);
            console.error("There's an error", error);
          });
      } else {
        setUsernameError(true);
      }
    } else {
      setEmailError(true);
    }

    setInitialStates();
  };

  const deleteUser = (userName, event) => {
    let willDelete = window.confirm("Are you sure to delete this user?");

    if (willDelete) {
      // Loaders start
      setLoading(true);
      const opts = {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
        },
      };

      resetErrors();
      fetch(
        `http://127.0.0.1:8080/alfresco/s/api/people/${userName}?alf_ticket=${token}`,
        opts
      )
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error("Promise Chain Cancelled");
          }
        })
        .then((data) => {
          setShowUsers(false);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.error("There's an error", error);
        });

      alert("User is deleted");
    } else {
      event.preventDefault();
    }
  };

  // will be used to filter out admin user
  const isAdmin = (value) => {
    if (value.userName === "admin") {
      return false;
    }
    return value;
  };

  const handleUserSearch = (event) => {
    event.preventDefault();
    // Loaders start
    setLoading(true);

    const opts = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };

    resetErrors();
    fetch("http://127.0.0.1:8080/alfresco/s/api/people?", opts)
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          // will be handled in future
          if (showError === false) {
            setShowError(true);
          }
          setLoading(false);
          throw new Error("Promise Chain Cancelled");
        }
      })
      .then((data) => {
        setUsers([...data["people"]]);
        setLoading(false);
        setShowUsers(true); // users will be shown
      })
      .catch((error) => {
        setLoading(false);
        console.error("There's an error", error);
      });
  };

  return (
    <div className="validation">
      {!token || token === "" || token === undefined ? (
        <Redirect to="/login" />
      ) : showFirstPage ? (
        <>
          <h3>Add User</h3>
          <p className="info-paragraph">
            Add a user to Alfresco system by filling required information.
          </p>
        </>
      ) : (
        <>
          <h3>List Users</h3>
          <p className="info-paragraph">
            Get a list of all users except admin & guest.
          </p>
          <h3>Delete Users</h3>
          <p className="info-paragraph">
            Delete a user by clicking the button next to username.
          </p>
        </>
      )}
      {showError && (
        <h4 className="error">
          Internal Server Error! Please, try again later.
        </h4>
      )}
      {!showFirstPage ? (
        showUsers ? (
          <>
            <div className="category">
              <div className="scrollbar">
                {loading && <Loader />}
                {!loading && users.length > 2 ? (
                  users
                    .slice(1)
                    .filter(isAdmin)
                    .map((user, index) => (
                      <div className="checker" key={index}>
                        <h4>{user.userName}</h4>
                        <img
                          className="delete-user-image"
                          src={denied}
                          alt="denied"
                          onClick={() => deleteUser(user.userName)}
                        />
                      </div>
                    ))
                ) : (
                  <p>
                    <span id="no-domain">No User Found!</span> <br />
                    <br />
                    Couldn't find any user that registered to Alfresco Document
                    Management other than admin.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          !loading && (
            <Button
              text="Search Users"
              type="submit"
              buttonType="btn"
              onClick={handleUserSearch}
            />
          )
        )
      ) : (
        <>
          {registered && (
            <>
              <span id="registered">Successfully Registered!</span>
              <br />
            </>
          )}
          {emailError && (
            <>
              <span id="no-domain">Please Enter a Valid Email!</span>
            </>
          )}
          {usernameError && (
            <>
              <span id="no-domain">Username already exists!</span>
            </>
          )}
          <Input
            type="text"
            id="username"
            placeholder="Username"
            onChange={(event) => setUsername(event.target.value)}
            value={username}
          />
          <Input
            type="password"
            id="password"
            placeholder="Password"
            onChange={(event) => setPassword(event.target.value)}
            value={password}
          />
          <Input
            type="text"
            id="firstname"
            placeholder="First Name"
            onChange={(event) => setFirstname(event.target.value)}
            value={firstname}
          />
          <Input
            type="text"
            id="lastname"
            placeholder="Last Name"
            onChange={(event) => setLastname(event.target.value)}
            value={lastname}
          />
          <Input
            type="email"
            id="email"
            placeholder="Email"
            onChange={(event) => setEmail(event.target.value)}
            value={email}
          />
          <Button
            text="Register User"
            type="submit"
            buttonType="btn btn-success"
            onClick={addUser}
          />
        </>
      )}
      {showFirstPage ? (
        <div className="buttons">
          <Button
            text=""
            buttonType="pagination-btn"
            onClick={() => {
              setShowFirstPage(false);
              resetErrors();
            }}
          />
          <Button
            text=""
            buttonType="pagination-btn pagination-btn-active"
            onClick={() => {}}
          />
        </div>
      ) : (
        <div className="buttons">
          <Button
            text=""
            buttonType="pagination-btn pagination-btn-active"
            onClick={() => {}}
          />
          <Button
            text=""
            buttonType="pagination-btn"
            onClick={() => {
              setShowFirstPage(true);
              resetErrors();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Operations;
