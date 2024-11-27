import Link from 'next/link';
import { IProduct } from 'src/interfaces';

type IProps = {
  product: IProduct;
}

export function ImageProduct({ product }: IProps) {
  const thumbUrl = (product?.images && product?.images[0]?.thumbnails && product?.images[0]?.thumbnails[0]) || (product?.images && product?.images[0]?.url) || '/empty_product.svg';
  return <Link href={{ pathname: '/store/details', query: { id: product?.slug || product?._id } }} as={`/store/${product?.slug || product?._id}`}><a><img alt="" src={thumbUrl} style={{ width: 65 }} /></a></Link>;
}

export default ImageProduct;
