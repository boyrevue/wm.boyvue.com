import SeoMetaHead from '@components/common/seo-meta-head';
import { authService, settingService } from '@services/index';
import {
  Button, Form, Input, Layout, message
} from 'antd';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { IForgot } from 'src/interfaces';

import loginS from './login.module.less';

interface IResendVerificationProps {
  loginPlaceholderImage: string
}

function ResendVerification({
  loginPlaceholderImage
}: IResendVerificationProps) {
  const _intervalCountdown = useRef(null);
  const [submiting, setSubmitting] = useState(false);
  const [countTime, setCountdownTime] = useState(60);

  useEffect(() => {
    if (countTime === 0) {
      if (_intervalCountdown.current) clearInterval(_intervalCountdown.current);
      setCountdownTime(60);
    }
  }, [countTime]);

  const handleCountdown = () => {
    setCountdownTime(countTime - 1);
    _intervalCountdown.current = setInterval(() => {
      setCountdownTime((preState) => preState - 1);
    }, 1000);
  };

  const handleReset = async (data: IForgot) => {
    try {
      setSubmitting(true);
      await authService.resendVerificationEmail({
        ...data
      });
      message.success('An email has been sent to you to reset your password');
      handleCountdown();
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Error occured, please try again later');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SeoMetaHead item={{
        title: 'Resend Email Verification'
      }}
      />
      <div className="main-container">
        <div className={loginS['login-box']}>
          <div
            className={`${loginS.loginContent} ${loginS.left} ${loginS.fixed}`}
            style={loginPlaceholderImage ? { backgroundImage: `url(${loginPlaceholderImage})` } : null}
          />
          <div
            className={`${loginS.loginContent} ${loginS.right}`}
            style={{ paddingTop: 80 }}
          >
            <div className="login-form">
              <div className="title">Resend Email Verification</div>
              <br />
              <Form name="forgot-form" onFinish={handleReset}>
                <Form.Item
                  hasFeedback
                  name="email"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      type: 'email',
                      message: 'Invalid email format'
                    },
                    {
                      required: true,
                      message: 'Please enter your E-mail!'
                    }
                  ]}
                >
                  <Input placeholder="Enter your email address" />
                </Form.Item>
                <Form.Item style={{ textAlign: 'center' }}>
                  <Button
                    className="primary"
                    type="primary"
                    htmlType="submit"
                    style={{
                      width: '100%',
                      marginBottom: 15,
                      fontWeight: 600,
                      padding: '5px 25px',
                      height: '42px'
                    }}
                    disabled={submiting || countTime < 60}
                    loading={submiting || countTime < 60}
                  >
                    {countTime < 60 ? 'Resend in' : 'Send'}
                    {' '}
                    {countTime < 60 && `${countTime}s`}
                  </Button>
                  <p>
                    Have an account already?
                    <Link href="/auth/login">
                      <a> Login here.</a>
                    </Link>
                  </p>
                  <p>
                    Don&apos;t have an account yet?
                    <Link
                      href="/auth/register"
                    >
                      <a> Sign up here.</a>
                    </Link>
                  </p>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
ResendVerification.getInitialProps = async () => {
  const settings = await settingService.valueByKeys([
    'loginPlaceholderImage'
  ]);
  return {
    loginPlaceholderImage: settings.loginPlaceholderImage
  };
};
ResendVerification.layout = 'public';
export default ResendVerification;
