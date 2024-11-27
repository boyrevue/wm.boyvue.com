import { message } from 'antd';
import { useEffect } from 'react';

import style from './sound.module.less';

type IProps = {
  soundUrl?: string;
}

export function SoundComponent({
  soundUrl = ''
}: IProps) {
  useEffect(() => {
    const audio = document.getElementById('audio');

    if (!audio) {
      const A = document.createElement('audio');
      A.setAttribute('src', soundUrl || '/sounds/default-audio.mp3');
      A.setAttribute('id', 'audio');
      const container = document.querySelector('.sound-player');
      container.append(A);
    }
  }, []);

  return <div className={style['sound-player']} />;
}

SoundComponent.play = () => {
  const audio = document.getElementById('audio') as HTMLMediaElement;
  if (audio) {
    try {
      audio.play();
    } catch (e) {
      message.error('Sound play failed. Interact with the document first!', 60);
    }
  }
};

export default SoundComponent;
