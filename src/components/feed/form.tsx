/* eslint-disable react/require-default-props */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-await-in-loop */
import {
  BarChartOutlined,
  FileAddOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  SmileOutlined,
  VideoCameraAddOutlined
} from '@ant-design/icons';
import PostUploadList from '@components/feed/feed-list-media';
// import FeedEmotions from '@components/messages/emotions';
import { Emotions } from '@components/messages/emotions';
import { formatDate } from '@lib/date';
import { feedService } from '@services/index';
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  message,
  Popover,
  Progress,
  Row,
  Space,
  Switch,
  Tooltip,
  Upload
} from 'antd';
import moment from 'moment';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IFeed } from 'src/interfaces';

import AddPollDurationForm from './add-poll-duration';
import style from './index.module.less';

const { TextArea } = Input;
const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};
interface IProps {
  type?: string;
  discard?: Function;
  feed?: IFeed;
}
const validateMessages = {
  required: 'This field is required!'
};

export default class FeedForm extends PureComponent<IProps> {
  pollIds = [];

  thumbnailId = '';

  teaserId = '';

  teaser = null;

  formRef: FormInstance;

  state = {
    uploading: false,
    thumbnail: null,
    fileList: [],
    fileIds: [],
    isSale: false,
    addPoll: false,
    openPollDuration: false,
    expirePollTime: 7,
    expiredPollAt: moment().endOf('day').add(7, 'days'),
    text: ''
  };

  componentDidMount() {
    const { feed } = this.props;
    if (feed) {
      this.setState({
        fileList: feed.files ? feed.files : [],
        fileIds: feed.fileIds ? feed.fileIds : [],
        isSale: feed.isSale,
        addPoll: !!feed.pollIds.length,
        thumbnail: feed.thumbnailUrl,
        text: feed.text
      });
      this.teaser = feed.teaser;
      const pollList = feed.polls.map((poll) => ({
        id: poll._id,
        value: poll.description
      }));
      this.formRef.setFieldsValue({
        pollList
      });
    }
  }

  async onAddMore(file, listFile) {
    const { fileList, fileIds } = this.state;
    if (!listFile.length) {
      return;
    }
    if (listFile.indexOf(file) === listFile.length - 1) {
      const files = await Promise.all(
        listFile.map((f) => {
          const newFile = f;
          if (newFile.type.includes('video')) return f;
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            newFile.thumbnail = reader.result;
          });
          reader.readAsDataURL(newFile);
          return newFile;
        })
      );
      await this.setState({
        fileList: [...fileList, ...files],
        uploading: true
      });
      const newFileIds = [...fileIds];
      // eslint-disable-next-line no-restricted-syntax
      for (const fileItem of listFile) {
        const { type } = this.props;
        if (type === 'photo' && fileItem.type.indexOf('image') === -1) {
          message.error('Invalid photo');
          return;
        }
        if (type === 'video' && fileItem.type.indexOf('video') === -1) {
          message.error('Invalid video');
          return;
        }
        try {
          // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(fileItem.status) || fileItem._id) { continue; }
          fileItem.status = 'uploading';
          const resp = (
            fileItem.type.indexOf('image') > -1
              ? await feedService.uploadPhoto(
                fileItem,
                {},
                this.onUploading.bind(this, fileItem)
              )
              : await feedService.uploadVideo(
                fileItem,
                {},
                this.onUploading.bind(this, fileItem)
              )
          ) as any;
          newFileIds.push(resp.data._id);
          fileItem._id = resp.data._id;
        } catch (e) {
          message.error(`File ${fileItem.name} error!`);
        }
      }
      this.setState({ uploading: false, fileIds: newFileIds });
    }
  }

  onUploading(file, resp: any) {
    // eslint-disable-next-line no-param-reassign
    file.percent = resp.percentage;
    // eslint-disable-next-line no-param-reassign
    if (file.percent === 100) file.status = 'done';
    this.forceUpdate();
  }

  async onAddPoll() {
    const { addPoll } = this.state;
    this.setState({ addPoll: !addPoll });
    if (!addPoll) {
      this.pollIds = [];
      this.formRef.setFieldsValue({
        pollList: [
          {
            id: 1,
            value: ''
          },
          {
            id: 2,
            value: ''
          }
        ]
      });
    }
  }

  async onsubmit(feed, values) {
    const { type } = this.props;
    try {
      await this.setState({ uploading: true });
      !feed
        ? await feedService.create({ ...values, type })
        : await feedService.update(feed._id, { ...values, type: feed.type });
      message.success('Posted successfully!');
      Router.push('/model/my-feed');
    } catch {
      message.error('Something went wrong, please try again later');
    } finally {
      this.setState({ uploading: false });
    }
  }

  async onChangePollDuration(numberDays) {
    const date = !numberDays
      ? moment().endOf('day').add(99, 'years')
      : moment().endOf('day').add(numberDays, 'days');
    this.setState({
      openPollDuration: false,
      expiredPollAt: date,
      expirePollTime: numberDays
    });
  }

  async onClearPolls() {
    this.formRef.setFieldsValue({ pollList: [] });
    this.pollIds = [];
  }

  onEmojiClick = (emojiObject) => {
    const { text } = this.state;
    this.setState({ text: `${text} ${emojiObject}` });
  };

  addGoal = () => {
    const pollList = this.formRef.getFieldValue('pollList');
    this.formRef.setFieldsValue({
      pollList: [
        ...pollList,
        {
          id: pollList.length + 1,
          value: ''
        }
      ]
    });
  };

  async remove(file) {
    const { fileList, fileIds } = this.state;
    this.setState({
      fileList: fileList.filter((f) => (f._id ? f._id !== file._id : f.uid !== file.uid)),
      fileIds: fileIds.filter((id) => id !== file?._id)
    });
  }

  async beforeUpload(file, fileList) {
    await this.setState({ fileList: [] });
    if (fileList.indexOf(file) === fileList.length - 1) {
      const files = await Promise.all(
        fileList.map((f) => {
          if (f._id || f.type.includes('video')) return f;
          const reader = new FileReader();
          // eslint-disable-next-line no-param-reassign
          reader.addEventListener('load', () => {
            // eslint-disable-next-line no-param-reassign
            f.thumbnail = reader.result;
          });
          reader.readAsDataURL(f);
          return f;
        })
      );
      await this.setState({ fileList: files, uploading: true });
      const newFileIds = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const newFile of fileList) {
        try {
          // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(newFile.status) || newFile._id) { continue; }
          newFile.status = 'uploading';
          const resp = (
            newFile.type.indexOf('image') > -1
              ? await feedService.uploadPhoto(
                newFile,
                {},
                this.onUploading.bind(this, newFile)
              )
              : await feedService.uploadVideo(
                newFile,
                {},
                this.onUploading.bind(this, newFile)
              )
          ) as any;
          newFileIds.push(resp.data._id);
          newFile._id = resp.data._id;
        } catch (e) {
          message.error(`File ${newFile.name} error!`);
        }
      }
      this.setState({ uploading: false, fileIds: newFileIds });
    }
  }

  async beforeUploadThumbnail(file) {
    if (!file) {
      return;
    }
    const isLt2M = file.size / 1024 / 1024 <= 5;
    if (!isLt2M) {
      message.error('Image is too large please provide an image 5MB or below');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.setState({ thumbnail: reader.result });
    });
    reader.readAsDataURL(file);
    try {
      await this.setState({ uploading: true });
      const resp = (await feedService.uploadThumbnail(
        file,
        {},
        this.onUploading.bind(this, file)
      )) as any;
      this.thumbnailId = resp.data._id;
    } catch (e) {
      message.error(`Thumbnail file ${file.name} error!`);
    } finally {
      this.setState({ uploading: false });
    }
  }

  async beforeUploadteaser(file) {
    if (!file) {
      return;
    }
    const isLt2M = file.size / 1024 / 1024 < 100;
    if (!isLt2M) {
      message.error(
        'Teaser video is too large please provide an video 100MB or below'
      );
      return;
    }
    this.teaser = file;
    try {
      const resp = (await feedService.uploadTeaser(
        file,
        {},
        this.onUploading.bind(this, this.teaser)
      )) as any;
      this.teaserId = resp.data._id;
    } catch (e) {
      message.error(`teaser file ${file.name} error!`);
    } finally {
      this.setState({ uploading: false });
    }
  }

  async submit(payload: any) {
    const { feed, type } = this.props;
    const {
      addPoll, isSale, expiredPollAt, fileIds, text
    } = this.state;
    if (!text.trim()) {
      message.error('Please add a description');
      return;
    }
    const formValues = { ...payload };
    if (formValues.price < 1) {
      message.error('Price must be greater than $1');
      return;
    }
    if (this.teaserId) {
      formValues.teaserId = this.teaserId;
    }
    if (this.thumbnailId) {
      formValues.thumbnailId = this.thumbnailId;
    }
    formValues.isSale = isSale;
    formValues.text = text;
    formValues.fileIds = fileIds;
    if (['video', 'photo'].includes(feed?.type || type) && !fileIds.length) {
      message.error(`Please add ${feed?.type || type} file`);
      return;
    }
    // create polls
    if (addPoll && payload.pollList?.length < 2) {
      message.error('Polls must have at least 2 options');
      return;
    }
    if (addPoll && payload.pollList?.length >= 2) {
      this.setState({ uploading: true });
      // eslint-disable-next-line no-restricted-syntax
      for (const poll of payload.pollList) {
        if (poll.value && poll.value.trim().length && !poll._id) {
          try {
            const resp = await feedService.addPoll({
              description: poll.value,
              expiredAt: expiredPollAt
            });
            if (resp && resp.data) {
              this.pollIds = [...this.pollIds, ...[resp.data._id]];
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log('err_create_poll', await e);
          }
        }
      }
      formValues.pollIds = this.pollIds;
      formValues.pollExpiredAt = expiredPollAt;
      this.onsubmit(feed, formValues);
    } else {
      this.onsubmit(feed, formValues);
    }
  }

  render() {
    const { feed, type, discard } = this.props;
    const {
      uploading,
      fileList,
      fileIds,
      isSale,
      text,
      addPoll,
      openPollDuration,
      expirePollTime,
      thumbnail
    } = this.state;
    return (
      <div className="feed-form">
        <Form
          {...layout}
          onFinish={(values) => {
            this.submit(values);
          }}
          ref={(ref) => {
            this.formRef = ref;
          }}
          validateMessages={validateMessages}
          initialValues={
            feed || {
              text: '',
              price: 9.99,
              isSale: false,
              pollList: []
            }
          }
        >
          <div className={style['input-f-desc']}>
            <TextArea
              value={text}
              onChange={(e) => this.setState({ text: e.target.value })}
              className={style['feed-input']}
              rows={3}
              placeholder={
                !fileIds.length ? 'Compose new post...' : 'Add a description'
              }
              allowClear
            />
            <span className="grp-emotions">
              {/* <SmileOutlined /> */}
              {/* <FeedEmotions onEmojiClick={this.onEmojiClick.bind(this)} /> */}
              <Popover
                content={
                  <Emotions onEmojiClick={this.onEmojiClick.bind(this)} />
                }
                trigger="click"
              >
                <div className="grp-emotions">
                  <SmileOutlined />
                </div>
              </Popover>
            </span>
          </div>
          {/* {['video', 'photo'].includes(feed?.type || type) && (
            <Form.Item name="tagline">
              <Input className={style['feed-input']} placeholder="Add a tagline here" />
            </Form.Item>
          )} */}
          {addPoll && (
            <div className={style['poll-form']}>
              <div className="poll-top">
                {!feed ? (
                  <>
                    <span
                      aria-hidden="true"
                      onClick={() => this.setState({ openPollDuration: true })}
                    >
                      Poll duration -
                      {' '}
                      {!expirePollTime ? 'No limit' : `${expirePollTime} days`}
                    </span>
                    <a aria-hidden="true" onClick={this.onAddPoll.bind(this)}>
                      x
                    </a>
                  </>
                ) : (
                  <span className="poll-expiration">
                    <span>Poll expiration: </span>
                    <span>{formatDate(feed?.pollExpiredAt)}</span>
                  </span>
                )}
              </div>

              <Row>
                <Col span={24}>
                  <Form.Item shouldUpdate style={{ marginBottom: 0 }}>
                    {(formInstance) => {
                      const _pollList = formInstance.getFieldValue('pollList');
                      return _pollList?.map((arrItem) => (
                        <div style={{ marginBottom: '20px', display: 'flex' }}>
                          <span style={{ margin: '5px' }}>Poll:</span>
                          <Input
                            style={{
                              borderRadius: '15px',
                              border: '1px solid #7b5dbd'
                            }}
                            required
                            placeholder="Input poll name"
                            disabled={!!feed?._id}
                            value={arrItem.value}
                            onChange={(e) => {
                              if (e.target.value && e.target.value.trim() === '') {
                                message.info('You input only space, please input valid poll name');
                                return;
                              }
                              this.formRef.setFieldsValue({
                                pollList: _pollList.map((t) => {
                                  if (t.id === arrItem.id) {
                                    return {
                                      ...t,
                                      value: e.target.value
                                    };
                                  }
                                  return t;
                                })
                              });
                            }}
                            allowClear
                          />
                        </div>
                      ));
                    }}
                  </Form.Item>
                  <Form.Item name="pollList" hidden>
                    <Input />
                  </Form.Item>
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    <Space align="center" direction="horizontal">
                      <Button
                        onClick={this.addGoal.bind(this)}
                        type="primary"
                        disabled={!!feed?._id}
                      >
                        More Poll
                      </Button>
                      <Button
                        onClick={this.onClearPolls.bind(this)}
                        type="primary"
                        disabled={!!feed?._id}
                      >
                        Clear polls
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>
          )}
          <PostUploadList
            canAddMore={feed?.type === 'photo' || type === 'photo'}
            type={feed?.type || type}
            files={fileList}
            remove={this.remove.bind(this)}
            onAddMore={this.onAddMore.bind(this)}
            uploading={uploading}
          />
          {type !== 'text' && (
            <Form.Item>
              <Switch
                checkedChildren="PPV content"
                unCheckedChildren="Free content"
                checked={isSale}
                onChange={() => this.setState({ isSale: !isSale })}
              />
            </Form.Item>
          )}
          {isSale && (
            <Form.Item
              label="Set price here"
              name="price"
              rules={[{ required: isSale, message: 'Please add price' }]}
            >
              <InputNumber min={1} />
            </Form.Item>
          )}
          {thumbnail && (
            <Form.Item label="Thumbnail">
              <img alt="thumbnail" src={thumbnail} width="100px" />
            </Form.Item>
          )}
          {this.teaser && (
            <Form.Item label="Teaser">
              <div className={style['f-upload-list']}>
                <div className="f-upload-item">
                  <div className="f-upload-thumb">
                    <span className="f-thumb-vid">
                      <PlayCircleOutlined />
                    </span>
                  </div>
                  <div className="f-upload-name">
                    <Tooltip placement="top" title={this.teaser?.name}>
                      {this.teaser?.name}
                    </Tooltip>
                  </div>
                  <div className="f-upload-size">
                    {(this.teaser.size / (1024 * 1024)).toFixed(2)}
                    {' '}
                    MB
                  </div>
                  {this.teaser.percent && (
                    <Progress percent={Math.round(this.teaser.percent)} />
                  )}
                </div>
              </div>
            </Form.Item>
          )}
          <AddPollDurationForm
            onAddPollDuration={this.onChangePollDuration.bind(this)}
            openDurationPollModal={openPollDuration}
          />
          <div className={style['button-feed']}>
            {['video', 'photo'].includes(feed?.type || type) && [
              <Upload
                key="upload_media_file"
                customRequest={() => true}
                accept={
                  feed?.type === 'video' || type === 'video'
                    ? 'video/*'
                    : 'image/*'
                }
                beforeUpload={this.beforeUpload.bind(this)}
                multiple={feed?.type === 'photo' || type === 'photo'}
                showUploadList={false}
                disabled={uploading}
                listType="picture"
              >
                <Button type="primary">
                  <FileAddOutlined />
                  {' '}
                  Add file
                </Button>
              </Upload>,
              <Upload
                key="upload_thumb"
                customRequest={() => true}
                accept={'image/*'}
                beforeUpload={this.beforeUploadThumbnail.bind(this)}
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                listType="picture"
              >
                <Button type="primary">
                  <PictureOutlined />
                  {' '}
                  Add thumbnail
                </Button>
              </Upload>
            ]}
            {['video'].includes(feed?.type || type) && [
              <Upload
                key="upload_teaser"
                customRequest={() => true}
                accept={'video/*'}
                beforeUpload={this.beforeUploadteaser.bind(this)}
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                listType="picture"
              >
                <Button type="primary">
                  <VideoCameraAddOutlined />
                  {' '}
                  Add teaser
                </Button>
              </Upload>
            ]}
            <Button
              disabled={addPoll || !!(feed && feed._id)}
              type="primary"
              onClick={this.onAddPoll.bind(this)}
            >
              <BarChartOutlined style={{ transform: 'rotate(90deg)' }} />
              Add polls
            </Button>
          </div>
          <div className={style['submit-btns']}>
            <Button
              className="primary"
              htmlType="submit"
              loading={uploading}
              disabled={uploading}
            >
              {!feed ? 'Post' : 'Update'}
            </Button>
            {(!feed || !feed._id) && (
              <Button
                onClick={() => discard()}
                className="secondary"
                disabled={uploading}
              >
                Discard
              </Button>
            )}
          </div>
        </Form>
      </div>
    );
  }
}
