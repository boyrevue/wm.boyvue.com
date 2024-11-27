import PageTitle from '@components/common/page-title';
import { Button, Layout, Result } from 'antd';
import Router from 'next/router';

export default function OndatoSucceesPage() {
  return (
    <Layout>
      <PageTitle title="Verification failure" />
      <div className="main-container">
        <Result
          status="error"
          title="Verification failure"
          subTitle="Hi new model your verification has been failure. You can fill in all the information in your profile and verify again"
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
