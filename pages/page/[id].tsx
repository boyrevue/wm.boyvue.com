import { ReadOutlined } from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import { IPostResponse } from '@interfaces/index';
import { redirect404 } from '@lib/utils';
import { postService } from '@services/post.service';
import { Layout } from 'antd';

type IProps = {
  post: IPostResponse;
}

function PostDetail({
  post
}: IProps) {
  return (
    <Layout>
      <SeoMetaHead item={post} pageTitle={post.metaTitle} metaTitle={post.metaTitle} keywords={post.metaKeywords} description={post.metaDescription} />
      <div className="main-container">
        <h3 className="page-heading">
          <ReadOutlined />
          {' '}
          {post.title || ''}
        </h3>
        <div
          className="page-content"
        >
          <div
            className="sun-editor-editable"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </Layout>
  );
}

PostDetail.getInitialProps = async (ctx) => {
  try {
    const { query } = ctx;
    const { id } = query;
    const resp = await postService.findById(id);
    return { post: resp.data };
  } catch (e) {
    return redirect404(ctx);
  }
};

PostDetail.authenticate = false;
PostDetail.noredirect = false;

export default PostDetail;
