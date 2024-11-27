import CommentItem from '@components/comment/comment-item';
import { IUser } from '@interfaces/index';
import { Spin } from 'antd';

import { IComment } from '../../interfaces/comment';
import style from './comment-list.module.less';

type IProps = {
  comments: IComment[];
  requesting: boolean;
  onDelete?: Function;
  user?: IUser;
  canReply?: boolean
}

export function ListComments({
  comments,
  requesting,
  user = {} as any,
  onDelete = () => {},
  canReply = false
}: IProps) {
  return (
    <div className={style['cmt-list']}>
      {comments.length > 0 && comments.map((comment: IComment) => <CommentItem canReply={canReply} key={comment._id} item={comment} user={user} onDelete={onDelete} />)}
      {!requesting && !comments.length && <div className="text-center" style={{ margin: 10 }}>Being the first to comment</div>}
      {requesting && <div className="text-center" style={{ margin: 10 }}><Spin /></div>}
    </div>
  );
}

export default ListComments;
