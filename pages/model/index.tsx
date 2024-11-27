import '@components/performer/performer.module.less';

import { StarOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import PerformerCard from '@components/performer/card';
import { PerformerAdvancedFilter } from '@components/performer/common/performer-advanced-filter';
import { categoryService, performerService, utilsService } from '@services/index';
import {
  Col, Layout,
  message,
  Pagination, Row, Spin
} from 'antd';
import { useEffect, useState } from 'react';
import { IBody, ICountry } from 'src/interfaces';

type IProps = {
  countries: ICountry[];
  bodyInfo: IBody;
  categories: any;
  categoryId: string;
}

function Performers({
  countries,
  bodyInfo,
  categories,
  categoryId = ''
}: IProps) {
  const limit = 12;
  const [filter, setFilter] = useState(categoryId ? {
    categoryIds: categoryId,
    sortBy: 'popular'
  } : {
    sortBy: 'popular'
  });
  const [fetching, setFetching] = useState(false);
  const [results, setResults] = useState({
    data: [],
    total: 0
  });

  const getPerformers = async (page = 1) => {
    try {
      const offset = (page - 1) * limit;
      setFetching(true);
      const resp = await performerService.search({
        limit,
        offset,
        ...filter
      });
      setResults(resp.data);
      setFetching(false);
    } catch {
      message.error('Error occured, please try again later');
      setFetching(false);
    }
  };

  const handleFilter = (values: any) => {
    setFilter({
      ...filter,
      ...values
    });
  };

  useEffect(() => {
    setFilter({
      ...filter,
      categoryIds: categoryId
    });
  }, [categoryId]);

  useEffect(() => {
    getPerformers();
  }, [filter]);

  return (
    <Layout>
      <PageTitle title="Models" />
      <div className="main-container">
        <h3 className="page-heading">
          <span className="box">
            <StarOutlined />
            {' '}
            Content Creators
          </span>
        </h3>
        <div className="md-below-heading">
          <PerformerAdvancedFilter
            onSubmit={handleFilter}
            countries={countries || []}
            bodyInfo={bodyInfo}
            categories={categories}
            categoryId={categoryId}
          />
        </div>
        <Row className="list-performer">
          {results.data.map((p: any) => (
            <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
              <PerformerCard
                performer={p}
              />
            </Col>
          ))}
        </Row>
        {!results.total && !fetching && <p className="text-center">No model was found</p>}
        {fetching && <div className="text-center" style={{ margin: 30 }}><Spin /></div>}
        {results.total > limit ? (
          <div className="paging">
            <Pagination
              total={results.total}
              pageSize={limit}
              onChange={getPerformers}
              showSizeChanger={false}
            />
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

Performers.authenticate = true;
Performers.noredirect = true;

Performers.getInitialProps = async (ctx) => {
  const [countries, bodyInfo, categories] = await Promise.all([
    utilsService.countriesList(),
    utilsService.bodyInfo(),
    categoryService.search({ group: 'performer' })
  ]);
  return {
    countries: countries?.data || [],
    bodyInfo: bodyInfo?.data,
    categories: categories?.data?.data || [],
    categoryId: ctx?.query?.categoryId || ''
  };
};

export default Performers;
