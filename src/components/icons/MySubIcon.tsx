/* eslint-disable react/require-default-props */
interface Prop {
  width?: number;
  height?: number;
}

export function MySubIcon({ ...props }: Prop) {
  return <img {...props} src="/mysub.png" alt="" />;
}
