import React from "react";

const Login = ({ connect }) => {
  return (
    <div className="card" id="login">
      <div className="card-content">
        <h3>
          <i className="small material-icons">description</i>
          Requestss
        </h3>
        <div className="section">
          <p className="lead">
            Make your requests and have people donate to your requests.
          </p>
        </div>
        <div className="divider" />
        <div className="section">
          <button className="btn red darken-1" onClick={() => connect()}>
            Connect Wallet to Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
