import {
  Button, Col, Form,
  FormInstance, Input,
  Row
} from 'antd';
import Router from 'next/router';
import { useRef, useState } from 'react';

import style from './search-filter.module.less';

function SearchFilter() {
  const [searchVal] = useState(process.browser ? Router.query : {} as any);
  const formRef = useRef<FormInstance>(null);

  const onSearch = () => {
    Router.push({
      pathname: '/search',
      query: {
        ...searchVal
      }
    });
  };

  return (
    <div className={style['filter-main']}>
      <Form
        ref={formRef}

      >
        <Row className={style['ant-row-search']} gutter={24}>
          <Col lg={6} xs={12}>
            <strong>Model</strong>
            <Input name="modelName" placeholder="Enter model name...." />
          </Col>
          <Col lg={6} xs={12}>
            <strong>Video</strong>
            <Input name="videoName" placeholder="Enter video name...." />
          </Col>
          <Col lg={6} xs={12}>
            <strong>Gallery</strong>
            <Input name="galleryName" placeholder="Enter gallery name...." />
          </Col>
          <Col lg={6} xs={12}>
            <strong>Product</strong>
            <Input name="productName" placeholder="Enter product name...." />
          </Col>
          <Col lg={18} md={18} />
          <Col span={6} className="custom-col">
            <Button onClick={() => onSearch()} className="custom-btn">
              Search
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default SearchFilter;
