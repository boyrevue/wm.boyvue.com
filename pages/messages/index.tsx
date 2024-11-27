import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import Messenger from '@components/messages/Messenger';
import { Layout, PageHeader } from 'antd';
import Router from 'next/router';

interface IMessageProps {
  query: Record<string, string>
}

function Messages({
  query
}: IMessageProps) {
  return (
    <Layout>
      <PageTitle title="Messages" />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title="Chats"
        />
        <Messenger toSource={query.toSource} toId={query.toId} />
      </div>
    </Layout>
  );
}

Messages.authenticate = true;

Messages.getInitialProps = (ctx) => {
  const { query } = ctx;
  return {
    query
  };
};

export default Messages;
