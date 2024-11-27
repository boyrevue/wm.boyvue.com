import dynamic from 'next/dynamic';

let Picker;
if (typeof window !== 'undefined') {
  Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });
}

type IProps = {
  onEmojiClick: Function;
}

export default function Emotions({
  onEmojiClick
}: IProps) {
  const emojiClick = (event, emoji) => {
    // eslint-disable-next-line react/destructuring-assignment
    onEmojiClick(emoji);
  };

  if (typeof window === 'undefined') return null;

  return (
    <Picker
      onEmojiClick={emojiClick}
      disableAutoFocus
      disableSearchBar
      disableSkinTonePicker
      groupVisibility={{
        smileys_people: true,
        animals_nature: false,
        food_drink: false,
        travel_places: false,
        activities: false,
        objects: false,
        symbols: false,
        flags: false,
        recently_used: true
      }}
    />
  );
}
