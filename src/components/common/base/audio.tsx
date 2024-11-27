import React from 'react';

interface Props extends React.AudioHTMLAttributes<any> {
  forwardedRef: any;
}

class Audio extends React.PureComponent<Props> {
  render() {
    const { forwardedRef, ...props } = this.props;
    return (
      <audio src="/sounds/default-audio.mp3" ref={forwardedRef} {...props} />
    );
  }
}

export default React.forwardRef<any, Omit<Props, 'forwardedRef'>>(
  (props, ref) => <Audio forwardedRef={ref} {...props} />
);
