import { truncate } from 'lodash';
import Head from 'next/head';
import { connect, ConnectedProps } from 'react-redux';

export interface ISeoMetaHeadProps {
  item?: any;
  imageUrl?: string;
  pageTitle?: string;
  keywords?: string | Array<string>;
  description?: string;
  metaTitle?: string;
}

const mapStates = (state: any) => ({
  ui: state.ui
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

function SeoMetaHead({
  ui,
  item = null,
  imageUrl = '',
  pageTitle = '',
  keywords = '',
  description = '',
  metaTitle = ''
}: PropsFromRedux & ISeoMetaHeadProps) {
  const itemTitle = item?.title || item?.name || item?.username;
  const title = pageTitle || `${itemTitle} | ${ui.siteName}`;
  const mTitle = metaTitle || title;
  let metaKeywords = keywords;
  if (Array.isArray(keywords)) metaKeywords = keywords.join(',');
  const metaDescription = truncate(description || item?.description || item?.bio || item?.name || '', {
    length: 160
  });

  return (
    <Head>
      <title>{title}</title>
      {metaKeywords && <meta name="keywords" content={metaKeywords as string} />}
      {metaDescription && <meta name="description" content={metaDescription} />}

      <meta property="og:title" content={mTitle || title} key="title" />
      {imageUrl && <meta property="og:image" content={imageUrl || ''} />}
      <meta property="og:keywords" content={metaKeywords as string} />
      <meta property="og:description" content={metaDescription} />
      <meta name="twitter:title" content={mTitle || title} />
      {imageUrl && <meta name="twitter:image" content={imageUrl || ''} />}
      <meta name="twitter:description" content={metaDescription} />
    </Head>
  );
}

export default connector(SeoMetaHead);
