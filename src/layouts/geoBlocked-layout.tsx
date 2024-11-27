import { Result } from 'antd';
import Head from 'next/head';

function GEOLayout() {
  return (
    <main role="main">
      <Head>
        <title>IP GEO BLOCK</title>
      </Head>
      <div className="block-ip-page">
        <Result
          status="403"
          title="We're sorry"
          subTitle="We are not available in your country!"
        />
      </div>
    </main>
  );
}

export default GEOLayout;
