/* eslint-disable react/require-default-props */
interface Prop {
  width?: number;
  height?: number;
}

export function MyFovoritesIcon({ ...props }: Prop) {
  return <img {...props} src="/myfovorites.png" alt="" />;
}
