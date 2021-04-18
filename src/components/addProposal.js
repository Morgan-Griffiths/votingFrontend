import { BigNumber } from "@ethersproject/bignumber";
import React, { useState, Fragment } from "react";
import { CSVReader } from "react-papaparse";
import * as Papa from "papaparse";
import {
  numberValidation,
  nameValidation,
  weightValidation,
  addressValidation,
  sortAddresses,
} from "./validation";
import { readCSV, nameLookup, findDuplicates, findInvalids } from "./utils";

export function AddProposal({ votingContract, signer }) {
  const proposalKeys = ["Name", "Addresses", "Weights"];
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [weight, setWeight] = useState(0);
  const [tokens, setTokens] = useState([]);
  const errorbag = () => {
    var errorlist = [];
    let wval = weightValidation("weight", weight);
    let aval = addressValidation("address", address);
    if (typeof aval === "string" || aval instanceof String) {
      // error in address, explain error
      errorlist.push("address");
    }
    if (typeof wval === "string" || wval instanceof String) {
      // error in address, explain error
      errorlist.push("weight");
    }
    if (
      (typeof name !== "string" && !(name instanceof String)) ||
      name === ""
    ) {
      errorlist.push("name");
    }
    return errorlist;
  };
  const validation = () => {
    console.log("errors", errorbag());
    if (!errorbag().length) {
      return true;
    }
    return false;
  };
  const getError = (field) => {
    // console.log("field", field);
    if (errorbag().indexOf(field) > -1) {
      return true;
    }
    return false;
  };
  const getErrorMessage = (field) => {
    switch (field) {
      case "name":
        return nameValidation("name", name);
      case "address":
        return addressValidation("address", address);
      case "weight":
        return weightValidation("weight", weight);
    }
  };
  const uploadCSV = async (input) => {
    console.log("input", input);
    let { addresses, weights } = readCSV(input);
    // load into state
    console.log(addresses, weights);
    let names = [];
    for (let i = 0; i < addresses.length; i++) {
      names.push(await nameLookup(addresses[i], signer));
    }
    setTokens([
      ...addresses.map((addy, index) => [names[index], addy, weights[index]]),
    ]);
  };
  const sendProposal = async () => {
    let rawAddresses = [];
    let rawWeights = [];
    tokens.forEach((val, index) => {
      rawAddresses.push(val[1]);
      rawWeights.push(Number(val[2]));
    });
    // make sure no duplicates in rawAddresses
    // Must be at least 2 tokens
    // make sure all rawWeights sum to 1
    // sort rawAddresses and rawWeights
    let weightSum = rawWeights.reduce((a, b) => a + b, 0);
    let dups = findDuplicates(rawAddresses);
    let names = tokens.map((row) => row[0]);
    let invalid = names.includes("Invalid Address");
    console.log(invalid);
    if (weightSum != 1) {
      alert("rawWeights must sum to 1 for a proposal to be valid");
      throw "rawWeights must sum to 1 for a proposal to be valid";
    }
    if (dups.length > 0) {
      alert("Duplicate address");
      throw "Duplicate address";
    }
    if (rawAddresses.length < 2) {
      alert("Must be at least 2 tokens");
      throw "Must be at least 2 tokens";
    }
    if (name === "") {
      alert("Must have a proposal name");
      throw "Must have a proposal name";
    }
    if (invalid) {
      alert("Contains Invalid addresses");
      throw "Contains Invalid addresses";
    }
    var { addresses, weights } = sortAddresses(rawAddresses, rawWeights);
    weights = weights.map((weight) => Number(weight) * 1e6);
    await votingContract.addProposal(name, addresses, weights);
  };
  const addToken = async () => {
    console.log("addToken", validation());
    if (validation()) {
      let name = await nameLookup(address, signer);
      setTokens([...tokens, [name, address, weight]]);
      setAddress("");
      setWeight(0);
    } else {
      // errors
      getError();
    }
  };
  return (
    <Fragment>
      <div className="card">
        <form onSubmit={(event) => event.preventDefault()}>
          <h2 className="header">Add Proposal</h2>
          <div>
            <label className={`${getError("name") ? " error" : ""}`}>
              Proposal Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <p className="validationError">{getErrorMessage("name")} </p>
            </label>
          </div>
          <div className="column-container">
            <label className={`${getError("address") ? " error" : ""} wide`}>
              Address
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
              <p className="validationError">{getErrorMessage("address")}</p>
            </label>
            <label className={`${getError("weight") ? " error" : ""}`}>
              weight
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <p className="validationError">{getErrorMessage("weight")}</p>
            </label>
          </div>
          <div>
            <button onClick={addToken}>Add Token</button>
          </div>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((row, index) => (
                <tr key={index}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td
                    onClick={() =>
                      setTokens([
                        ...tokens.slice(0, index),
                        ...tokens.slice(index + 1),
                      ])
                    }
                  >
                    <a onClick={(event) => event.preventDefault()}>X</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <button onClick={sendProposal}>Send Proposal</button>
          </div>
          <h2>Upload CSV</h2>
          <p>The CSV format must have columns 'Address','Weight'</p>
          <div>
            <CSVReader onFileLoad={uploadCSV} style={{ display: "none" }}>
              <span>Click to upload</span>
            </CSVReader>
          </div>
        </form>
      </div>
    </Fragment>
  );
}
