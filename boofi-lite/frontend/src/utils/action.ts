export enum MoneyMarketAction {
  Lend = 'lend',
  Borrow = 'borrow',
  Repay = 'repay',
  Withdraw = 'withdraw',
}

export enum HubActionEnum {
  Deposit = 0,
  Borrow = 1,
  Repay = 2,
  Withdraw = 3,
}

export const actionFunctionMap: { [key in MoneyMarketAction]: string } = {
  [MoneyMarketAction.Lend]: 'depositCollateral',
  [MoneyMarketAction.Borrow]: 'borrow',
  [MoneyMarketAction.Repay]: 'repay',
  [MoneyMarketAction.Withdraw]: 'withdrawCollateral',
};
