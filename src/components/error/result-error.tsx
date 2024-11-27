import {
  ContactsOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { IError } from '@interfaces/setting';
import { Button, Result } from 'antd';
import Router from 'next/router';
import { connect, ConnectedProps } from 'react-redux';

export interface IResultErrorProps {
  error: IError
}

const mapStates = (state: any) => ({
  user: state.user.current
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

function ResultError({
  error,
  user
}: PropsFromRedux & IResultErrorProps) {
  return (
    <Result
      status={error?.statusCode === 404 ? '404' : 'error'}
      title={error?.statusCode === 404 ? null : error?.statusCode}
      subTitle={
        error?.statusCode === 404
          ? 'Alas! It hurts us to realize that we have let you down. We are not able to find the page you are hunting for :('
          : error?.message
      }
      extra={[
        <Button
          className="secondary"
          key="console"
          onClick={() => {
            user?.isPerformer
              ? Router.push({ pathname: `/model/${user.data.username}` }, `/${user.data.username}`)
              : Router.push('/');
          }}
        >
          <HomeOutlined />
          BACK HOME
        </Button>,
        <Button
          key="buy"
          className="primary"
          onClick={() => Router.push('/contact')}
        >
          <ContactsOutlined />
          CONTACT US
        </Button>
      ]}
    />
  );
}

export default connector(ResultError);
