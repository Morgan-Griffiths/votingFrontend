import React, { useMemo, useState, useEffect, Fragment } from "react";
import { CHAIR_ADDRESS, VOTE_ADDRESS } from "../globals";

export function Proposals({ votingContract, accountId, provider }) {
  console.log(
    "Is chair",
    accountId,
    CHAIR_ADDRESS,
    accountId === CHAIR_ADDRESS
  );
  const proposalKeys = ["ID", "Name", "Addresses", "Weights", "Votes"];
  const [numProposals, setNumProposals] = useState([]);
  const [voterAddresses, setVoterAddresses] = useState([]);
  const [proposalData, setProposalData] = useState([]);
  const [voteIdx, setVoteIdx] = useState([]);
  async function getData() {
    if (votingContract != null) {
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
        // let votes = proposalVals[3];
        weights = weights.map((value) => Number(value.toString()) / 1e6);
        let votes = parseInt(proposalVals[3], 16);
        console.log("name", name);
        console.log("addresses", addresses);
        console.log("weights", weights);
        console.log("votes", votes);
        rows.push({ name, addresses, weights, votes });
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
    let result = await votingContract.executeProposal();
    console.log("result", result);
  }
  async function reset() {
    let result = await votingContract.reset();
    console.log("reset", result);
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
                <td>{index}</td>
                <td>{row.name}</td>
                <td>
                  {row.addresses.map((address) => (
                    <div>{address}</div>
                  ))}
                </td>
                <td>
                  {row.weights.map((weight) => (
                    <div>{weight}</div>
                  ))}
                </td>
                <td>{row.votes}</td>
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
