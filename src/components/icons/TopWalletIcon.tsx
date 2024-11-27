/* eslint-disable react/require-default-props */
interface Prop {
  width?: number;
  height?: number;
}

export function TopWalletIcon({ ...props }: Prop) {
  return <img {...props} src="/topupwallet.png" alt="" />;
}
