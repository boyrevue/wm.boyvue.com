import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { FormUploadVideo } from '@components/video/form-upload';
import { getResponseError } from '@lib/utils';
import { videoService } from '@services/video.service';
import {
  Layout, message, PageHeader,
  Spin
} from 'antd';
import moment from 'moment';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUser, IVideo } from 'src/interfaces';

type IProps = {
  id: string;
  user: IUser;
}

interface IFiles {
  fieldname: string;
  file: File;
}

class VideoUpdate extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    fetching: true,
    uploading: false,
    uploadPercentage: 0,
    video: {} as IVideo
  };

  _files: {
    thumbnail: File;
    teaser: File;
    video: File;
  } = {
      thumbnail: null,
      teaser: null,
      video: null
    };

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  async componentDidMount() {
    try {
      const { id } = this.props;
      const resp = await videoService.findById(id);
      this.setState({ video: resp.data });
    } catch (e) {
      message.error('Video not found!');
      Router.back();
    } finally {
      this.setState({ fetching: false });
    }
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(data: any) {
    const { video } = this.state;
    const submitData = { ...data };
    if ((data.isSale && !data.price) || (data.isSale && data.price < 1)) {
      message.error('Invalid amount of tokens');
      return;
    }
    if ((data.isSchedule && !data.scheduledAt) || (data.isSchedule && moment(data.scheduledAt).isBefore(moment()))) {
      message.error('Invalid schedule date');
      return;
    }
    submitData.tags = [...data.tags];
    submitData.participantIds = [...data.participantIds];
    const files = Object.keys(this._files).reduce((f, key) => {
      if (this._files[key]) {
        f.push({
          fieldname: key,
          file: this._files[key] || null
        });
      }
      return f;
    }, [] as IFiles[]) as [IFiles];

    await this.setState({
      uploading: true
    });
    try {
      await videoService.update(
        video._id,
        files,
        data,
        this.onUploading.bind(this)
      );
      message.success('Video has been uploaded');
      Router.push('/model/my-video');
    } catch (error) {
      message.error(getResponseError(error) || 'An error occurred, please try again!');
    } finally {
      this.setState({ uploading: false });
    }
  }

  render() {
    const {
      video, uploading, fetching, uploadPercentage
    } = this.state;
    const { user } = this.props;
    return (
      <Layout>
        <PageTitle title="Edit video" />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="Edit Video"
          />
          {!fetching && video ? (
            <FormUploadVideo
              user={user}
              video={video}
              submit={this.submit.bind(this)}
              uploading={uploading}
              beforeUpload={this.beforeUpload.bind(this)}
              uploadPercentage={uploadPercentage}
            />
          ) : <div className="text-center"><Spin /></div>}
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  user: state.user.current
});
export default connect(mapStates)(VideoUpdate);
