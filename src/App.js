import React, { useState } from "react";
import Login from "./components/Login";
import { indexerClient, myAlgoConnect } from "./utils/constants";
import { Notification } from "./components/utils/Notifications";
import Home from "./components/Home";

const App = function AppWrapper() {
  const [address, setAddress] = useState(null);
  const [name, setName] = useState(null);
  const [balance, setBalance] = useState(0);

  const fetchBalance = async (accountAddress) => {
      try {
          const response = await indexerClient
              .lookupAccountByID(accountAddress)
              .do()

          if (!response) return

          const _balance = response.account.amount;
          setBalance(_balance);

      } catch (error) {
          console.log(error);
      }

  };

  const connectWallet = async () => {
      try {
          const accounts = await myAlgoConnect
              .connect()

          const _account = accounts[0];
          setAddress(_account.address);
          setName(_account.name);
          fetchBalance(_account.address);

      } catch (error) {
          console.log("Could not connect to MyAlgo wallet");
          console.error(error);
      }

  };

  const disconnect = () => {
    setAddress(null);
    setName(null);
    setBalance(null);
  };

  return (
    <>
      <Notification />
      {address ? (
        <div className="">
          <Home
            address={address}
            name={name}
            balance={balance}
            disconnect={disconnect}
            fetchBalance={fetchBalance}
          />
        </div>
      ) : (
        <Login connect={connectWallet} />
      )}
    </>
  );
};

export default App;
