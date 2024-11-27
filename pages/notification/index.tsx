import PageTitle from '@components/common/page-title';
import dynamic from 'next/dynamic';

const Notification = dynamic(() => import('@components/notification/Notification'), {
  ssr: false
});

function NotificationPage() {
  return (
    <>
      <PageTitle title="Notification" />
      <Notification style={{ width: 550, margin: '100px auto' }} />
    </>
  );
}

NotificationPage.authenticate = true;

NotificationPage.noredirect = false;

export default NotificationPage;
