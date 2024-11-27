/* eslint-disable react/require-default-props */
interface Prop {
  width?: number;
  height?: number;
}

export function HeartIcon({ ...props }: Prop) {
  return <img {...props} src="/mywishlist.png" alt="" />;
}
