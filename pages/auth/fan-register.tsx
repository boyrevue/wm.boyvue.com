/* eslint-disable prefer-regex-literals */
import {
  LeftOutlined
} from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import { loginSuccess, registerFan } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import {
  Button, Col, Form, Input, Layout, Row, Select
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { ICountry } from 'src/interfaces';
import {
  authService, settingService, userService, utilsService
} from 'src/services';

import loginStyle from './login.module.less';
import registerStyle from './register.module.less';

const { Option } = Select;

interface IFanRegisterProps {
  registerFanHandler: Function;
  registerFanData: any;
  countries: ICountry[];
  loginPlaceholderImage: string;
  handleLoginSuccess: Function;
  handleUpdateCurrentUser: Function;
}

function FanRegister({
  registerFanHandler,
  registerFanData = { requesting: false },
  countries = [],
  loginPlaceholderImage,
  handleLoginSuccess,
  handleUpdateCurrentUser
}: IFanRegisterProps) {
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

  const onHandleRegister = (data: any) => {
    registerFanHandler(data);
  };

  return (
    <Layout>
      <SeoMetaHead item={{
        title: 'Fan registration'
      }}
      />

      <div className={`${loginStyle['login-box']} ${registerStyle.registerBox}`}>

        <div className={`${loginStyle.loginContent} ${loginStyle.left}`} style={loginPlaceholderImage ? { backgroundImage: `url(${loginPlaceholderImage})` } : null} />

        <div className={`${loginStyle.loginContent} ${loginStyle.right}`}>
          <Link href="/auth/register"><span className={loginStyle['back-register-icon']}><LeftOutlined /></span></Link>
          <div className={loginStyle['register-content']}>
            <div className="text-center">
              <span className="title">Fan Registration</span>
            </div>
            <p className="text-center">Sign up to interact with your idols!</p>
            <div className="register-form">
              <Form
                name="member_register"
                initialValues={{ gender: 'male', country: 'US' }}
                onFinish={onHandleRegister}
              >
                <Row>
                  <Col xs={12} sm={12} md={12}>
                    <Form.Item
                      name="firstName"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: 'Please input your first name!' },
                        {
                          pattern: new RegExp(
                            /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/g
                          ),
                          message:
                                'First name cannot contain number and special character'
                        }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder="First name" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12}>
                    <Form.Item
                      name="lastName"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: 'Please input your last name!' },
                        {
                          pattern: new RegExp(
                            /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/g
                          ),
                          message:
                                'Last name cannot contain number and special character'
                        }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder="Last name" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12}>
                    <Form.Item
                      name="name"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: 'Please input your display name!' },
                        {
                          pattern: new RegExp(/^(?=.*\S).+$/g),
                          message:
                                'Display name cannot contain only whitespace'
                        },
                        {
                          min: 3,
                          message: 'Display name must containt at least 3 characters'
                        }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder="Display name" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12}>
                    <Form.Item
                      name="username"
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: 'Please input your username!' },
                        {
                          pattern: new RegExp(/^[a-z0-9]+$/g),
                          message:
                                'Username must contain lowercase aphanumerics only'
                        },
                        { min: 3, message: 'Username must containt at least 3 characters' }
                      ]}
                      hasFeedback
                    >
                      <Input placeholder="Username" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12}>
                    <Form.Item
                      name="email"
                      validateTrigger={['onChange', 'onBlur']}
                      hasFeedback
                      rules={[
                        {
                          type: 'email',
                          message: 'Invalid email address!'
                        },
                        {
                          required: true,
                          message: 'Please input your email address!'
                        }
                      ]}
                    >
                      <Input placeholder="Email address" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12}>
                    <Form.Item
                      name="gender"
                          // validateTrigger={['onChange', 'onBlur']}
                      rules={[{ required: true, message: 'Please select your gender!' }]}
                    >
                      <Select>
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                        <Option value="transgender">Transgender</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12}>
                    <Form.Item name="country" rules={[{ required: true, message: 'Please select your country!' }]} hasFeedback>
                      <Select showSearch optionFilterProp="label">
                        {countries.map((c) => (
                          <Option value={c.code} key={c.code} label={c.name}>
                            <img alt="country_flag" src={c.flag} width="25px" />
                            {' '}
                            {c.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12}>
                    <Form.Item
                      name="password"
                      validateTrigger={['onChange', 'onBlur']}
                      hasFeedback
                      rules={[
                        {
                          pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^<>`~\-=\\\\|,.<>\\/;':"\\[\]{}\\#()_+?@$!%*?&])([A-Za-z\d^<>`~\-=\\\\|,.<>\\/;':"\\[\]{}\\#()_+?@$!%*?&]){8,}$/g),
                          message: 'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character'
                        },
                        { required: true, message: 'Please input your password!' }
                      ]}
                    >
                      <Input type="password" placeholder="Password" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12}>
                    <Form.Item
                      name="confirm"
                      validateTrigger={['onChange', 'onBlur']}
                      dependencies={['password']}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: 'Please confirm your password!'
                        },
                        ({ getFieldValue }) => ({
                          validator(rule, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match!'));
                          }
                        })
                      ]}
                    >
                      <Input type="password" placeholder="Confirm password" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={registerFanData.requesting}
                    loading={registerFanData.requesting}
                    style={{
                      marginBottom: 15,
                      fontWeight: 600,
                      padding: '5px 25px',
                      height: '42px'
                    }}
                  >
                    CREATE ACCOUNT
                  </Button>
                  <p>
                    Have an account already?
                    <Link href="/auth/login">
                      <a> Login here</a>
                    </Link>
                  </p>
                  <p>
                    Are you a model?
                    <Link href="/auth/model-register">
                      <a> Sign up here</a>
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

FanRegister.getInitialProps = async () => {
  const [countries, settings] = await Promise.all([
    utilsService.countriesList(),
    settingService.valueByKeys([
      'loginPlaceholderImage'
    ])
  ]);
  return {
    countries: countries?.data || [],
    loginPlaceholderImage: settings.loginPlaceholderImage
  };
};

const mapStatesToProps = (state: any) => ({
  registerFanData: { ...state.auth.registerFanData }
});

FanRegister.layout = 'public';

const mapDispatchToProps = { registerFanHandler: registerFan, handleLoginSuccess: loginSuccess, handleUpdateCurrentUser: updateCurrentUser };

export default connect(mapStatesToProps, mapDispatchToProps)(FanRegister);
