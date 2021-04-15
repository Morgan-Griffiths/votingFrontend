import axios from "axios";

export const tokenLookup = async (tokenAddress) => {
  console.log("axios", axios);
  let url = `https://etherscan.io/token/${tokenAddress}`;
  let response = await axios.get(url);
  console.log(response);
};
