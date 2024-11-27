import {
  FacebookOutlined, InstagramOutlined, YoutubeOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';
import { TwitterIcon } from 'src/icons';
import { IUser } from 'src/interfaces';

import style from './footer.module.less';

type IProps = {
  currentUser: IUser;
  settings: any;
}

function Footer({
  currentUser,
  settings
}: IProps) {
  const router = useRouter();
  const getSocialLink = (url, media) => {
    if (!url) return null;
    const newLink = !['http://', 'https://'].includes(url) ? `https://${url}` : url;

    let icon;
    switch (media) {
      case 'twitter':
        icon = <TwitterIcon />;
        break;
      case 'instagram':
        icon = <InstagramOutlined />;
        break;
      case 'facebook':
        icon = <FacebookOutlined />;
        break;
      default:
        icon = <YoutubeOutlined />;
        break;
    }

    return (
      <a href={newLink} target="_blank" rel="noreferrer">
        {icon}
      </a>
    );
  };

  const menus = settings.menus.filter((m) => m.section === 'footer');
  return (
    <div className={style['main-footer']}>
      <div className="main-container">
        <ul>
          {menus?.map((item) => (
            <li key={item.path} className={router.pathname === item.path ? 'active' : ''}>
              <a rel="noreferrer" href={item.path} target={item.isNewTab ? '_blank' : ''}>{item.title}</a>
            </li>
          ))}

          {!currentUser._id && [
            <li className={router.pathname === '/auth/login' ? 'active' : ''} key="login">
              <Link href="/auth/login">
                <a>Log in</a>
              </Link>
            </li>,
            <li className={router.pathname === '/auth/register' ? 'active' : ''} key="signup">
              <Link href={{ pathname: '/auth/register' }} as="/auth/register">
                <a>Sign up</a>
              </Link>
            </li>
          ]}
        </ul>
        <div className="social-link">
          {getSocialLink(settings.twitterLink, 'twitter')}
          {getSocialLink(settings.instagramLink, 'instagram')}
          {getSocialLink(settings.facebookLink, 'facebook')}
          {getSocialLink(settings.youtubeLink, 'youtube')}
        </div>
        {/* eslint-disable-next-line react/no-danger */}
        {settings.footerContent ? <div className="footer-content"><div className="sun-editor-editable" dangerouslySetInnerHTML={{ __html: settings.footerContent }} /></div>
          : (
            <div className="copyright-text">
              <span>
                <Link href="/">
                  <a>{settings?.siteName}</a>
                </Link>
                {' '}
                © Copyright
                {' '}
                {new Date().getFullYear()}
              </span>
            </div>
          )}
      </div>
    </div>
  );
}
const mapState = (state: any) => ({
  currentUser: state.user.current,
  settings: state.settings
});
export default connect(mapState)(Footer);
