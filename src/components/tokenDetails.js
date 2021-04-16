import React, { useMemo, useState, useEffect, Fragment } from "react";
import { BigNumber, ethers } from "ethers";
import { TOKEN_ADDRESS } from "../globals";
import { MAINNET, RINKEBY, ROPSTEN } from "../tokenAddresses";
import { nameLookup } from "./utils";
const erc20_abi = require("../erc20_abi.json");

export function TokenDetails({ tokenContract, provider, signer, accountId }) {
  const network_dict = {
    rinkeby: RINKEBY,
    mainnet: MAINNET,
    ropsten: ROPSTEN,
  };
  const tableKeys = ["Name", "Addresses", "Weights", "Balance"];
  const [tokenData, setTokenData] = useState([]);
  const [depositAmount, setDepositAmount] = useState([]);
  const [depositERCAmount, setDepositERCAmount] = useState([]);
  const [depositERCAddress, setDepositERCAddress] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState([]);
  const [tokenRow, setTokenRow] = useState([]);
  const [tokenAttrs, setTokenAttrs] = useState({});
  let tokenDict;
  async function getTokenData() {
    console.log(typeof tokenContract, tokenContract);
    if (tokenContract != null) {
      // let ethTotal = ethers.utils.formatEther(
      //   (await tokenContract.ethDeposited()).toString()
      // );
      let numBFITokens = ethers.utils.formatEther(
        (await tokenContract.totalSupply()).toString()
      );
      // let portfolioValue = await tokenContract.valuePortfolio();
      let tAddresses = await tokenContract.readAddresses();
      let tWeights = await tokenContract.readWeights();
      let contractBalance = ethers.utils.formatEther(
        (await provider.getBalance(TOKEN_ADDRESS)).toString()
      );

      tWeights = tWeights.map((x) => Number(x.toString()) / 1e6);
      // tWeights = tWeights.forEach((x) => console.log(x, x.toString()));
      // tWeights = tWeights.forEach((x) => x.toString());
      console.log("tAddresses", tAddresses);
      console.log("tWeights", tWeights);
      // console.log("ethTotal", ethTotal);
      console.log("numBFITokens", numBFITokens);
      console.log("contractBalance", contractBalance);
      let tNames = [];
      let tBalances = [];
      for (let i = 0; i < tAddresses.length; i++) {
        tNames.push(await nameLookup(tAddresses[i], signer));
        let heldToken = new ethers.Contract(tAddresses[i], erc20_abi, signer);
        let balance = await heldToken.balanceOf(tokenContract.address);
        tBalances.push(
          parseFloat(ethers.utils.formatEther(balance.toString())).toFixed(2)
        );
      }
      console.log(tBalances);
      setTokenRow([
        ...tNames.map((name, index) => [
          name,
          tAddresses[index],
          tWeights[index],
          tBalances[index],
        ]),
      ]);
      setTokenAttrs({
        // ethTotal: ethTotal,
        numBFITokens: numBFITokens,
        contractBalance,
      });
    }
  }
  async function depositEth() {
    console.log(typeof parseFloat(depositAmount), parseFloat(depositAmount));
    let value = ethers.utils.parseEther(depositAmount);
    let gasPrice = BigNumber.from(10).pow(9);
    let gasLimit = BigNumber.from(10).pow(6);
    let result = await tokenContract.deposit({ value, gasPrice, gasLimit });
    console.log(await result.wait());
  }
  async function depositERC20() {
    let amnt = BigNumber.from(depositERCAmount);
    let address = depositERCAddress;
    console.log("amnt", amnt, typeof amnt);
    console.log("address", address);
    console.log("accountId", accountId);
    const token = new ethers.Contract(depositERCAddress, erc20_abi, signer);
    let token_balance = await token.balanceOf(accountId);
    console.log("token_balance", token_balance);
    await token.approve(TOKEN_ADDRESS, token_balance);
    // let value = BigNumber.from(10).pow(17);
    // let gasPrice = BigNumber.from(10).pow(9);
    // let gasLimit = BigNumber.from(10).pow(6);
    let result = await tokenContract.depositToken(amnt, address);
    console.log(await result.wait());
  }
  async function withdraw() {
    let value = ethers.utils.parseEther(withdrawAmount);
    let gasPrice = BigNumber.from(10).pow(9);
    let gasLimit = BigNumber.from(10).pow(6);
    let result = await tokenContract.withdraw(value, { gasPrice, gasLimit });
    console.log(await result.wait());
  }
  async function withdrawTokens() {
    let value = BigNumber.from(10).pow(17);
    let gasPrice = BigNumber.from(10).pow(1);
    let gasLimit = BigNumber.from(10).pow(6);
    let result = await tokenContract.withdrawRaw();
    console.log(await result.wait());
  }
  useEffect(() => {
    getTokenData();
  }, []);
  return (
    <Fragment>
      <div className="card">
        <h2 className="header">Token Details</h2>
        <button onClick={getTokenData}>Refresh</button>
        <div>
          <ul>
            <li>Number of outstanding BFI tokens: {tokenAttrs.numBFITokens}</li>
            <li>Contract ETH balance: {tokenAttrs.contractBalance}</li>
            {/* <p>Portfolio value (in ETH){tokenAttrs.portfolioValue}</p> */}
          </ul>
        </div>
        <table className="styled-table">
          <thead>
            <tr>
              {tableKeys.map((k, i) => (
                <th key={i}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokenRow.map((row, index) => (
              <tr key={index}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="button-row">
          <button onClick={depositEth}>Deposit</button>
          <input
            type="number"
            step="0.1"
            min="0"
            value={depositAmount}
            placeholder="Amount of eth"
            onChange={(event) => setDepositAmount(event.target.value)}
          />
        </div>
        <div className="button-row">
          <button onClick={depositERC20}>Deposit ERC20</button>
          <input
            type="number"
            step="0.1"
            min="0"
            value={depositERCAmount}
            placeholder="Token amount"
            onChange={(event) => setDepositERCAmount(event.target.value)}
          />
          <input
            value={depositERCAddress}
            placeholder="Token address"
            onChange={(event) => setDepositERCAddress(event.target.value)}
          />
        </div>
        <div className="button-row">
          <button onClick={withdraw}>Withdraw</button>
          <input
            type="number"
            step="0.1"
            min="0"
            value={withdrawAmount}
            placeholder="Number of BFI tokens"
            onChange={(event) => setWithdrawAmount(event.target.value)}
          />
        </div>
        <button onClick={withdrawTokens}>Withdraw Tokens</button>
      </div>
    </Fragment>
  );
}
