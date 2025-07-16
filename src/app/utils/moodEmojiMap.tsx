import Image from "next/image";

const moodEmojiMap = {
  [-2]: (
    <Image
      alt="Very Sad"
      src="/assets/images/icon-very-sad-white.svg"
      width={30}
      height={30}
    />
  ),
  [-1]: (
    <Image
      alt="Sad"
      src="/assets/images/icon-sad-white.svg"
      width={30}
      height={30}
    />
  ),
  [0]: (
    <Image
      alt="Neutral"
      src="/assets/images/icon-neutral-white.svg"
      width={30}
      height={30}
    />
  ),
  [1]: (
    <Image
      alt="Happy"
      src="/assets/images/icon-happy-white.svg"
      width={30}
      height={30}
    />
  ),
  [2]: (
    <Image
      alt="Very Happy"
      src="/assets/images/icon-very-happy-white.svg"
      width={30}
      height={30}
    />
  ),
};

export default moodEmojiMap;
