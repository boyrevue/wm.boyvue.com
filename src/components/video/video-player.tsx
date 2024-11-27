import 'video.js/dist/video-js.min.css';

import { useIsInViewport } from '@lib/hooks';
import { setVideoPlaying } from '@redux/video/actions';
import {
  forwardRef, useEffect, useImperativeHandle, useRef, useState
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import videojs from 'video.js';

export function VideoPlayer({
  pauseHiddenVideo = false, id, muted = false, ...props
}: any, ref) {
  const videoNode = useRef<HTMLVideoElement>(null);
  const player = useRef<videojs.Player | null>(null);
  const isIntersecting = useIsInViewport(videoNode);
  const [isPlayed, setIsPlay] = useState(false);
  const dispatch = useDispatch();
  const playingVideo = useSelector((state: any) => state.video.playingVideo);

  const handleOnPlay = () => {
    if (isPlayed) return;
    setIsPlay(true);
    const { onPlay } = props;
    if (onPlay) onPlay();
    dispatch(setVideoPlaying(id));

    if (pauseHiddenVideo) {
      const videos = document.querySelectorAll<HTMLVideoElement>(`video:not(video[data-id=video-${id}])`);
      videos.forEach((video) => video.pause());
    }
  };

  const stop = () => {
    setIsPlay(false);
  };

  useEffect(() => {
    player.current = videojs(videoNode.current, { ...props, autoplay: false, muted } as any);
    player.current.addClass('video-js');
    player.current.on('play', handleOnPlay);
    player.current.on('ended', stop);
    player.current.on('error', stop);

    return () => {
      if (player.current) {
        player.current.off('play', handleOnPlay);
        player.current.off('ended', stop);
        player.current.off('error', stop);
        player.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (playingVideo && playingVideo !== id) {
      player.current?.pause();
    }
  }, [playingVideo]);

  useEffect(() => {
    if (isIntersecting) {
      // disable to auto load if needed
      // player.current && player.current.load();
    } else {
      // if not in the viewport, stop playing
      player.current && player.current.pause();
      // TODO - check to dispose
    }
  }, [isIntersecting]);

  useImperativeHandle(ref, () => ({
    pause: () => {
      player.current && player.current.pause();
    }
  }));

  return (
    <div className="videojs-player">
      <div data-vjs-player>
        <video preload="none" autoPlay={false} muted={muted} data-id={`video-${id}`} disablePictureInPicture data-setup='{"controlBar": {"pictureInPictureToggle": false}}' ref={videoNode} className="video-js" />
      </div>
    </div>
  );
}
export default forwardRef(VideoPlayer);
