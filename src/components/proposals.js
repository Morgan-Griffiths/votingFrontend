import React, { useMemo, useState, useEffect, Fragment } from "react";
import { CHAIR_ADDRESS, VOTE_ADDRESS } from "../globals";
import { nameLookup } from "./utils";
const erc20_abi = require("../erc20_abi.json");

export function Proposals({ votingContract, accountId, signer, provider }) {
  console.log("Is chair", accountId === CHAIR_ADDRESS);
  const proposalKeys = [
    "ID",
    "Name",
    "TokenNames",
    "Addresses",
    "Weights",
    "Votes",
  ];
  const [numProposals, setNumProposals] = useState([]);
  const [voterAddresses, setVoterAddresses] = useState([]);
  const [proposalData, setProposalData] = useState([]);
  const [voteIdx, setVoteIdx] = useState([]);
  async function getData() {
    console.log("getData");
    if (accountId) {
      console.log("here", accountId);
      let rows = [];
      const numProposalsRaw = await votingContract.proposalCount();
      // let token1 = await provider.getStorageAt(TOKEN_ADDRESS, 10);
      // let token2 = await provider.getStorageAt(TOKEN_ADDRESS, 11);
      // const numProposalsRaw = await votingContract.voterAddresses;
      setNumProposals(parseInt(numProposalsRaw._hex, 16));
      for (let i = 0; i < numProposals; i++) {
        const proposalVals = await votingContract.getProposal(i);
        let name = proposalVals[0];
        let addresses = proposalVals[1];
        let weights = proposalVals[2];
        let tokenNames = [];
        for (let j = 0; j < addresses.length; j++) {
          tokenNames.push(await nameLookup(addresses[j], signer));
        }
        // let votes = proposalVals[3];
        weights = weights.map((value) => Number(value.toString()) / 1e6);
        let votes = parseInt(proposalVals[3], 16);
        console.log("name", name);
        console.log("addresses", addresses);
        console.log("weights", weights);
        console.log("votes", votes);
        console.log("tokenNames", tokenNames);
        rows.push({ name, tokenNames, addresses, weights, votes });
      }
      setProposalData(rows);
    }
  }
  async function vote() {
    console.log(voteIdx, typeof voteIdx);
    try {
      let voteId = Number(voteIdx);
      if (voteId < numProposals && voteId > -1 && voteId % 1 == 0) {
        console.log("valid vote");
        let voted = await votingContract.vote(voteIdx);
        console.log("voted", voted);
      } else {
        alert("Invalid Vote");
      }
    } catch {
      alert("Invalid vote id");
    }
  }
  async function getWinner() {
    try {
      let result = await votingContract.executeProposal();
      console.log("result", result);
    } catch {
      alert("Connect your account");
    }
  }
  async function reset() {
    try {
      let result = await votingContract.reset();
      console.log("reset", result);
    } catch {
      alert("Connect your account");
    }
  }
  useEffect(() => {
    getData();
  }, []);
  return (
    <Fragment>
      <div className="card">
        <h2 className="header">Current Proposals</h2>
        <table className="styled-table">
          <thead>
            <tr>
              {proposalKeys.map((k, i) => (
                <th key={i}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {proposalData.map((row, index) => (
              <tr key={index}>
                <td key={`${index}_index`}>{index}</td>
                <td key={`${index}_name`}>{row.name}</td>
                <td key={`${index}_tokenName`}>
                  {row.tokenNames.map((token) => (
                    <div>{token}</div>
                  ))}
                </td>
                <td key={`${index}_address`}>
                  {row.addresses.map((address) => (
                    <div>{address}</div>
                  ))}
                </td>
                <td key={`${index}_weight`}>
                  {row.weights.map((weight) => (
                    <div>{weight}</div>
                  ))}
                </td>
                <td key={`${index}_votes`}>{row.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="button-row">
          <button onClick={vote}>Vote</button>
          <input
            type="number"
            min="0"
            max={numProposals - 1}
            value={voteIdx}
            placeholder="Proposal Index"
            onChange={(event) => setVoteIdx(event.target.value)}
          />
        </div>
        <div className="button-row">
          <button onClick={getData}>Refresh</button>
          <button
            onClick={getWinner}
            // disabled={true ? accountId == CHAIR_ADDRESS : false}
          >
            Tally votes
          </button>
          <button
            onClick={reset}
            // disabled={true ? accountId == CHAIR_ADDRESS : false}
          >
            Reset
          </button>
        </div>
      </div>
    </Fragment>
  );
}
