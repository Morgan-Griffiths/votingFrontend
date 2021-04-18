const { SHA3 } = require("sha3");
const { ethers } = require("ethers");

export const nameValidation = (fieldName, fieldValue) => {
  if (fieldValue === "") {
    return `${fieldName} is required`;
  }
  if (!/^[a-zA-Z\s]$/i.test(fieldValue)) {
    return "Invalid name characters";
  }
  return null;
};

export const tokenInputValidation = (value) => {
  let re = /^[\d\.]*$/;
  return re.test(value);
};

export const numberValidation = (fieldName, fieldValue) => {
  if (parseFloat(fieldValue) == 0 || fieldValue === "") {
    return `${fieldName} is required`;
  }
  return null;
};

export const weightValidation = (fieldName, fieldValue) => {
  if (parseFloat(fieldValue) == 0 || fieldValue === "") {
    return `${fieldName} must be greater than 0`;
  }
  if (parseFloat(fieldValue) < 0 || parseFloat(fieldValue) > 1) {
    return `${fieldName} has to be between 0 and 1`;
  }
  return null;
};
export const addressValidation = (fieldName, fieldValue) => {
  // console.log(fieldName, fieldValue);
  if (fieldValue === "") {
    return `${fieldName} is required`;
  }
  if (!/^0x[0-9a-fA-F]{40}$/i.test(fieldValue)) {
    return "Invalid address characters";
  }
  if (fieldValue.length != 42) {
    return `${fieldName} needs 42 characters`;
  }
  try {
    ethers.utils.getAddress(fieldValue);
  } catch {
    return `${fieldName} is not checksummed`;
  }
  return null;
};

function checksum(address) {
  // Check each case
  address = address.replace("0x", "");
  var addressHash = new SHA3(address.toLowerCase());
  for (var i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (
      (parseInt(addressHash[i], 16) > 7 &&
        address[i].toUpperCase() !== address[i]) ||
      (parseInt(addressHash[i], 16) <= 7 &&
        address[i].toLowerCase() !== address[i])
    ) {
      return false;
    }
  }
  return true;
}

export function sortAddresses(addresses, weights) {
  //1) combine the arrays:
  var list = [];
  for (var j = 0; j < addresses.length; j++)
    list.push({ address: addresses[j], weight: weights[j] });
  // 2) sort:
  list.sort(function (a, b) {
    console.log(a, b);
    return parseInt(a.address, 16) < parseInt(b.address, 16)
      ? -1
      : parseInt(a.address, 16) == parseInt(b.address, 16)
      ? 0
      : 1;
  });

  //3) separate them back out:
  for (var k = 0; k < list.length; k++) {
    addresses[k] = list[k].address;
    weights[k] = list[k].weight;
  }
  console.log(list);
  console.log(addresses);
  console.log(weights);
  return { addresses, weights };
}
