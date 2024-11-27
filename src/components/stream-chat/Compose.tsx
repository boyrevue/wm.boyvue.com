import {
  DownOutlined,
  SendOutlined,
  SmileOutlined
} from '@ant-design/icons';
import PrivateRequestList from '@components/streaming/private-request-list';
import { sendStreamMessage } from '@redux/stream-chat/actions';
import {
  Button, Input, message, Modal
} from 'antd';
import classNames from 'classnames';
import Router from 'next/router';
import React, {
  useEffect, useRef, useState
} from 'react';
import { connect } from 'react-redux';
import {
  IPerformer,
  IUser,
  StreamSettings
} from 'src/interfaces';

import style from './Compose.module.less';
import Emotions from './emotions';

type IProps = {
  loggedIn: boolean;
  sendStreamMessageHandler: Function;
  sendMessageStatus: Record<string, any>;
  conversation: any;
  settings: StreamSettings;
  performer: IPerformer;
  user: IUser;
}

function Compose2({
  user,
  conversation,
  sendMessageStatus,
  loggedIn,
  settings,
  sendStreamMessageHandler
}: IProps) {
  const inputRef = useRef(null);

  const [text, setText] = useState('');
  const [focus, setFocus] = useState(false);
  const [showEmotion, setShowEmotion] = useState(false);
  const [openRequestModal, setOpenRequestModal] = useState(false);

  const onChange = (evt) => {
    setText(evt.target.value);
  };

  const onFocus = () => {
    setFocus(true);
  };

  const onBlur = () => {
    if (text.trim().length === 0 && showEmotion === false) {
      setFocus(false);
    } else {
      setFocus(true);
    }
  };

  const updateMessage = (t: string) => {
    setText(t);
  };

  const handleClick = (e) => {
    e.preventDefault();

    if (text.trim().length !== 0) {
      setFocus(false);
    } else {
      setFocus(true);
    }
  };

  const onEmojiClick = (emojiObject) => {
    updateMessage(`${text} ${emojiObject.emoji}`);
    inputRef.current.focus();
  };

  const send = () => {
    if (!loggedIn) {
      message.error('Please login');
      return;
    }
    if (!text) {
      return;
    }

    sendStreamMessageHandler({
      conversationId: conversation._id,
      data: {
        text
      },
      type: conversation.type
    });
  };

  const onKeyDown = (evt) => {
    if (evt.keyCode === 13) {
      send();
    }
  };

  useEffect(() => {
    if (sendMessageStatus.success) {
      updateMessage('');
      inputRef.current.focus();
    }
  }, [sendMessageStatus]);

  return (
    <div className={style.compose}>
      <div className={style['compose-box']}>
        <Input
          value={text}
          className={style['compose-input']}
          placeholder="Enter message here."
          onKeyDown={onKeyDown}
          onChange={onChange}
          disabled={!loggedIn || sendMessageStatus.status?.sending}
          autoFocus={false}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={inputRef}
        />
        <div className={style['grp-emotions']} onClick={() => handleClick} aria-hidden>
          <div
            className={classNames(style['send-emotion-btn'])}
            onClick={() => { setShowEmotion(!showEmotion); inputRef.current.focus(); }}
            aria-hidden
          >
            {!showEmotion ? <SmileOutlined /> : <DownOutlined style={{ fontSize: '14px' }} />}
          </div>
          <div className={showEmotion ? 'picker-react showEmotion' : 'picker-react'}>
            <Emotions onEmojiClick={onEmojiClick} />
          </div>
        </div>

      </div>

      <div className={style['grp-icons']}>
        <div className={focus === true ? 'focused' : ''}>
          {!user?.isPerformer && conversation.type === 'stream_public'
            && (
              <Button
                block
                type="primary"
                className="primary show-mobile"
                onClick={() => Router.push(
                  {
                    pathname: `/stream/${settings.optionForPrivate === 'webrtc'
                      ? 'webrtc/'
                      : ''
                    }privatechat/[username]`,
                    query: { performer: JSON.stringify(conversation?.performer) }
                  },
                  `/stream/${settings.optionForPrivate === 'webrtc'
                    ? 'webrtc/'
                    : ''
                  }privatechat/${conversation?.performer?.username}`
                )}
              >
                Private Call
              </Button>
            )}
          {user?.isPerformer && !(conversation.type === 'stream_private')
            && (
              <Button
                block
                type="primary"
                className="primary show-mobile privateRequestTotal-btn"
                onClick={() => setOpenRequestModal(true)}
              >
                Private requests
                {' '}
                <span className="privateRequestTotal" />
              </Button>
            )}
          <SendOutlined onClick={send} className={style['grp-send-btn']} />
        </div>
      </div>
      <Modal
        title="Private requests"
        visible={openRequestModal}
        className="modal-bottom"
        footer={null}
        destroyOnClose
        centered
        onCancel={() => setOpenRequestModal(false)}
      >
        <div className="content-body-model"><PrivateRequestList /></div>
      </Modal>
    </div>
  );
}

// class Compose extends PureComponent<IProps> {
//   uploadRef: any;

//   _input: any;

//   constructor(props) {
//     super(props);
//     this.uploadRef = React.createRef();
//   }

//   state = { text: '', focus: false, openRequestModal: false };

//   componentDidMount() {
//     if (!this.uploadRef) this.uploadRef = React.createRef();
//     if (!this._input) this._input = React.createRef();
//   }

//   componentDidUpdate(previousProps: IProps) {
//     const { sendMessageStatus } = this.props;
//     if (sendMessageStatus.success && previousProps.sendMessageStatus.success !== sendMessageStatus.success) {
//       this.updateMessage('');
//       this._input && this._input.focus();
//     }
//   }

//   onKeyDown = (evt) => {
//     if (evt.keyCode === 13) {
//       this.send();
//     }
//   };

//   onChange = (evt) => {
//     this.setState({ text: evt.target.value });
//   };

//   onEmojiClick = (emojiObject) => {
//     const { text } = this.state;
//     this.updateMessage(text + emojiObject.emoji);
//   };

//   onFocus = () => {
//     this.setState({ focus: true });
//   };

//   onBlur = () => {
//     this.setState({ focus: false });
//   };

//   getclass = () => {
//     if (this.state.focus === true) return 'focused';
//     return '';
//   };

//   updateMessage(text: string) {
//     this.setState({ text });
//   }

//   send() {
//     const { loggedIn, sendStreamMessage: _sendStreamMessage, conversation } = this.props;
//     const { text } = this.state;
//     if (!loggedIn) {
//       message.error('Please login');
//       return;
//     }
//     if (!text) {
//       return;
//     }

//     _sendStreamMessage({
//       conversationId: conversation._id,
//       data: {
//         text
//       },
//       type: conversation.type
//     });
//   }

//   render() {
//     const {
//       conversation, loggedIn, settings, user
//     } = this.props;
//     const { text, openRequestModal } = this.state;
//     const { sendMessageStatus: status } = this.props;
//     if (!this.uploadRef) this.uploadRef = React.createRef();
//     if (!this._input) this._input = React.createRef();
//     return (
//       <div className={style.compose}>
//         <div className={style['compose-box']}>
//           <Input
//             value={text}
//             className={style['compose-input']}
//             placeholder="Enter message here."
//             onKeyDown={this.onKeyDown}
//             onChange={this.onChange}
//             disabled={!loggedIn || status.sending}
//             autoFocus={false}
//             onFocus={this.onFocus}
//             onBlur={this.onBlur}
//           // eslint-disable-next-line no-return-assign
//             ref={(ref) => (this._input = ref)}
//           />
//           <div className={style['grp-emotions']}>
//             <SmileOutlined className={style['send-emotion-btn']} />
//             <Emotions onEmojiClick={this.onEmojiClick.bind(this)} />
//           </div>
//         </div>

//         <div className={style['grp-icons']}>
//           <div className={this.getclass()}>
//             {!user?.isPerformer && conversation.type === 'stream_public'
//             && (
//             <Button
//               block
//               type="primary"
//               className="primary show-mobile"
//               onClick={() => Router.push(
//                 {
//                   pathname: `/stream/${settings.optionForPrivate === 'webrtc'
//                     ? 'webrtc/'
//                     : ''
//                   }privatechat/[username]`,
//                   query: { performer: JSON.stringify(conversation?.performer) }
//                 },
//                 `/stream/${settings.optionForPrivate === 'webrtc'
//                   ? 'webrtc/'
//                   : ''
//                 }privatechat/${conversation?.performer?.username}`
//               )}
//             >
//               Private Call
//             </Button>
//             )}
//             {user?.isPerformer && !(conversation.type === 'stream_private')
//             && (
//             <Button
//               block
//               type="primary"
//               className="primary show-mobile privateRequestTotal-btn"
//               onClick={() => this.setState({ openRequestModal: true })}
//             >
//               Private requests
//               {' '}
//               <span className="privateRequestTotal" />
//             </Button>
//             )}
//             <SendOutlined onClick={this.send.bind(this)} className={style['grp-send-btn']} />
//           </div>
//         </div>
//         <Modal
//           title="Private requests"
//           visible={openRequestModal}
//           className="modal-bottom"
//           footer={null}
//           destroyOnClose
//           centered
//           onCancel={() => this.setState({ openRequestModal: false })}
//         >
//           <div className="content-body-model"><PrivateRequestList /></div>
//         </Modal>
//       </div>
//     );
//   }
// }

const mapStates = (state: any) => ({
  user: state.user.current,
  sendMessageStatus: state.streamMessage.sendMessage,
  loggedIn: state.auth.loggedIn,
  settings: state.streaming.settings
});

const mapDispatch = { sendStreamMessageHandler: sendStreamMessage };
export default connect(mapStates, mapDispatch)(Compose2);
