/* eslint-disable react/require-default-props */
interface Prop {
  width?: number;
  height?: number;
}

export function ContactIcon({ ...props }: Prop) {
  return <img {...props} src="/contact.png" alt="" />;
}
