import { useEffect, useRef, useState } from 'react';

export interface IProps {
  toDate: string | Date;
  expiredText?: string;
}

export function Countdown({
  toDate,
  expiredText = 'Expired'
}: IProps) {
  const [data, setData] = useState<Record<string, any>>({});
  const timeout = useRef(null);
  const countDownDate = new Date(toDate).getTime();

  const countdown = () => {
    const now = new Date().getTime();

    // Find the distance between now and the count down date
    const distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setData({
      days,
      hours: hours < 10 ? `${hours}`.padStart(2, '0') : hours,
      minutes: minutes < 10 ? `${minutes}`.padStart(2, '0') : minutes,
      seconds: seconds < 10 ? `${seconds}`.padStart(2, '0') : seconds
    });

    timeout.current = setTimeout(countdown, 1000);
  };

  useEffect(() => {
    if (!toDate) return;

    if (new Date().getTime() - countDownDate > 0) return;

    countdown();

    // eslint-disable-next-line consistent-return
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [toDate]);

  if (!toDate || new Date().getTime() - countDownDate > 0) return <span>{expiredText}</span>;

  return (
    <span>
      {data.days > 0 && <span>{`${data.days.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')} ${data.days > 1 ? 'days' : 'day'}`}</span>}
      {` ${data.hours}:${data.minutes}:${data.seconds}`}
    </span>
  );
}
