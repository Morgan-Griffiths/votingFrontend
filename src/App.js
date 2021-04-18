import "./App.css";
import React, { useState, useEffect } from "react";
import { TOKEN_ADDRESS, VOTE_ADDRESS } from "./globals";
import { ethers } from "ethers";
import { data } from "./data";
import { Proposals } from "./components/proposals";
import { AddProposal } from "./components/addProposal";
import { TokenDetails } from "./components/tokenDetails";
import tokenabi from "./token_abi.json";
import votingabi from "./voting_abi.json";
import MetaMaskOnboarding from "@metamask/onboarding";

const { ethereum } = window;
const isMetaMaskInstalled = Boolean(ethereum && ethereum.isMetaMask);

function App() {
  const [data, setData] = useState({});

  const connect = async () => {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    if (accounts) {
      let account = ethers.utils.getAddress(accounts[0]);
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        tokenabi,
        signer
      );
      const votingContract = new ethers.Contract(
        VOTE_ADDRESS,
        votingabi,
        signer
      );
      setData({ account, provider, signer, tokenContract, votingContract });
    }
  };

  useEffect(() => {
    if (isMetaMaskInstalled) {
      console.log("connecting...");
      connect();
    } else {
      alert("Metamask not installed");
    }
  }, []);

  return (
    <div className="App">
      <div className="card">
        <div className="column-container">
          <div>
            <h1>Account Details</h1>
            Address: {data.account}
          </div>
          <button
            onClick={connect}
            style={{ margin: "5px", marginLeft: "25px" }}
          >
            Connect
          </button>
        </div>
      </div>
      <AddProposal votingContract={data.votingContract} signer={data.signer} />
      <Proposals
        votingContract={data.votingContract}
        accountId={data.account}
        signer={data.signer}
        provider={data.provider}
      />
      <TokenDetails
        tokenContract={data.tokenContract}
        provider={data.provider}
        signer={data.signer}
        accountId={data.account}
      />
    </div>
  );
}

export default App;
