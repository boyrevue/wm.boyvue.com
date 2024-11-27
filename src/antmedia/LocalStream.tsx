import classnames from 'classnames';
import React from 'react';

export interface HTMLMediaProps
  extends React.AudioHTMLAttributes<any>,
    React.VideoHTMLAttributes<any> {
  id: string;
  classNames?: string;
}

const defaultProps = {
  muted: true,
  controls: false,
  playsInline: true,
  autoPlay: true,
  preload: 'auto'
};

export function LocalStream({
  classNames = '',
  ...props
}: HTMLMediaProps) {
  const ref = React.useRef<HTMLVideoElement>();

  React.useEffect(() => {
    const videoEl = ref.current;
    if (videoEl) {
      videoEl.addEventListener('play', () => {
        // eslint-disable-next-line no-console
        console.log('Pulisher is playing');
      });
    }
  }, []);

  return React.createElement('video', {
    ...defaultProps,
    ...props,
    ref,
    className: classnames('video-js broadcaster', classNames)
  });
}

export default LocalStream;
