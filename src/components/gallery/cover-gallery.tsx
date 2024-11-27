import { IGallery } from 'src/interfaces';

type IProps = {
  gallery: IGallery;
}

export function CoverGallery({
  gallery = {} as IGallery
}: IProps) {
  const { coverPhoto } = gallery;
  const url = (coverPhoto?.thumbnails && coverPhoto?.thumbnails[0]) || '/gallery.png';
  return (
    <img
      alt="Cover"
      src={url}
      style={{ width: '60px', borderRadius: '3px' }}
    />
  );
}

export default CoverGallery;
