import "./App.css";
import React, { useMemo, useState, useEffect } from "react";
import { ethers } from "ethers";
import { data } from "./data";
import { Proposals } from "./components/proposals";
import { AddProposal } from "./components/addProposal";
import { TokenDetails } from "./components/tokenDetails";

function App({ account, votingContract, tokenContract, provider, signer }) {
  const tableKeys = ["Name", "Addresses", "Weights"];
  const [tokenData, setTokenData] = useState([]);
  const [tableData, setTableData] = useState(data);
  // let ethTotal = await tokenContract.ethDeposited();
  // let numBFITokens = await tokenContract.totalSupply();
  // let ethBalance = ethers.utils.formatEther(
  //   (await provider.getBalance(TOKEN_ADDRESS)).toString()
  // );
  return (
    <div className="App">
      <div className="card">
        <h1>Account Details</h1>
        Address: {account}
      </div>
      <AddProposal votingContract={votingContract} signer={signer} />
      <Proposals
        votingContract={votingContract}
        accountId={account}
        signer={signer}
        provider={provider}
      />
      <TokenDetails
        tokenContract={tokenContract}
        provider={provider}
        signer={signer}
        accountId={account}
      />
    </div>
  );
}

export default App;
