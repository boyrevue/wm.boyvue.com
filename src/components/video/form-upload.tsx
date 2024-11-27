import { CameraOutlined, FileDoneOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import { performerService } from '@services/index';
import {
  Avatar,
  Button, Col,
  DatePicker, Form, Input, InputNumber, message, Progress, Row, Select, Switch, Upload
} from 'antd';
import ImgCrop from 'antd-img-crop';
import { debounce } from 'lodash';
import moment from 'moment';
import getConfig from 'next/config';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IUser, IVideo } from 'src/interfaces/index';

import style from './form-upload.module.less';

type IProps = {
  user: IUser;
  video?: IVideo;
  submit: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const { Option } = Select;

const validateMessages = {
  required: 'This field is required!'
};

export class FormUploadVideo extends PureComponent<IProps> {
  state = {
    previewThumbnail: null,
    previewTeaser: null,
    previewVideo: null,
    selectedThumbnail: null,
    selectedVideo: null,
    selectedTeaser: null,
    isSale: false,
    isSchedule: false,
    scheduledAt: moment(),
    performers: [],
    firstLoadPerformer: false
  };

  getPerformers = debounce(async (q, performerIds) => {
    try {
      const resp = await (await performerService.search({ q, performerIds: performerIds || '', limit: 500 })).data;
      const performers = resp.data || [];
      this.setState({ performers, firstLoadPerformer: true });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
      this.setState({ firstLoadPerformer: true });
    }
  }, 500);

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    video: undefined,
    beforeUpload: () => {},
    uploading: false,
    uploadPercentage: 0
  };

  componentDidMount() {
    const { video, user } = this.props;
    if (video) {
      this.setState(
        {
          previewThumbnail: video?.thumbnail?.url || '',
          previewVideo: video?.video?.url || '',
          previewTeaser: video?.teaser?.url || '',
          isSale: video.isSaleVideo,
          isSchedule: video.isSchedule,
          scheduledAt: video.scheduledAt ? moment(video.scheduledAt) : moment()
        }
      );
    }
    this.getPerformers('', video?.participantIds || [user._id]);
  }

  onSwitch(field: string, checked: boolean) {
    if (field === 'saleVideo') {
      this.setState({
        isSale: checked
      });
    }
    if (field === 'scheduling') {
      this.setState({
        isSchedule: checked
      });
    }
  }

  beforeUpload(file: File, field: string) {
    const { beforeUpload: beforeUploadHandler } = this.props;
    const { publicRuntimeConfig: config } = getConfig();
    if (field === 'thumbnail') {
      const isValid = file.size / 1024 / 1024 < (config.MAX_SIZE_IMAGE || 5);
      if (!isValid) {
        message.error(`File is too large please provide an file ${config.MAX_SIZE_IMAGE || 5}MB or below`);
        return isValid;
      }
      this.setState({ selectedThumbnail: file });
    }
    if (field === 'teaser') {
      const isValid = file.size / 1024 / 1024 < (config.MAX_SIZE_TEASER || 200);
      if (!isValid) {
        message.error(`File is too large please provide an file ${config.MAX_SIZE_TEASER || 200}MB or below`);
        return isValid;
      }
      this.setState({ selectedTeaser: file });
    }
    if (field === 'video') {
      const isValid = file.size / 1024 / 1024 < (config.MAX_SIZE_VIDEO || 2000);
      if (!isValid) {
        message.error(`File is too large please provide an file ${config.MAX_SIZE_VIDEO || 2000}MB or below`);
        return isValid;
      }
      this.setState({ selectedVideo: file });
    }
    return beforeUploadHandler(file, field);
  }

  render() {
    const {
      video, submit, uploading, uploadPercentage
    } = this.props;
    const {
      previewThumbnail,
      previewTeaser,
      previewVideo,
      performers,
      isSale,
      isSchedule,
      scheduledAt,
      selectedThumbnail,
      selectedTeaser,
      selectedVideo,
      firstLoadPerformer
    } = this.state;
    const { publicRuntimeConfig: config } = getConfig();

    return (
      <Form
        {...layout}
        onFinish={(values) => {
          const data = values;
          if (isSchedule) {
            data.scheduledAt = scheduledAt;
          }
          submit(data);
        }}
        onFinishFailed={() => message.error('Please complete the required fields')}
        name="form-upload"
        validateMessages={validateMessages}
        initialValues={
          video
          || ({
            title: '',
            price: 9.99,
            description: '',
            tags: [],
            isSaleVideo: false,
            participantIds: [],
            isSchedule: false,
            status: 'active'
          })
        }
        className={style['account-form']}
      >
        <Row>
          <Col md={12} xs={24}>
            <Form.Item
              label="Title"
              name="title"
              rules={[
                { required: true, message: 'Please input title of video!' }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Tags" name="tags">
              <Select
                mode="tags"
                style={{ width: '100%' }}
                size="middle"
                showArrow={false}
                defaultActiveFirstOption={false}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              label="Participants"
              name="participantIds"
            >
              {firstLoadPerformer && (
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  showSearch
                  placeholder="Search performers here"
                  optionFilterProp="children"
                  onSearch={this.getPerformers.bind(this)}
                  loading={uploading}
                >
                  {performers
                    && performers.length > 0
                    && performers.map((p) => (
                      <Option key={p._id} value={p._id}>
                        <Avatar style={{ width: 24, height: 24 }} src={p?.avatar || '/no-avatar.png'} />
                        {' '}
                        {p?.name || p?.username || 'N/A'}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select>
                <Select.Option key="active" value="active">
                  Active
                </Select.Option>
                <Select.Option key="inactive" value="inactive">
                  Inactive
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="isSaleVideo"
              label="For sale?"
            >
              <Switch
                checkedChildren="Pay per view"
                unCheckedChildren="Subscribe to view"
                checked={isSale}
                onChange={this.onSwitch.bind(this, 'saleVideo')}
              />
            </Form.Item>
          </Col>
          {isSale && (
            <Col md={12} xs={12}>
              <Form.Item name="price" label="Price">
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          )}
          <Col md={12} xs={12}>
            <Form.Item
              name="isSchedule"
              label="Schedule?"
            >
              <Switch
                checkedChildren="Upcoming"
                unCheckedChildren="Recent"
                checked={isSchedule}
                onChange={this.onSwitch.bind(this, 'scheduling')}
              />
            </Form.Item>
          </Col>
          {isSchedule && (
            <Col md={12} xs={12}>
              <Form.Item label="Schedule at">
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(currentDate) => currentDate && currentDate < moment().endOf('day')}
                  defaultValue={scheduledAt}
                  onChange={(val) => this.setState({ scheduledAt: val })}
                />
              </Form.Item>
            </Col>
          )}

          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item
              label="Video File"
            >
              <Upload
                customRequest={() => false}
                listType="picture-card"
                className="avatar-uploader"
                accept="video/*"
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                beforeUpload={(file) => this.beforeUpload(file, 'video')}
              >
                {selectedVideo ? <FileDoneOutlined /> : <VideoCameraAddOutlined />}
              </Upload>
              <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                {(selectedVideo && <a>{selectedVideo.name}</a>)
                  || (previewVideo && (
                    <a href={previewVideo} target="_blank" rel="noreferrer">
                      Click here to preview video
                    </a>
                  ))
                  || `Video file is ${config.MAX_SIZE_VIDEO || 2048}MB or below`}
              </div>
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item
              label="Teaser file"
            >
              <Upload
                customRequest={() => false}
                listType="picture-card"
                className="avatar-uploader"
                accept="video/*"
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                beforeUpload={(file) => this.beforeUpload(file, 'teaser')}
              >
                {selectedTeaser ? <FileDoneOutlined /> : <VideoCameraAddOutlined />}
              </Upload>
              <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                {(selectedTeaser && <a>{selectedTeaser.name}</a>)
                  || (previewTeaser
                    && (
                      <a href={previewTeaser} target="_blank" rel="noreferrer">
                        Click here to preview teaser
                      </a>
                    )
                  )
                  || `Teaser is ${config.MAX_SIZE_TEASER || 200}MB or below`}
              </div>
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item
              label="Thumbnail"
            >
              <ImgCrop aspect={7 / 5} quality={1} modalWidth={768}>
                <Upload
                  customRequest={() => false}
                  listType="picture-card"
                  className="avatar-uploader"
                  accept="image/*"
                  multiple={false}
                  showUploadList={false}
                  disabled={uploading}
                  beforeUpload={(file) => this.beforeUpload(file, 'thumbnail')}
                >
                  {selectedThumbnail ? <FileDoneOutlined /> : <CameraOutlined />}
                </Upload>
              </ImgCrop>
              <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                {(selectedThumbnail && <a>{selectedThumbnail.name}</a>)
                  || (previewThumbnail && (
                    <a href={previewThumbnail} target="_blank" rel="noreferrer">
                      Click here to preview thumbnail
                    </a>
                  ))
                  || `Thumbnail is ${config.MAX_SIZE_IMAGE || 5}MB or below`}
              </div>
            </Form.Item>
          </Col>
        </Row>
        {uploadPercentage ? (
          <Progress percent={Math.round(uploadPercentage)} />
        ) : null}
        <div className="button-bottom-form">
          <Button size="large" type="primary" htmlType="submit" loading={uploading} disabled={uploading}>
            {video ? 'Update' : 'Upload'}
          </Button>
          <Button size="large" onClick={() => Router.back()} disabled={uploading}>
            Back
          </Button>
        </div>
      </Form>
    );
  }
}
