import { Alert } from 'antd';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const mapState = (state: any) => ({
  currentUser: state.user.current
});

const connector = connect(mapState);

type PropsFromRedux = ConnectedProps<typeof connector>;

function ModelUnverifiedAlert({
  currentUser
}: PropsFromRedux) {
  const [showAlert, setShowAlert] = useState(false);

  const handleModelInactive = () => {
    if (
      currentUser.isPerformer
      && (currentUser.status !== 'active' || !currentUser.verifiedDocument)
    ) {
      setShowAlert(true);
    }
  };

  useEffect(() => {
    if (!currentUser._id) return;

    handleModelInactive();
  }, [currentUser]);

  if (!showAlert) return null;

  return (
    <Alert
      type="info"
      description={(
        <>
          <p className="text-center" style={{ margin: 0 }}>
            Feel free to look around, set up your profile, and load
            content. Your profile will be made public once your account is
            approved. We will notify you on email when you are in
            business!
          </p>
          <a
            href="/contact"
            style={{ position: 'absolute', bottom: '5px', right: '5px' }}
          >
            Contact us
          </a>
        </>
        )}
      message={(
        <h4 className="text-center">
          We are in the process of approving your account.
        </h4>
        )}
      closable
    />
  );
}

export default connector(ModelUnverifiedAlert);
