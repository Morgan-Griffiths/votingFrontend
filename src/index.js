import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ethers } from "ethers";
import tokenabi from "./token_abi.json";
import votingabi from "./voting_abi.json";
import { TOKEN_ADDRESS, VOTE_ADDRESS } from "./globals";
import MetaMaskOnboarding from "@metamask/onboarding";

const { ethereum } = window;
const isMetaMaskInstalled = Boolean(ethereum && ethereum.isMetaMask);

if (isMetaMaskInstalled) {
  ReactDOM.render(
    <React.StrictMode>
      <App
        account={null}
        tokenContract={null}
        votingContract={null}
        provider={null}
        signer={null}
      />
    </React.StrictMode>,
    document.getElementById("root")
  );
  ethereum
    .request({
      method: "eth_requestAccounts",
    })
    .then((accounts) => {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      console.log(provider);
      console.log(signer);
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
      ReactDOM.render(
        <React.StrictMode>
          <App
            account={ethers.utils.getAddress(accounts[0])}
            tokenContract={tokenContract}
            votingContract={votingContract}
            provider={provider}
            signer={signer}
          />
        </React.StrictMode>,
        document.getElementById("root")
      );
      // window.addEventListener("resize", () => setWidth(window.innerWidth));
    })
    .catch((error) => {
      console.error(error);
    });
} else {
  alert("Metamask not installed");
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
