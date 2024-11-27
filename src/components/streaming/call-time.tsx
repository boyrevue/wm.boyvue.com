import { useEffect, useRef, useState } from 'react';

interface ICallTimeProps {
  start?: boolean
}

export function CallTime({
  start = false
}: ICallTimeProps) {
  const [sec, setSec] = useState(0);
  const currentSec = useRef(0);
  const timeout = useRef(null);

  const setTime = () => {
    if (timeout.current) clearTimeout(timeout.current);
    currentSec.current += 1;
    setSec(currentSec.current);
    timeout.current = setTimeout(setTime, 1000);
  };

  // eslint-disable-next-line no-param-reassign, no-return-assign
  const fmtMSS = (s) => {
    const date = new Date(0);
    date.setSeconds(s); // specify value for SECONDS here
    return date.toISOString().substring(11, 19);
  };

  useEffect(() => {
    if (!start) {
      if (timeout.current) clearTimeout(timeout.current);
      return;
    }

    setTime();
    // eslint-disable-next-line consistent-return
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [start]);

  return (
    <span>
      {fmtMSS(sec)}
    </span>
  );
}

export default CallTime;
