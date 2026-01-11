
import { Character, GameState } from './types';

export const VOTE_TARGET = 50000;
export const GAME_DURATION = 90; // 1.5 minutes in seconds

export const PLAYABLE_SYMBOLS: Character[] = [
  {
    id: 'paddy',
    name: 'ধানের শীষ',
    title: 'গণতান্ত্রিক উদ্ধারকর্তা (?)',
    description: 'বিশাল জনসভা আর আন্দোলনের মাধ্যমে ভোট ব্যাংকের দখল। তবে দুর্নীতির ঝুঁকি সবসময় থাকে।',
    image: 'https://images.unsplash.com/photo-1543333995-a78aea2efe52?auto=format&fit=crop&q=80&w=400',
    specialAbility: 'গণ জোয়ার (Votes +2000)',
    initialCorruption: 30,
    initialInfluence: 80
  },
  {
    id: 'scales',
    name: 'দাড়ি পাল্লা',
    title: 'ইনসাফের কারিগর',
    description: 'শৃঙ্খলার আড়ালে নিজেদের এজেন্ডা বাস্তবায়ন। ব্যান হওয়ার ভয় থাকলেও সাপোর্ট সলিড।',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400',
    specialAbility: 'কড়া শৃঙ্খলা (Corruption -10%)',
    initialCorruption: 40,
    initialInfluence: 70
  },
  {
    id: 'shapla',
    name: 'শাপলা কলি',
    title: 'জাতীয় ঐক্য (?)',
    description: 'সবার সাথে তাল মিলিয়ে চলা। সুযোগ বুঝে পল্টি মারতে ওস্তাদ।',
    image: 'https://images.unsplash.com/photo-1621616782352-87063469a477?auto=format&fit=crop&q=80&w=400',
    specialAbility: 'সুবিধাবাদী পল্টি (Cash +2000)',
    initialCorruption: 50,
    initialInfluence: 60
  }
];

export const SPECIAL_NPCS = [
  {
    id: 'apa',
    name: 'এডভোকেট নির্বাচন আপা',
    role: 'মিথ্যা আশ্বাস ও ইমোショナル কার্ড বিশেষজ্ঞ'
  },
  {
    id: 'akik',
    name: 'আকিক',
    role: 'ড্রোন এক্সপার্ট ও টেকনিক্যাল শত্রু'
  },
  {
    id: 'reporter',
    name: 'হলুদ সাংঘাতিক ২৪',
    role: 'ভুয়া খবর ও তোলাবাজি কিং'
  },
  {
    id: 'rajib',
    name: 'রাজীব স্যার PUB',
    role: 'ডিল মেকার ও সমঝোতা গুরু'
  }
];

export const INITIAL_GAME_STATE: GameState = {
  votes: 0,
  fakeVotes: 0,
  money: 5000,
  corruptionLevel: 0,
  publicSupport: 50,
  day: 1,
  activeCharacter: null,
  newsLog: ["নির্বাচনের তফসিল ঘোষণা করা হয়েছে! দেড় মিনিটের মধ্যে ৫০,০০০ ভোট যোগাড় করতে হবে!"],
  timeLeft: GAME_DURATION,
  hasWon: null
};
