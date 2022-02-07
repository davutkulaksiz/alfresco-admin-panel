import React from "react";
import { useHistory } from "react-router";
import Logo from "../Logo/Logo";
import LoginForm from "../LoginForm/LoginForm";
import Info from "../Info/Info";
import logout from "../../assets/log-out.svg";
import Operations from "../Operations/Operations"
import "./Sidebar.css";

const Sidebar = ({ type }) => {
  const history = useHistory();


  // page type checking for rendering correct component
  let isLogin = type === "login" ? true : false;
  let isDemo = type === "demo" ? true : false;

  const handleClick = (path) => {
    // Token gets removed when clicked on Logout button
    sessionStorage.removeItem("token");
    history.push(path);
  };

  return (
    <div className="sidebar-container">
      {isLogin && (
        <>
          <Logo text="Alfresco API Project" />
          <LoginForm />
          <div></div>
          <Info />
        </>
      )}
      {isDemo && (
        <>
          <div
            className="logoutContainer"
            onClick={() => handleClick("/login")}
          >
            <div className="logout-text">Log Out</div>
            <img src={logout} alt="Log Out" />
          </div>
          <Logo text="Alfresco API Project" />
          <Operations />
        </>
      )}
    </div>
  );
};

export default Sidebar;
