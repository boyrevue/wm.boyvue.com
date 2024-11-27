import CookiePolicy from '@components/common/layout/cookie-policy';
import { blockService } from '@services/index';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ISettings } from 'src/interfaces';

import BlankLayout from './blank-layout';
import GEOLayout from './geoBlocked-layout';
import MaintenaceLayout from './maintenance-layout';
import PrimaryLayout from './primary-layout';
import PublicLayout from './public-layout';

const Loader = dynamic(() => import('@components/common/base/loader'));

type IProps = {
  children: any;
  settings?: ISettings;
  layout: string;
}

const LayoutMap = {
  geoBlock: GEOLayout,
  maintenance: MaintenaceLayout,
  primary: PrimaryLayout,
  public: PublicLayout,
  blank: BlankLayout
};

function BaseLayout({
  children,
  layout,
  settings = null
}: IProps) {
  const [geoBlocked, setGeoBlock] = useState(false);
  const [cookiePolicyVisible, setCookiePolicyVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkBlockIp = async () => {
    // need to check client side
    const checkBlock = await blockService.checkCountryBlock();
    if (checkBlock?.data?.blocked) {
      setGeoBlock(true);
    }
  };

  const acceptCookiePolicy = () => {
    localStorage.setItem('cookiePolicy', 'yes');
    setCookiePolicyVisible(false);
  };

  useEffect(() => {
    const { cookiePolicy } = localStorage;
    if (cookiePolicy !== 'yes' && settings?.cookiePolicyEnabled) {
      setCookiePolicyVisible(true);
    }
    setTimeout(() => setLoading(false), 1000);
    checkBlockIp();
  }, []);

  // eslint-disable-next-line no-nested-ternary
  const Container = settings.maintenanceMode ? LayoutMap.maintenance : geoBlocked ? LayoutMap.geoBlock : layout && LayoutMap[layout] ? LayoutMap[layout] : LayoutMap.primary;
  return (
    <>
      {loading && <Loader />}
      <Container>{children}</Container>
      <CookiePolicy
        hidden={!cookiePolicyVisible}
        onOk={acceptCookiePolicy}
        pId={settings?.cookiePolicyContentId}
      />
    </>
  );
}

const mapStatetoProps = (state: any) => ({
  settings: state.settings
});

export default connect(mapStatetoProps)(BaseLayout);
