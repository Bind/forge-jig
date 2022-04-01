import { utils } from 'ethers';
import { ethers } from 'ethers';

export const hash = (mappingSlot: number, key: number) => {
  const encoder = ethers.utils.defaultAbiCoder;

  return utils.keccak256(
    encoder.encode(['uint256', 'uint256'], [key, mappingSlot])
  );
};

export const encoder = (...params: any[]) => {
  const types = params;
  return (...params: any[]) => {
    const terms = params;
    const abiEncoder = ethers.utils.defaultAbiCoder;
    return utils.keccak256(abiEncoder.encode(types, terms));
  };
};
