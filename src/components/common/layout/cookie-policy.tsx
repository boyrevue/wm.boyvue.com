import {
  Button
} from 'antd';
import { useEffect, useState } from 'react';
import { postService } from 'src/services';

import style from './cookie-policy.module.less';

interface P {
  pId: string;
  hidden: boolean;
  onOk: Function;
}

export default function CookiePolicy({ pId, hidden, onOk }: P) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getCookiePolicyContent = async () => {
      try {
        setLoading(true);
        const resp = await postService.findById(pId);
        setContent(resp.data?.content || '');
      } catch {
        setContent('');
      } finally {
        setLoading(false);
      }
    };
    pId && getCookiePolicyContent();
  }, [pId]);

  if (!loading && content) {
    return (
      <div className={style['cookie-policy']} hidden={hidden}>
        <div className="main-container cookie-box">
          <div className="cookie-content">
            {/* eslint-disable-next-line react/no-danger */}
            <div className="sun-editor-editable" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
          <div className="accept-btn">
            <Button type="primary" onClick={() => onOk()} size="large">
              Accept cookies
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
