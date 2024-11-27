import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import FormGallery from '@components/gallery/form-gallery';
import { getResponseError } from '@lib/utils';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import { useState } from 'react';
import { galleryService } from 'src/services';

function GalleryCreatePage() {
  const [submiting, setSubmitting] = useState(false);

  const onFinish = async (data) => {
    try {
      setSubmitting(true);
      await galleryService.create(data);
      message.success('Created successfully!');
      Router.push('/model/my-gallery/listing');
    } catch (e) {
      setSubmitting(false);
      message.error(getResponseError(await e) || 'An error occurred, please try again!');
    }
  };

  return (
    <Layout>
      <PageTitle title="New gallery" />
      <div className="main-container-900">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title="New Gallery"
        />
        <FormGallery
          submiting={submiting}
          onFinish={onFinish}
        />
      </div>
    </Layout>
  );
}

GalleryCreatePage.authenticate = true;
GalleryCreatePage.onlyPerformer = true;

export default GalleryCreatePage;
