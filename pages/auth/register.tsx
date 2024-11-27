/* eslint-disable react/no-danger */
import SeoMetaHead from '@components/common/seo-meta-head';
import { loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService, settingService, userService } from '@services/index';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import loginStyle from './login.module.less';
import registerStyle from './register.module.less';

interface IRegisterProps {
  loginPlaceholderImage: string;
  userBenefit: string;
  modelBenefit: string;
  handleLoginSuccess: Function;
  handleUpdateCurrentUser: Function;
}

function Register({
  loginPlaceholderImage,
  userBenefit,
  modelBenefit,
  handleLoginSuccess,
  handleUpdateCurrentUser
}: IRegisterProps) {
  const [loginAs, setLoginAs] = useState('user');
  const router = useRouter();
  const checkRedirect = async () => {
    const token = authService.getToken();
    if (!token || token === 'null') {
      return undefined;
    }
    authService.setToken(token);
    try {
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data._id) {
        return undefined;
      }
      handleLoginSuccess();
      handleUpdateCurrentUser(user.data);
      if (user.data.isPerformer) {
        router.push({ pathname: `/model/${user.data.username}` }, `/${user.data.username}`);
      } else {
        router.push('/');
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    checkRedirect();
  }, []);

  return (
    <div className="container">
      <SeoMetaHead item={{
        title: 'Register'
      }}
      />
      <div className={loginStyle['login-box']}>

        <div
          className={`${loginStyle.loginContent} ${loginStyle.left} ${loginStyle.fixed}`}
          style={loginPlaceholderImage ? { backgroundImage: `url(${loginPlaceholderImage})` } : null}
        />

        <div
          className={`${loginStyle.loginContent} ${loginStyle.right}`}
        >
          <div>
            <div className={registerStyle.switchBtn}>
              <button
                type="button"
                className={loginAs === 'user' ? 'active' : ''}
                onClick={() => setLoginAs('user')}
                style={{ marginRight: '20px' }}
              >
                Fan sign up
              </button>
              <button
                type="button"
                className={loginAs === 'performer' ? 'active' : ''}
                onClick={() => setLoginAs('performer')}
              >
                Model sign up
              </button>
            </div>

            <div className={registerStyle.welcomeBox}>
              <h3>
                {loginAs === 'user' ? 'Fan' : 'Model'}
                {' '}
                Benefits
              </h3>
              {loginAs === 'performer' ? (
                <div>
                  {modelBenefit
                    ? <div className="sun-editor-editable" dangerouslySetInnerHTML={{ __html: modelBenefit }} />
                    : (
                      <ul>
                        <li>Lightning fast uploading</li>
                        <li>Multi-video uploading</li>
                        <li>Chat with fans</li>
                        <li>Cross-over-content between models</li>
                        <li>Individual model store</li>
                        <li>
                          Affiliate program for blogs to promote your
                          content
                        </li>
                        <li>80% Standard commission rate</li>
                        <li>(Deduct 5% when gained from affiliates)</li>
                      </ul>
                    )}
                  <Link href="/auth/model-register">
                    <a className="btn-primary ant-btn ant-btn-primary ant-btn-lg">
                      Model sign up
                    </a>
                  </Link>
                  <p className="text-center">
                    Have an account already?
                    <Link href="/auth/login">
                      <a> Login here</a>
                    </Link>
                  </p>
                </div>
              ) : (
                <div>
                  {userBenefit ? <div className="sun-editor-editable" dangerouslySetInnerHTML={{ __html: userBenefit }} /> : (
                    <ul>
                      <li>View exclusive content</li>
                      <li>Monthly and Yearly subscriptions</li>
                      <li>Fast and reliable buffering and viewing</li>
                      <li>Multiple solution options to choose from</li>
                      <li>Chat with model</li>
                      <li>Access model&apos;s personal store</li>
                      <li>Search and filter capabilities</li>
                      <li>Favorite your video for future viewing</li>
                    </ul>
                  )}
                  <Link href="/auth/fan-register">
                    <a className="btn-primary ant-btn ant-btn-primary ant-btn-lg">
                      Fan sign up
                    </a>
                  </Link>
                  <p className="text-center">
                    Have an account already?
                    <Link href="/auth/login">
                      <a> Login here</a>
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

Register.authenticate = false;
Register.noredirect = true;

Register.getInitialProps = async () => {
  const settings = await settingService.valueByKeys([
    'loginPlaceholderImage',
    'modelBenefit',
    'userBenefit'
  ]);
  return {
    loginPlaceholderImage: settings.loginPlaceholderImage,
    userBenefit: settings.userBenefit,
    modelBenefit: settings.modelBenefit
  };
};

Register.layout = 'public';

const mapDispatchToProps = { handleLoginSuccess: loginSuccess, handleUpdateCurrentUser: updateCurrentUser };

export default connect(null, mapDispatchToProps)(Register);
