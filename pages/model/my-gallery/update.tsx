import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import FormGallery from '@components/gallery/form-gallery';
import { getResponseError } from '@lib/utils';
import { photoService } from '@services/index';
import {
  Layout, message, PageHeader,
  Spin
} from 'antd';
import getConfig from 'next/config';
import Router from 'next/router';
import { PureComponent } from 'react';
import {
  IGallery
} from 'src/interfaces';
import { galleryService } from 'src/services';

interface IStates {
  submiting: boolean;
  gallery: IGallery;
  loading: boolean;
  filesList: any[];
  uploading: boolean;
}

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

class GalleryUpdatePage extends PureComponent<any, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  constructor(props) {
    super(props);
    this.state = {
      submiting: false,
      gallery: null,
      loading: false,
      filesList: [],
      uploading: false
    };
  }

  componentDidMount() {
    this.getGallery();
  }

  async handleUploadPhotos() {
    const { id } = this.props;
    const data = {
      galleryId: id,
      status: 'active'
    };
    const { filesList } = this.state;
    const uploadFiles = filesList.filter(
      (f) => !f._id && !['uploading', 'done'].includes(f.status)
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const file of uploadFiles) {
      try {
        // eslint-disable-next-line no-continue
        if (['uploading', 'done'].includes(file.status)) continue;
        file.status = 'uploading';
        // eslint-disable-next-line no-await-in-loop
        await photoService.uploadImages(
          file as any,
          data,
          this.onUploading.bind(this, file)
        );
        file.status = 'done';
        file.response = { status: 'success' };
      } catch (e) {
        file.status = 'error';
        message.error(`File ${file?.name} error!`);
      }
    }
  }

  onUploading(file, resp: any) {
    // eslint-disable-next-line no-param-reassign
    file.percent = resp.percentage;
    this.forceUpdate();
  }

  async onFinish(data) {
    try {
      this.setState({ uploading: true });
      const { id } = this.props;
      await galleryService.update(id, data);
      await this.handleUploadPhotos();
      message.success('Updated successfully');
      window.location.reload();
    } catch (e) {
      message.error(getResponseError(e));
      this.setState({ uploading: false });
    }
  }

  async getGallery() {
    try {
      const { id } = this.props;
      await this.setState({ loading: true });
      const gallery = await (await galleryService.findById(id)).data;
      this.getPhotosInGallery();
      this.setState({ gallery, loading: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      Router.back();
    }
  }

  async getPhotosInGallery() {
    try {
      const { id } = this.props;
      const photos = await (await photoService.searchPhotosInGallery({ galleryId: id, limit: 500 })).data;
      this.setState({
        filesList: photos ? photos.data : []
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      Router.back();
    }
  }

  async setCover(file) {
    if (!file._id) {
      return;
    }
    try {
      await this.setState({ submiting: true });
      await photoService.setCoverGallery(file._id);
      message.success('Updated cover successfully!');
      this.getPhotosInGallery();
    } catch (error) {
      message.error(getResponseError(await error));
    } finally {
      this.setState({ submiting: false });
    }
  }

  async removePhoto(file) {
    const { filesList } = this.state;
    if (!file._id) {
      this.setState({ filesList: filesList.filter((f) => f?.uid !== file?.uid) });
      return;
    }
    if (!window.confirm('Are you sure to remove this photo?')) return;
    try {
      await this.setState({ submiting: true });
      await photoService.delete(file._id);
      message.success('Deleted success');
      this.setState({ filesList: filesList.filter((p) => p._id !== file._id), submiting: false });
    } catch (error) {
      message.error(getResponseError(await error) || 'Something went wrong, please try again later');
      this.setState({ submiting: false });
    }
  }

  async beforeUpload(file, files) {
    const { publicRuntimeConfig: config } = getConfig();
    if (file.size / 1024 / 1024 > (config.MAX_SIZE_IMAGE || 5)) {
      message.error(`${file.name} is over ${config.MAX_SIZE_IMAGE || 5}MB`);
      return false;
    }
    getBase64(file, (imageUrl) => {
      // eslint-disable-next-line no-param-reassign
      file.thumbUrl = imageUrl;
    });
    const { filesList } = this.state;
    this.setState({ filesList: [...filesList, ...files] });
    return true;
  }

  render() {
    const {
      gallery, submiting, loading, filesList, uploading
    } = this.state;
    return (
      <Layout>
        <PageTitle title="Edit Gallery" />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="Edit Gallery"
          />
          {!loading && gallery && (
          <FormGallery
            gallery={gallery}
            onFinish={this.onFinish.bind(this)}
            submiting={submiting || uploading}
            filesList={filesList}
            handleBeforeUpload={this.beforeUpload.bind(this)}
            removePhoto={this.removePhoto.bind(this)}
            setCover={this.setCover.bind(this)}
          />
          )}
          {loading && <div className="text-center"><Spin /></div>}
        </div>
      </Layout>
    );
  }
}

export default GalleryUpdatePage;
