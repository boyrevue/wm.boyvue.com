import { PureComponent } from 'react';
import { CheckIcon } from 'src/icons';
import { IPerformer, ISettings } from 'src/interfaces';

import style from './confirm-subscription.module.less';
import { SubscriptionPerformerBlock } from './subscription-block';

type IProps = {
  settings: ISettings;
  type: string;
  performer: IPerformer;
  onFinish: Function;
  submiting: boolean;
}

export class ConfirmSubscriptionPerformerForm extends PureComponent<IProps> {
  render() {
    const {
      onFinish, submiting = false, performer, type, settings
    } = this.props;
    const { ccbillEnabled, verotelEnabled, emerchantEnabled } = settings;
    return (
      <div className={style['confirm-purchase-form']}>
        <div
          className="per-info"
          style={{
            backgroundImage:
              performer?.cover
                ? `url('${performer?.cover}')`
                : "url('/banner-image.jpg')"
          }}
        >
          <div className="per-avt">
            <img alt="" src={performer?.avatar || '/no-avatar.png'} />
            <span className="per-name">
              <a>
                {performer?.name || 'N/A'}
                {' '}
                {performer?.verifiedAccount && <CheckIcon />}
              </a>
              <small>
                @
                {performer?.username || 'n/a'}
              </small>
            </span>
          </div>
        </div>
        <div className="info-body">
          {/* <h3>
            SUBSCRIBE & GET THESE BENEFITS
          </h3> */}
          <SubscriptionPerformerBlock disabled={(!ccbillEnabled && !verotelEnabled && !emerchantEnabled) || submiting} type={type} settings={settings} performer={performer} onSelect={onFinish} />
        </div>
      </div>
    );
  }
}
