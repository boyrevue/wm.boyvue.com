import { Spin } from 'antd';
import { connect } from 'react-redux';

import style from './loader.module.less';

type IProps = {
  pageLoadingIcon: string
}

function Loader({
  pageLoadingIcon
}: IProps) {
  return (
    <div className={style['loading-screen']}>
      {pageLoadingIcon ? <img alt="loading-ico" src={pageLoadingIcon} /> : <Spin size="large" />}
    </div>
  );
}
const mapStatesToProps = (state) => ({
  pageLoadingIcon: state.ui.pageLoadingIcon
});
export default connect(mapStatesToProps)(Loader) as any;
