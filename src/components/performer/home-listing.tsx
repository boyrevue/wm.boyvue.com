import { StarOutlined } from '@ant-design/icons';
import { performerService } from '@services/performer.service';
import {
  Col, message, Row, Spin
} from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import PerformerCard from './card';
import style from './home-listing.module.less';

interface Props {
  isRanking?: boolean;
}

export function HomePerformers({ isRanking = false }: Props) {
  const limit = 16;
  const [filter] = useState({
    sortBy: 'popular'
  });
  const [fetching, setFetching] = useState(false);
  const [performers, setPerformers] = useState([]);
  const [total, setTotal] = useState(0);

  const getPerformers = async (page = 1) => {
    try {
      const offset = (page - 1) * limit;
      setFetching(true);
      const resp = await performerService.search({
        limit,
        offset,
        ...filter
      });
      setPerformers(resp.data.data);
      setTotal(resp.data.total);
      setFetching(false);
    } catch {
      message.error('Error occured, please try again later');
      setFetching(false);
    }
  };

  const searchTopPerformers = async () => {
    try {
      setFetching(true);
      const resp = await performerService.topModels();
      setPerformers(resp.data);
      setFetching(false);
    } catch (e) {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isRanking) {
      searchTopPerformers();
    } else { getPerformers(); }
  }, [filter]);

  return (
    <div>
      {/* <div className={style['title-home']}>
        <h3>Content Creators waiting for you...</h3>
      </div> */}
      <Row className="list-performer">
        {performers.length > 0 && performers.map((p: any) => (
          <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
            <PerformerCard performer={p} />
          </Col>
        ))}
      </Row>
      {fetching && <div className="text-center" style={{ margin: 20 }}><Spin /></div>}
      {total > 16 && (
        <div className={style['show-all']}>
          <Link href="/model">
            <a>
              <StarOutlined />
              {' '}
              All Models
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}

HomePerformers.authenticate = true;
HomePerformers.noredirect = true;

export default HomePerformers;
