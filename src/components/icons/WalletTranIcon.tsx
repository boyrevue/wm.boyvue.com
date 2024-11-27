/* eslint-disable react/require-default-props */
interface Prop {
  width?: number;
  height?: number;
}

export function WalletTranIcon({ ...props }: Prop) {
  return <img {...props} src="/wallettran.png" alt="" />;
}
