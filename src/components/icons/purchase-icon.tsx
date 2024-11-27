/* eslint-disable react/require-default-props */
interface Prop {
  width?: number;
  height?: number;
}

export function PurchasedIcon({ ...props }: Prop) {
  return <img {...props} src="/mypurchase.png" alt="" />;
}
