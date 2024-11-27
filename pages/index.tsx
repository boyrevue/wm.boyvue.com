import {
  RocketOutlined
} from '@ant-design/icons';
import { Banner } from '@components/common';
import SeoMetaHead from '@components/common/seo-meta-head';
import { HomePerformers } from '@components/performer';
import {
  bannerService, settingService
} from '@services/index';
import {
  Button,
  Layout
} from 'antd';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  IBanner
} from 'src/interfaces';

type IProps = {
  banners: IBanner[];
  metaTitle: string,
  metaKeywords: string;
  metaDescription: string;
  enableModelRankingHomePage: boolean;
}

function HomePage({
  banners,
  metaKeywords,
  metaDescription,
  metaTitle,
  enableModelRankingHomePage
}: IProps) {
  const ui = useSelector((state: any) => state.ui);
  const user = useSelector((state: any) => state.user.current);

  const topBanners = banners.filter((b) => b.position === 'top');
  const bottomBanners = banners.filter((b) => b.position === 'bottom');
  const seoItem = {
    title: metaTitle,
    description: metaDescription
  };
  return (
    <Layout>
      <SeoMetaHead item={seoItem} pageTitle={metaTitle} keywords={metaKeywords} imageUrl={ui.logo} />
      <div className="home-page">
        {topBanners?.length > 0 && (
          <div className="banner">
            <Banner banners={topBanners} />
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <div className="main-container">
            <HomePerformers isRanking={enableModelRankingHomePage} />
            {bottomBanners?.length > 0 && (
              <Banner effect="fade" arrows={false} dots banners={bottomBanners} />
            )}

            <div className="signup-grp-btns">
              {!user?._id && (
                <Link href="/auth/model-register">
                  <Button className="primary">
                    <RocketOutlined />
                    {' '}
                    BECOME A CONTENT CREATORS
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

HomePage.authenticate = false;

HomePage.getInitialProps = async () => {
  try {
    const [banners, meta] = await Promise.all([
      bannerService.search({ limit: 99, status: 'active' }),
      settingService.valueByKeys(['homeMetaKeywords', 'homeMetaDescription', 'homeTitle', 'enableModelRankingHomePage'])
    ]);
    return {
      banners: banners?.data?.data || [],
      metaKeywords: meta.homeMetaKeywords || '',
      metaDescription: meta.homeMetaDescription || '',
      metaTitle: meta.homeTitle || '',
      enableModelRankingHomePage: meta.enableModelRankingHomePage || false
    };
  } catch {
    return {
      banners: []
    };
  }
};

export default HomePage;
