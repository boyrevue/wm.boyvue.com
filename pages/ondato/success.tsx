import PageTitle from '@components/common/page-title';
import { Button, Layout, Result } from 'antd';
import Router from 'next/router';

export default function OndatoSucceesPage() {
  return (
    <Layout>
      <PageTitle title="Verification success" />
      <div className="main-container">
        <Result
          status="success"
          title="Verification Success"
          subTitle="Hi new model your verification has been successfully"
          extra={[
            <Button className="secondary" key="console" onClick={() => Router.push('/auth/login')}>
              LOGIN
            </Button>
          ]}
        />
      </div>
    </Layout>
  );
}
