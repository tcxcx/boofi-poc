import {MockPyth as MockPythBase} from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";

contract MockTestPyth is MockPythBase {
  constructor(uint _validTimePeriod, uint _singleUpdateFeeInWei) MockPythBase(_validTimePeriod, _singleUpdateFeeInWei) {}
}
