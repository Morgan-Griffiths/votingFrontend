import { encrypt } from "eth-sig-util";
import { ethers, BigNumber } from "ethers";
import MetaMaskOnboarding from "@metamask/onboarding";
import erc20abi from "../erc20abi.json";
import tokenabi from "../token_abi.json";
import votingabi from "../voting_abi.json";

const TOKEN_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const VOTE_ADDRESS = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
const ACCOUNT_ADDRESS = "0x593729Bf6404Efb0C1056B8bEb639bdBc233114d";

const currentUrl = new URL(window.location.href);
const forwarderOrigin =
  currentUrl.hostname === "localhost" ? "http://localhost:1234" : undefined;

const isMetaMaskInstalled = () => {
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
};
// Dapp Status Section
const networkDiv = document.getElementById("network");
const chainIdDiv = document.getElementById("chainId");
const accountsDiv = document.getElementById("accounts");

let accounts;
let piggybankContract;
let accountButtonsInitialized = false;
let tokenContract;
let votingContract;

// Voting buttons
const addProposalButton = document.getElementById("addProposalButton");
const voteButton = document.getElementById("voteButton");
const addAddressesButton = document.getElementById("addAddressesButton");
const resolveOutcomeButton = document.getElementById("resolveOutcomeButton");
const getProposalsButton = document.getElementById("getProposalsButton");
const getProposalsResult = document.getElementById("getProposalsResult");
const getProposalName = document.getElementById("inputProposalName");
const getTokenDetailsButton = document.getElementById("getTokenDetailsButton");
const tokenWeightsResult = document.getElementById("tokenWeights");
const tokenAddressesResult = document.getElementById("tokenAddresses");
const numTokensResult = document.getElementById("numTokens");
const contractEthResult = document.getElementById("contractEth");
const contractEthBalanceResult = document.getElementById("contractEthBalance");

const numBFITokensResult = document.getElementById("numBFITokens");

const portfolioValueResult = document.getElementById("valuePortfolio");
const sendButton = document.getElementById("sendEthToBFI");
const addTokenButton = document.getElementById("addTokenButton");

const onboardButton = document.getElementById("connectButton");
const getAccountsButton = document.getElementById("getAccounts");
const getAccountsResults = document.getElementById("getAccountsResult");

const initialize = async () => {
  let onboarding;
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin });
  } catch (error) {
    console.error(error);
  }
  let accounts;
  const isMetaMaskConnected = () => accounts && accounts.length > 0;
  const onClickInstall = () => {
    onboardButton.innerText = "Onboarding in progress";
    onboardButton.disabled = true;
    onboarding.startOnboarding();
  };
  const onClickConnect = async () => {
    try {
      const newAccounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      handleNewAccounts(newAccounts);
    } catch (error) {
      console.error(error);
    }
  };
  if (!isMetaMaskInstalled()) {
    onboardButton.innerText = "Click here to install MetaMask!";
    onboardButton.onclick = onClickInstall;
    onboardButton.disabled = false;
  } else if (isMetaMaskConnected()) {
    onboardButton.innerText = "Connected";
    onboardButton.disabled = true;
    if (onboarding) {
      onboarding.stopOnboarding();
    }
  } else {
    onboardButton.innerText = "Connect";
    onboardButton.onclick = onClickConnect;
    onboardButton.disabled = false;
  }
  function handleNewAccounts(newAccounts) {
    accounts = newAccounts;
    accountsDiv.innerHTML = accounts;
    if (isMetaMaskConnected()) {
      initializeAccountButtons();
    }
    // updateButtons();
  }

  async function getNetworkAndChainId() {
    try {
      const chainId = await ethereum.request({
        method: "eth_chainId",
      });
      handleNewChain(chainId);

      const networkId = await ethereum.request({
        method: "net_version",
      });
      handleNewNetwork(networkId);
    } catch (err) {
      console.error(err);
    }
  }
  if (isMetaMaskInstalled()) {
    ethereum.autoRefreshOnNetworkChange = false;
    getNetworkAndChainId();

    ethereum.on("chainChanged", handleNewChain);
    ethereum.on("networkChanged", handleNewNetwork);
    ethereum.on("accountsChanged", handleNewAccounts);

    try {
      const newAccounts = await ethereum.request({
        method: "eth_accounts",
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error("Error on init when getting accounts", err);
    }
  }

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenabi, signer);
  votingContract = new ethers.Contract(VOTE_ADDRESS, votingabi, signer);
  // console.log(Object.getOwnPropertyNames(tokenContract));
  // console.log(Object.getOwnPropertyNames(votingContract));
  getTokenDetailsButton.onclick = async () => {
    try {
      let addresses = await tokenContract.readAddresses({
        from: ACCOUNT_ADDRESS,
      });
      let weights = await tokenContract.readWeights({ from: ACCOUNT_ADDRESS });
      let tokenAmounts = await tokenContract.token_balance(addresses[0]);
      let ethTotal = await tokenContract.ethDeposited();
      let numBFITokens = await tokenContract.totalSupply();
      let ethBalance = ethers.utils.formatEther(
        (await provider.getBalance(TOKEN_ADDRESS)).toString()
      );
      // let valuePortfolio = await tokenContract.valuePortfolio();
      tokenAddressesResult.innerHTML = addresses || "Not able to get accounts";
      tokenWeightsResult.innerHTML = weights || "Not able to get accounts";
      // portfolioValueResult.innerHTML =
      //   valuePortfolio || "Not able to get accounts";
      numTokensResult.innerHTML = tokenAmounts || "Not able to get accounts";
      contractEthResult.innerHTML = ethTotal || "Not able to get accounts";
      numBFITokensResult.innerHTML = numBFITokens || "Not able to get accounts";
      contractEthBalanceResult.innerHTML =
        ethBalance || "Not able to get accounts";
    } catch (err) {
      console.error(err);
      tokenAddressesResult.innerHTML = `Error: ${err.message}`;
      tokenWeightsResult.innerHTML = `Error: ${err.message}`;
      // portfolioValueResult.innerHTML = `Error: ${err.message}`;
      numTokensResult.innerHTML = `Error: ${err.message}`;
      contractEthResult.innerHTML = `Error: ${err.message}`;
      numBFITokensResult.innerHTML = `Error: ${err.message}`;
      contractEthBalanceResult.innerHTML = `Error: ${err.message}`;
    }
  };
  getProposalsButton.onclick = async () => {
    try {
      const _accounts = await ethereum.request({
        method: "eth_accounts",
      });
      getProposalsResult.innerHTML = _accounts[0] || "Not able to get accounts";
    } catch (err) {
      console.error(err);
      getProposalsResult.innerHTML = `Error: ${err.message}`;
    }
  };
  addTokenButton.onclick = async () => {
    var table = document.getElementById("proposalTable");
    let tokenName = document.getElementById("tokenName").value;
    let tokenWeight = document.getElementById("tokenWeight").value;
    let tokenAddress = document.getElementById("tokenAddress").value;
    var row = table.insertRow(1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    // Add some text to the new cells:
    cell1.innerHTML = tokenName;
    cell2.innerHTML = tokenWeight;
    cell3.innerHTML = tokenAddress;
  };
  addProposalButton.onclick = async () => {
    let name = document.getElementById("inputProposalName").value;
    // gets all of the weights and addresses
    let table = document.getElementById("proposalTable");
    console.log(table);
    let names = [];
    let weights = [];
    let addresses = [];
    for (let i = 1; i < table.rows.length; i++) {
      let name = table.rows.item(i).cells.item(0).innerHTML;
      let weight = table.rows.item(i).cells.item(1).innerHTML;
      let address = table.rows.item(i).cells.item(2).innerHTML;
      names.push(name);
      weights.push(weight);
      addresses.push(address);
    }
    // scale weights by 1m
    console.log(name);
    console.log(weights);
    console.log(addresses);
    // validatoin
    names.forEach((element) => {
      element.toUpperCase();
    });
    names.map((x) => x.toUpperCase());
    weights.map((x) => Number(x) * 1e6);
    console.log("name", name);
    console.log("names", names);
    console.log("weights", weights);
    console.log("addresses", addresses);
    // votingContract.addProposal(name, [addresses], [weights]);
  };
  voteButton.onclick = async () => {
    let inputVal = document.getElementById("inputProposalIndex").value;
    console.log("Proposal value", inputVal);
  };
  addAddressesButton.onclick = async () => {
    let inputVal = document.getElementById("inputProposal").value;
    console.log("Proposal value", inputVal);
  };
  resolveOutcomeButton.onclick = async () => {
    let inputVal = document.getElementById("inputProposal").value;
    console.log("Proposal value", inputVal);
  };
};

const initializeAccountButtons = () => {
  if (accountButtonsInitialized) {
    return;
  }
  accountButtonsInitialized = true;
  getAccountsButton.onclick = async () => {
    try {
      const _accounts = await ethereum.request({
        method: "eth_accounts",
      });
      getAccountsResults.innerHTML = _accounts[0] || "Not able to get accounts";
    } catch (err) {
      console.error(err);
      getAccountsResults.innerHTML = `Error: ${err.message}`;
    }
  };
};
function handleNewChain(chainId) {
  chainIdDiv.innerHTML = Number(chainId);
}

function handleNewNetwork(networkId) {
  let networkDict = {
    1: "Ethereum Mainnet",
    3: "Ropsten Test Network",
    4: "Rinkeby Test Network",
    5: "Goerli Test Network",
    42: "Kovan Test Network",
  };
  networkDiv.innerHTML = networkDict[networkId];
}

window.addEventListener("DOMContentLoaded", initialize);
