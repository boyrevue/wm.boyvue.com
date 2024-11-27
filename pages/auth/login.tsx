import PageTitle from '@components/common/page-title';
import { login, loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService, settingService, userService } from '@services/index';
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { ILogin } from 'src/interfaces';

import style from './login.module.less';

interface ILoginProps {
  loginAuth: any;
  handleLogin: Function;
  loginPlaceholderImage: string;
  handleLoginSuccess: Function;
  handleUpdateCurrentUser: Function;
}

function Login({
  loginAuth,
  handleLogin,
  loginPlaceholderImage,
  handleLoginSuccess,
  handleUpdateCurrentUser
}: ILoginProps) {
  const loginHandler = (values: ILogin) => handleLogin(values);
  const router = useRouter();

  const checkRedirect = async () => {
    const token = authService.getToken();
    if (!token || token === 'null') {
      return;
    }
    authService.setToken(token);
    try {
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data._id) {
        return;
      }
      handleLoginSuccess();
      handleUpdateCurrentUser(user.data);
      if (user.data.isPerformer) {
        router.push({ pathname: `/model/${user.data.username}` }, `/${user.data.username}`);
      } else {
        router.push('/');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(await e);
    }
  };

  useEffect(() => {
    checkRedirect();
  }, []);

  return (
    <>
      <PageTitle title="Login" />
      <div className={style['login-box']}>

        <div
          className={`${style.loginContent} ${style.left} ${style.fixed}`}
          style={loginPlaceholderImage ? { backgroundImage: `url(${loginPlaceholderImage})` } : null}
        >
          {/* <Link href="/">
            <a
              title="Homepage"
              className={`${style['logo-login']}`}
            >
              ssa
            </a>
          </Link> */}
        </div>

        <div className={`${style.loginContent} ${style.right}`}>
          <div className="login-form">
            <div className="title">LOG IN</div>
            <Divider>*</Divider>
            <Form
              name="normal_login"
              initialValues={{ remember: true }}
              onFinish={loginHandler}
            >
              <Form.Item
                name="username"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Email address or Username is missing' },
                  { min: 3, message: 'Username must containt at least 3 characters' }
                ]}
              >
                <Input placeholder="Email/Username" />
              </Form.Item>
              <Form.Item
                name="password"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Please enter your password!' },
                  { min: 8, message: 'Password must containt at least 8 characters' }
                ]}
              >
                <Input type="password" placeholder="Password" />
              </Form.Item>
              <Form.Item>
                <Row>
                  <Col span={12}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Link
                      href={{
                        pathname: '/auth/forgot-password'
                      }}
                    >
                      <a className="login-form-forgot">Forgot password?</a>
                    </Link>
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item style={{ textAlign: 'center' }}>
                <Button type="primary" disabled={loginAuth.requesting} loading={loginAuth.requesting} htmlType="submit" className={`${style['login-form-button']}`}>
                  LOGIN
                </Button>
                <p>
                  Don&apos;t have an account yet?
                  <Link
                    href="/auth/register"
                  >
                    <a> Sign up here.</a>
                  </Link>
                </p>
                <p>
                  Email verification,
                  <Link href="/auth/resend-verification-email">
                    <a> Resend here.</a>
                  </Link>
                </p>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

Login.layout = 'public';

Login.getInitialProps = async () => {
  const settings = await settingService.valueByKeys(['loginPlaceholderImage']);
  return {
    loginPlaceholderImage: settings.loginPlaceholderImage
  };
};

const mapStatesToProps = (state: any) => ({
  loginAuth: { ...state.auth.loginAuth }
});

const mapDispatchToProps = {
  handleLogin: login, handleLoginSuccess: loginSuccess, handleUpdateCurrentUser: updateCurrentUser
};
export default connect(mapStatesToProps, mapDispatchToProps)(Login) as any;
