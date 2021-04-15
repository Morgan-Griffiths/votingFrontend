import { ethers } from "ethers";
const erc20_abi = require("../erc20_abi.json");

export const findDuplicates = (addresses) =>
  addresses.filter((item, index) => addresses.indexOf(item) != index);

export const findInvalids = (names) =>
  names.filter((name) => name == "Invalid Address");

const export_csv = (arrayHeader, arrayData, delimiter, fileName) => {
  let header = arrayHeader.join(delimiter) + "\n";
  let csv = header;
  arrayData.forEach((array) => {
    csv += array.join(delimiter) + "\n";
  });

  let csvData = new Blob([csv], { type: "text/csv" });
  let csvUrl = URL.createObjectURL(csvData);

  let hiddenElement = document.createElement("a");
  hiddenElement.href = csvUrl;
  hiddenElement.target = "_blank";
  hiddenElement.download = fileName + ".csv";
  hiddenElement.click();
};

export async function nameLookup(addy, signer) {
  let name;
  try {
    let coin = new ethers.Contract(addy, erc20_abi, signer);
    name = await coin.name();
  } catch (e) {
    console.log(e);
    name = "Invalid Address";
  }
  return name;
}

export function readCSV(input) {
  let row;
  let parsed = {
    addresses: [],
    weights: [],
  };
  let headers = {
    Address: -1,
    Weight: -1,
  };
  let first = input[0].data;
  for (let i = 0; i < input.length; i++) {
    if (first[i] == "Address" || first[i] == "Weight") {
      headers[first[i]] = i;
    }
  }
  for (let rowIdx = 1; rowIdx < input.length; rowIdx++) {
    row = input[rowIdx].data;
    if (row[headers.Address] !== "") {
      parsed.addresses.push(row[headers.Address]);
      parsed.weights.push(row[headers.Weight]);
    }
  }
  return parsed;
}
