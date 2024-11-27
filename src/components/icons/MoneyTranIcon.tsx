/* eslint-disable react/require-default-props */
interface Prop {
  width?: number;
  height?: number;
}

export function MoneyTranIcon({ ...props }: Prop) {
  return <img {...props} src="/moneytran.png" alt="" />;
}
