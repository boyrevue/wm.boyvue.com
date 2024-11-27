import { UploadOutlined } from '@ant-design/icons';
import { SelectCategoryDropdown } from '@components/common/select-category-dropdown';
import UploadFileList from '@components/file/list-media';
import { productService } from '@services/index';
import {
  Button, Col,
  Form, Input, InputNumber, message, Progress, Row, Select, Upload
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import getConfig from 'next/config';
import { createRef, PureComponent } from 'react';
import { IProduct } from 'src/interfaces';

import style from './form-product.module.less';

type IProps = {
  product?: IProduct;
  submit?: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

export class FormProduct extends PureComponent<IProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    product: undefined,
    submit: () => {},
    beforeUpload: () => {},
    uploading: false,
    uploadPercentage: 0
  };

  state = {
    photoUploading: false,
    isDigitalProduct: false,
    imageIds: [],
    imageList: []
  };

  formRef: any;

  componentDidMount() {
    const { product } = this.props;
    if (product) {
      this.setState({
        isDigitalProduct: product.type === 'digital',
        imageIds: product.imageIds || [],
        imageList: product.images || []
      });
    }
  }

  onUploading(file, resp: any) {
    // eslint-disable-next-line no-param-reassign
    file.percent = resp.percentage;
    // eslint-disable-next-line no-param-reassign
    if (file.percent === 100) file.status = 'done';
    this.forceUpdate();
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
    if (field === 'type') {
      this.setState({ isDigitalProduct: val === 'digital' });
    }
  }

  async beforeUploadImage(file, fileList) {
    const { publicRuntimeConfig: config } = getConfig();
    const isLt2M = file.size / 1024 / 1024 < (config.MAX_SIZE_IMAGE || 5);
    if (!isLt2M) {
      message.error(`Image must be smaller than ${config.MAX_SIZE_IMAGE || 5}MB!`);
      return;
    }
    const { imageIds, imageList } = this.state;
    if (!fileList.length) {
      this.setState({ imageList: [] });
      return;
    }
    if (fileList.indexOf(file) === (fileList.length - 1)) {
      const files = await Promise.all(fileList.map((f) => {
        if (f._id) return f;
        const reader = new FileReader();
        // eslint-disable-next-line no-param-reassign
        reader.addEventListener('load', () => { f.thumbnail = reader.result; });
        reader.readAsDataURL(f);
        return f;
      }));
      await this.setState({ imageList: [...imageList, ...files], photoUploading: true });
      const newFileIds = [...imageIds];
      // eslint-disable-next-line no-restricted-syntax
      for (const newFile of fileList) {
        try {
          // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(newFile.status) || newFile._id) continue;
          newFile.status = 'uploading';
          // eslint-disable-next-line no-await-in-loop
          const resp = await productService.uploadImage(
            newFile,
            {},
            this.onUploading.bind(this, newFile)
          ) as any;
          newFileIds.push(resp.data._id);
          newFile._id = resp.data._id;
        } catch (e) {
          message.error(`File ${newFile.name} error!`);
        }
      }
      this.setState({ photoUploading: false, imageIds: [...newFileIds] });
    }
  }

  beforeUploadDigital(file) {
    const { beforeUpload } = this.props;
    const isLt2M = file.size / 1024 / 1024 < (200);
    if (!isLt2M) {
      message.error('Digital file must be smaller than 200MB!');
      return false;
    }
    beforeUpload && beforeUpload(file);
    return isLt2M;
  }

  async remove(file) {
    const { imageList, imageIds } = this.state;
    this.setState({
      imageList: imageList.filter((f) => f?.uid !== file?.uid || f?._id !== file?._id)
    });
    if (file._id) {
      this.setState({
        imageIds: imageIds.filter((id) => id !== file._id)
      });
    }
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      product, submit, uploading, uploadPercentage
    } = this.props;
    const {
      isDigitalProduct, photoUploading, imageList, imageIds
    } = this.state;
    return (
      <Form
        {...layout}
        onFinish={(values) => {
          const payload = { ...values };
          payload.imageIds = imageIds;
          submit(payload);
        }}
        onFinishFailed={() => message.error('Please complete the required fields')}
        name="form-upload"
        className={style['account-form']}
        ref={this.formRef}
        validateMessages={validateMessages}
        initialValues={
          product || ({
            name: '',
            price: 9.99,
            description: '',
            status: 'active',
            categoryIds: [],
            stock: 99,
            type: 'physical'
          } as IProduct)
        }
      >
        <Row>
          <Col md={12} xs={24}>
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Please input name of product!' }
              ]}
              label="Name"
            >
              <Input placeholder="Enter product name" />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select type!' }]}>
              <Select onChange={(val) => this.setFormVal('type', val)}>
                <Select.Option key="physical" value="physical">
                  Physical
                </Select.Option>
                <Select.Option key="digital" value="digital">
                  Digital
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item name="price" label="Price" required>
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
          {!isDigitalProduct && (
            <Col md={12} xs={24}>
              <Form.Item name="stock" label="Stock" required>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          )}
          <Col md={12} xs={24}>
            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status!' }]}>
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
          <Col md={12} xs={24}>
            <Form.Item label="Categories" name="categoryIds">
              <SelectCategoryDropdown
                noEmtpy
                defaultValue={product?.categoryIds || []}
                group="product"
                onSelect={(val) => this.setFormVal('categoryIds', val)}
                isMultiple
              />
            </Form.Item>
          </Col>
          <Col md={24} xs={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
          {isDigitalProduct && (
            <Col md={24} xs={24}>
              <Form.Item label="Digital file">
                <Upload
                  multiple={false}
                  showUploadList
                  listType="picture-card"
                  disabled={uploading || photoUploading}
                  beforeUpload={this.beforeUploadDigital.bind(this)}
                >
                  <UploadOutlined />
                </Upload>
                {product?.digitalFile && <div className="ant-form-item-explain" style={{ textAlign: 'left' }}><a href={product?.digitalFile} target="_blank" rel="noreferrer">Click here to download</a></div>}
              </Form.Item>
            </Col>
          )}
          <Col md={24} xs={24}>
            <Form.Item label="Images">
              <UploadFileList files={imageList} beforeUpload={this.beforeUploadImage.bind(this)} uploading={uploading || photoUploading} remove={this.remove.bind(this)} />
            </Form.Item>
          </Col>
        </Row>
        {uploadPercentage ? <Progress percent={uploadPercentage} /> : null}
        <div className="button-bottom-form">
          <Button type="primary" size="large" htmlType="submit" loading={uploading || photoUploading} disabled={uploading || photoUploading}>
            {product ? 'Update' : 'Upload'}
          </Button>
        </div>
      </Form>
    );
  }
}
