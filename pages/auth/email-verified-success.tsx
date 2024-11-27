import SeoMetaHead from '@components/common/seo-meta-head';
import {
  Layout
} from 'antd';
import Link from 'next/link';

import style from './email-verified-success.module.less';

function EmailVerifiedSuccess() {
  return (
    <Layout>
      <SeoMetaHead item={{
        title: 'Email verified'
      }}
      />
      <div className={style['email-verify-succsess']}>
        <p>
          Your email has been verified,
          <Link href="/auth/login">
            <a> click here to login</a>
          </Link>
        </p>
      </div>
    </Layout>
  );
}

export default EmailVerifiedSuccess;
