/* eslint-disable react/require-default-props */
import { FileDoneOutlined, UploadOutlined } from '@ant-design/icons';
import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import { utilsService } from '@services/index';
import {
  Button, Checkbox, Col, DatePicker,
  Form, Input, message, Progress,
  Row, Select, Upload
} from 'antd';
import moment from 'moment';
import getConfig from 'next/config';
import { createRef, PureComponent } from 'react';
import {
  IBody,
  ICountry, ILanguages, IPerformer, IPhoneCodes
} from 'src/interfaces';

import style from './accountForm.module.less';

const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const { TextArea } = Input;

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a valid email!',
    number: 'Not a valid number!'
  },
  number: {
    // eslint-disable-next-line no-template-curly-in-string
    range: 'Must be between ${min} and ${max}'
  }
};

type IProps = {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
  options?: {
    uploadHeaders?: any;
    avatarUploadUrl?: string;
    onAvatarUploaded?: Function;
    coverUploadUrl?: string;
    onCoverUploaded?: Function;
    beforeUpload?: Function;
    videoUploadUrl?: string;
    onVideoUploaded?: Function;
    uploadPercentage?: number;
  };
  countries?: ICountry[];
  phoneCodes?: IPhoneCodes[];
  languages?: ILanguages[];
  bodyInfo?: IBody;
}

export class PerformerAccountForm extends PureComponent<IProps> {
  state = {
    isUploadingVideo: false,
    fileAdded: null,
    uploadVideoPercentage: 0,
    previewVideo: null,
    selectedPhoneCode: 'US_+1',
    phone: null,
    dateOfBirth: '',
    states: [],
    cities: []
  };

  formRef: any;

  componentDidMount() {
    const { user } = this.props;
    user.welcomeVideoPath && this.setState(
      {
        previewVideo: user.welcomeVideoPath
      }
    );
    if (user?.country) {
      this.handleGetStates(user?.country);
      if (user?.state) {
        this.handleGetCities(user?.state, user?.country);
      }
    }
    if (user?.phone) {
      this.setState({ phone: user.phone });
    }
  }

  handleGetStates = async (countryCode: string) => {
    const { user } = this.props;
    const resp = await utilsService.statesList(countryCode);
    const eState = resp.data.find((s) => s === user.state);
    await this.setState({ states: resp.data });
    if (eState) {
      this.formRef.setFieldsValue({ state: eState });
    } else {
      this.formRef.setFieldsValue({ state: '', city: '' });
    }
  };

  handleGetCities = async (state: string, countryCode: string) => {
    const { user } = this.props;
    const resp = await utilsService.citiesList(countryCode, state);
    await this.setState({ cities: resp.data });
    const eCity = resp.data.find((s) => s === user.city);
    if (eCity) {
      this.formRef.setFieldsValue({ city: eCity });
    } else {
      this.formRef.setFieldsValue({ city: '' });
    }
  };

  handleVideoChange = (info: any) => {
    info.file && info.file.percent && this.setState({ uploadVideoPercentage: info.file.percent });
    if (info.file.status === 'uploading') {
      const { isUploadingVideo } = this.state;
      !isUploadingVideo && this.setState({ isUploadingVideo: true });
      return;
    }
    if (info.file.status === 'done') {
      message.success('Welcome video uploaded');
      this.setState(
        {
          isUploadingVideo: false,
          previewVideo: info?.file?.response?.data?.url || ''
        }
      );
    }
  };

  beforeUpload = (file) => {
    const { publicRuntimeConfig: config } = getConfig();
    const isValid = file.size / 1024 / 1024 < (config.MAX_SIZE_TEASER || 200);
    if (!isValid) {
      message.error(`Video must be smaller than ${config.MAX_SIZE_TEASER || 200}MB!`);
      return false;
    }
    this.setState({ fileAdded: file });
    return true;
  };

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      onFinish, user, updating, countries, options, languages, phoneCodes, bodyInfo
    } = this.props;
    const {
      heights = [], weights = [], bodyTypes = [], genders = [], sexualOrientations = [], ethnicities = [],
      hairs = [], pubicHairs = [], eyes = [], butts = []
    } = bodyInfo;
    const {
      uploadHeaders, avatarUploadUrl, onAvatarUploaded, coverUploadUrl, onCoverUploaded, videoUploadUrl
    } = options;
    const {
      isUploadingVideo, uploadVideoPercentage, previewVideo, phone, selectedPhoneCode, dateOfBirth, fileAdded, states, cities
    } = this.state;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(payload) => {
          const values = payload;
          values.phoneCode = selectedPhoneCode;
          values.dateOfBirth = dateOfBirth;
          onFinish(values);
        }}
        validateMessages={validateMessages}
        initialValues={user}
        labelAlign="left"
        className={style['account-form']}
        ref={(ref) => { this.formRef = ref; }}
      >
        <div
          className={style['top-profile']}
          style={{
            position: 'relative',
            backgroundImage:
              user?.cover
                ? `url('${user.cover}')`
                : "url('/banner-image.jpg')"
          }}
        >
          <div className="avatar-upload">
            <AvatarUpload
              headers={uploadHeaders}
              uploadUrl={avatarUploadUrl}
              onUploaded={onAvatarUploaded}
              image={user.avatar || '/no-avatar.png'}
            />
          </div>
          <div className="cover-upload">
            <CoverUpload
              headers={uploadHeaders}
              uploadUrl={coverUploadUrl}
              onUploaded={onCoverUploaded}
              options={{ fieldName: 'cover' }}
            />
          </div>
        </div>
        <Row>
          <Col md={12} sm={12} xs={12}>
            <Form.Item
              name="firstName"
              label="First name"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your first name!' },
                {
                  pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/g,
                  message:
                    'First name cannot contain number and special character'
                }
              ]}
            >
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item
              name="lastName"
              label="Last name"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your last name!' },
                {
                  pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/g,
                  message:
                    'Last name cannot contain number and special character'
                }
              ]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item
              label="Display name"
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
              <Input placeholder="Display name" maxLength={100} />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="username" label="Username" required>
              <Input disabled placeholder="username" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="email" label="Email address" required>
              <Input disabled placeholder="email" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Please select your gender' }]}>
              <Select>
                {genders.map((g) => (
                  <Select.Option value={g.value} key={g.value}>
                    {g.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={24} xs={24}>
            <Form.Item name="bio" label="Bio">
              <TextArea rows={3} placeholder="Tell people something about you" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="country" rules={[{ required: true, message: 'Please select your country' }]} label="Country">
              <Select
                placeholder="Select your country"
                optionFilterProp="label"
                showSearch
                onChange={(val: string) => this.handleGetStates(val)}
              >
                {countries.map((c) => (
                  <Option value={c.code} label={c.name} key={c.code}>
                    <img alt="country_flag" src={c.flag} width="25px" />
                    {' '}
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="state" label="State">
              <Select
                placeholder="Select your state"
                optionFilterProp="label"
                showSearch
                onChange={(val: string) => this.handleGetCities(val, this.formRef.getFieldValue('country'))}
              >
                {states.map((state) => (
                  <Option value={state} label={state} key={state}>
                    {state}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="city" label="City">
              <Select
                placeholder="Select your city"
                optionFilterProp="label"
                showSearch
              >
                {cities.map((city) => (
                  <Option value={city} label={city} key={city}>
                    {city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="address" label="Address">
              <Input placeholder="Enter the address" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} sm={24}>
            <Form.Item
              label="Date of Birth"
              validateTrigger={['onChange', 'onBlur']}
            >
              <DatePicker
                placeholder="YYYY-MM-DD"
                defaultValue={user?.dateOfBirth ? moment(user.dateOfBirth) as any : ''}
                onChange={(date) => this.setState({ dateOfBirth: date })}
                disabledDate={(currentDate) => currentDate && currentDate > moment().subtract(12, 'year').endOf('day')}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} sm={24}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  pattern: /^[0-9]{9,12}$/,
                  message: 'Enter 9-12 digits phone number'
                }
              ]}
            >
              <div className="phone-code">
                <Input
                  placeholder="9-12 digits phone number"
                  addonBefore={(
                    <Select
                      style={{ minWidth: '50%' }}
                      defaultValue={user?.phoneCode || 'US_+1'}
                      optionFilterProp="label"
                      showSearch
                      onChange={(val) => this.setState({ selectedPhoneCode: val })}
                    >
                      {phoneCodes && phoneCodes.map((p) => <Option key={p.code} value={p.code} label={`${p.dialCode} ${p.name}`}>{`${p.dialCode} ${p.name}`}</Option>)}
                    </Select>
                  )}
                  value={phone}
                  onChange={(e) => this.setState({ phone: e.target.value })}
                  style={{ width: '100%' }}
                />

              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item
              name="languages"
              label="Languages"
            >
              <Select mode="multiple">
                {languages.map((l) => (
                  <Select.Option key={l.code} value={l.name || l.code}>
                    {l.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item name="sexualPreference" label="Sexual orientation">
              <Select>
                {sexualOrientations.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="ethnicity" label="Ethnicity">
              <Select>
                {ethnicities.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="bodyType" label="Body Type">
              <Select>
                {bodyTypes.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="eyes" label="Eye color">
              <Select>
                {eyes.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="hair" label="Hair color">
              <Select>
                {hairs.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="height" label="Height">
              <Select showSearch>
                {heights.map((h) => (
                  <Option key={h.text} value={h.text}>
                    {h.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="weight" label="Weight">
              <Select showSearch>
                {weights.map((w) => (
                  <Option key={w.text} value={w.text}>
                    {w.text}
                  </Option>
                ))}
                <Option key="" value="">
                  Unknow
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="butt" label="Butt size">
              <Select>
                {butts.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="pubicHair" label="Pubic hair">
              <Select>
                {pubicHairs.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item label="Intro Video">
              <Upload
                accept={'video/*'}
                listType="picture-card"
                name="welcome-video"
                showUploadList={false}
                action={videoUploadUrl}
                headers={uploadHeaders}
                beforeUpload={this.beforeUpload.bind(this)}
                onChange={this.handleVideoChange.bind(this)}
              >
                {fileAdded ? <FileDoneOutlined /> : <UploadOutlined />}
              </Upload>
              {(fileAdded || previewVideo) && (
                <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                  {(fileAdded && <a>{fileAdded?.name}</a>) || (previewVideo && <a href={previewVideo} target="_.blank">Click here to preview</a>)}
                </div>
              )}
              {uploadVideoPercentage ? (
                <Progress percent={Math.round(uploadVideoPercentage)} />
              ) : null}
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item name="activateWelcomeVideo" valuePropName="checked">
              <Checkbox>
                Activate intro video
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className="text-center">
          <Button
            className="primary"
            htmlType="submit"
            loading={updating}
            disabled={updating || isUploadingVideo}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
