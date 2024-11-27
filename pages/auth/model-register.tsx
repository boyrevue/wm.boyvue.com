import {
  LeftOutlined
} from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import { ImageUpload } from '@components/file';
import { loginSuccess, registerPerformer } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import {
  Button, Checkbox,
  Col, DatePicker, Form, Input, Layout, message,
  Row, Select
} from 'antd';
import moment from 'moment';
import Link from 'next/link';
import Router from 'next/router';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { ICountry } from 'src/interfaces';
import {
  authService, settingService, userService, utilsService
} from 'src/services';

import loginStyle from './login.module.less';
import style from './model-register.module.less';

const { Option } = Select;

type IProps = {
  registerPerformerData: any;
  registerPerformerHandler: Function;
  countries: ICountry[];
  handleLoginSuccess: Function;
  handleUpdateCurrentUser: Function;
  loginPlaceholderImage: string;
}

let idVerificationFile = null;

let documentVerificationFile = null;

function RegisterPerformer({
  registerPerformerData, registerPerformerHandler, countries = [], handleLoginSuccess, handleUpdateCurrentUser, loginPlaceholderImage
}: IProps) {
  const onFileReaded = (type, file: File) => {
    if (file && type === 'idFile') {
      idVerificationFile = file;
    }
    if (file && type === 'documentFile') {
      documentVerificationFile = file;
    }
  };

  const register = (values: any) => {
    if (!values.agreement) {
      return message.error('You must accept the content provider agreement', 5);
    }

    const data = values;
    if (!idVerificationFile || !documentVerificationFile) {
      return message.error('ID photo & ID document are required', 5);
    }
    data.idVerificationFile = idVerificationFile;
    data.documentVerificationFile = documentVerificationFile;
    // data.dateOfBirth = moment(data.dateOfBirth).toDate();
    return registerPerformerHandler(data);
  };

  const loadUser = async () => {
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
        Router.push({ pathname: `/model/${user.data.username}` }, `/${user.data.username}`);
      } else {
        Router.push('/');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(await e);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <Layout>
      <SeoMetaHead item={{
        title: 'Model Registration'
      }}
      />

      <div className={`${loginStyle['login-box']} ${style['register-box']}`}>
        <div className={`${loginStyle.loginContent} ${loginStyle.left}`} style={loginPlaceholderImage ? { backgroundImage: `url(${loginPlaceholderImage})` } : null} />
        <div className={`${loginStyle.loginContent} ${loginStyle.right}`}>
          <Link href="/auth/register"><span className={loginStyle['back-register-icon']}><LeftOutlined /></span></Link>
          <div className={loginStyle['register-content']}>
            <div className="text-center">
              <span className="title">Model Registration</span>
            </div>
            <p className="text-center">Sign up to make money and interact with your fans!</p>
            <Form
              name="member_register"
              layout="vertical"
              initialValues={{
                gender: 'male',
                country: 'US',
                dateOfBirth: moment().subtract(18, 'year').startOf('day')
              }}
              onFinish={register}
            >

              <Row>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    name="firstName"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      { required: true, message: 'Please input your name!' },
                      {
                        pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/g,
                        message:
                          'First name cannot contain number and special character'
                      }
                    ]}
                    hasFeedback
                  >
                    <Input placeholder="First name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    name="lastName"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      { required: true, message: 'Please input your name!' },
                      {
                        pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/g,
                        message:
                          'Last name cannot contain number and special character'
                      }
                    ]}
                    hasFeedback
                  >
                    <Input placeholder="Last name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    name="name"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      { required: true, message: 'Please input your display name!' },
                      {
                        pattern: /^(?=.*\S).+$/g,
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
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    name="username"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      { required: true, message: 'Please input your username!' },
                      {
                        pattern: /^[a-z0-9]+$/g,
                        message:
                          'Username must contain only lowercase alphanumerics only!'
                      },
                      { min: 3, message: 'username must containt at least 3 characters' }
                    ]}
                    hasFeedback
                  >
                    <Input placeholder="Username eg: user123, chirst99 ..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    name="email"
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                    rules={[
                      {
                        type: 'email',
                        message: 'The input is not valid email!'
                      },
                      {
                        required: true,
                        message: 'Please input your email!'
                      }
                    ]}
                  >
                    <Input placeholder="Email address" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    name="dateOfBirth"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        message: 'Please input your date of birth!'
                      }
                    ]}
                  >
                    <DatePicker
                      placeholder="YYYY-MM-DD"
                      // defaultValue={user?.dateOfBirth ? moment(user.dateOfBirth) as any : ''}
                      // onChange={(date) => this.setState({ dateOfBirth: date })}
                      disabledDate={(currentDate) => currentDate && currentDate > moment().subtract(18, 'year').startOf('day')}
                      style={{ width: '100%', height: '40px' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item name="country" rules={[{ required: true }]} hasFeedback>
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
                    name="gender"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[{ required: true, message: 'Please select your gender' }]}
                    hasFeedback
                  >
                    <Select>
                      <Option value="male" key="male">Male</Option>
                      <Option value="female" key="female">Female</Option>
                      <Option value="transgender" key="trans">Transgender</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    name="password"
                    hasFeedback
                    rules={[
                      {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^<>`~\-=\\\\|,.<>\\/;':"\\[\]{}\\#()_+?@$!%*?&])([A-Za-z\d^<>`~\-=\\\\|,.<>\\/;':"\\[\]{}\\#()_+?@$!%*?&]){8,}$/g,
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
                    dependencies={['password']}
                    hasFeedback
                    validateTrigger={['onChange', 'onBlur']}
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

              <div className={`${style['register-form']}`}>
                <Row>
                  <Col xs={24} sm={12} md={12}>
                    <div className="upload-card-register">
                      <Form.Item
                        name="documentVerificationId"
                        className={`${style['model-photo-verification']}`}
                        label="Your government issued ID card, National ID card, Passport or Driving license"
                      >
                        <div className={`${style['id-block']}`}>
                          <ImageUpload onFileRead={(file) => onFileReaded('documentFile', file)} />
                          <img alt="identity-img" className={`${style['img-id']}`} src="/front-id.png" />
                        </div>
                      </Form.Item>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={12}>
                    <div className="upload-card-register">
                      <Form.Item
                        name="idVerificationId"
                        className={`${style['model-photo-verification']}`}
                        label="Photo of yourself holding your indentity document next to your face"
                      >
                        <div className={`${style['id-block']}`}>
                          <ImageUpload onFileRead={(file) => onFileReaded('idFile', file)} />
                          <img alt="identity-img" className={`${style['img-id']}`} src="/holding-id.jpg" />
                        </div>
                      </Form.Item>
                    </div>
                  </Col>
                </Row>
              </div>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) => (value ? Promise.resolve() : Promise.reject('You must accept the content provider agreement'))
                  }
                ]}
              >
                <Checkbox>
                  I accept and agree to the
                  {' '}
                  <a href="https://viberhive.com/page/content-creators-agreement-?" target="_blank" rel="noreferrer">Content provider agreement</a>
                </Checkbox>
              </Form.Item>

              <Form.Item style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={registerPerformerData.requesting}
                  loading={registerPerformerData.requesting}
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
                    <a> Login here.</a>
                  </Link>
                </p>
                <p style={{ marginBottom: '0' }}>
                  Are you a fan?
                  <Link href="/auth/fan-register">
                    <a> Sign up here.</a>
                  </Link>
                </p>
              </Form.Item>

            </Form>
          </div>
        </div>
      </div>

    </Layout>
  );
}

RegisterPerformer.getInitialProps = async () => {
  const [countries, settings] = await Promise.all([
    utilsService.countriesList(),
    settingService.valueByKeys([
      'loginPlaceholderImage'
    ])
  ]);
  return {
    countries: countries && countries.data ? countries.data : [],
    loginPlaceholderImage: settings.loginPlaceholderImage
  };
};
const mapStatesToProps = (state: any) => ({
  registerPerformerData: { ...state.auth.registerPerformerData }
});

const mapDispatchToProps = {
  registerPerformerHandler: registerPerformer,
  handleLoginSuccess: loginSuccess,
  handleUpdateCurrentUser: updateCurrentUser
};
RegisterPerformer.layout = 'public';

export default connect(mapStatesToProps, mapDispatchToProps)(RegisterPerformer);
