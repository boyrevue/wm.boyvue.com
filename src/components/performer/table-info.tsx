import { formatDateNoTime } from '@lib/date';
import {
  Tag
} from 'antd';
import Link from 'next/link';
import { IBody, IPerformer } from 'src/interfaces';

interface IPerformerInfoProps {
  performer: IPerformer;
  bodyInfo: IBody;
}

export function PerformerInfo({
  performer,
  bodyInfo
}: IPerformerInfoProps) {
  const ethnicity = performer.ethnicity ? bodyInfo.ethnicities.find((e) => e.value === performer.ethnicity) : null;
  const sexualPreference = performer.sexualPreference ? bodyInfo.sexualOrientations.find((e) => e.value === performer.sexualPreference) : null;
  return (
    <>
      <p className="bio">{performer?.bio || 'No bio yet'}</p>
      {performer?.languages && performer?.languages.length > 0 && (
        <div className="item-description">
          <div className="title-item-description">Languages: </div>
          <div className="txt-item-description">
            {performer?.languages.map((lang) => <Tag key={lang}>{lang}</Tag>)}
          </div>
        </div>
      )}
      {performer?.categories && performer?.categories.length > 0 && (
        <div className="item-description">
          <div className="title-item-description">Category: </div>
          <div className="txt-item-description">
            {performer?.categories.map((item) => (
              <Tag key={item}>
                <Link
                  href={{
                    pathname: '/model',
                    query: {
                      categoryId: item._id
                    }
                  }}
                >
                  <a>{item.name}</a>
                </Link>
              </Tag>
            ))}
          </div>
        </div>
      )}
      {ethnicity && (
        <div className="item-description">
          <div className="title-item-description">Ethnicity: </div>
          <div className="txt-item-description">
            {ethnicity.text}
          </div>
        </div>
      )}
      {performer?.dateOfBirth && (
        <div className="item-description">
          <div className="title-item-description">Date Of Birth: </div>
          <div className="txt-item-description">
            {`${formatDateNoTime(performer?.dateOfBirth)}`}
          </div>
        </div>

      )}
      {performer?.gender && (
        <div className="item-description">
          <div className="title-item-description">Gender: </div>
          <div className="txt-item-description">
            {performer?.gender}
          </div>
        </div>
      )}
      {sexualPreference && (
        <div className="item-description">
          <div className="title-item-description">Sexual Orientation: </div>
          <div className="txt-item-description">
            {sexualPreference.text}
          </div>
        </div>
      )}
      {performer?.height && (
        <div className="item-description">
          <div className="title-item-description">Height: </div>
          <div className="txt-item-description">
            {performer?.height}
          </div>
        </div>
      )}
      {performer?.weight && (
        <div className="item-description">
          <div className="title-item-description">Weight: </div>
          <div className="txt-item-description">
            {performer?.weight}
          </div>
        </div>
      )}
      {performer?.eyes && (
        <div className="item-description">
          <div className="title-item-description">Eyes color: </div>
          <div className="txt-item-description">
            {performer?.eyes}
          </div>
        </div>
      )}
      {performer?.butt && (
        <div className="item-description">
          <div className="title-item-description">Butt size: </div>
          <div className="txt-item-description">
            {performer?.butt}
          </div>
        </div>
      )}
      {performer?.hair && (
        <div className="item-description">
          <div className="title-item-description">Hair color: </div>
          <div className="txt-item-description">
            {performer?.hair}
          </div>
        </div>
      )}
      {performer?.pubicHair && (
        <div className="item-description">
          <div className="title-item-description">Pubic hair: </div>
          <div className="txt-item-description">
            {performer?.pubicHair}
          </div>
        </div>
      )}
      {performer?.bodyType && (
        <div className="item-description">
          <div className="title-item-description">Body type: </div>
          <div className="txt-item-description">
            {performer?.bodyType}
          </div>
        </div>
      )}
      {performer?.state && (
        <div className="item-description">
          <div className="title-item-description">State: </div>
          <div className="txt-item-description">
            {performer?.state}
          </div>
        </div>
      )}
      {performer?.city && (
        <div className="item-description">
          <div className="title-item-description">City: </div>
          <div className="txt-item-description">
            {performer?.city}
          </div>
        </div>
      )}
      {performer?.address && (
        <div className="item-description">
          <div className="title-item-description">Address: </div>
          <div className="txt-item-description">
            {performer?.address}
          </div>
        </div>
      )}
      {performer?.zipcode && (
        <div className="item-description">
          <div className="title-item-description">Zip code: </div>
          <div className="txt-item-description">
            {performer?.zipcode}
          </div>
        </div>
      )}
    </>
  );
}

export default PerformerInfo;
