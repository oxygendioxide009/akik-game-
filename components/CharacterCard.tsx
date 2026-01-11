
import React from 'react';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  onSelect: (char: Character) => void;
  selected: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onSelect, selected }) => {
  return (
    <div 
      onClick={() => onSelect(character)}
      className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 p-4 rounded-xl border-4 ${
        selected ? 'border-yellow-400 bg-slate-800 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'border-slate-700 bg-slate-900 opacity-80'
      }`}
    >
      <img src={character.image} alt={character.name} className="w-full h-48 object-cover rounded-lg mb-4" />
      <h3 className="text-xl font-bold text-yellow-400">{character.name}</h3>
      <p className="text-blue-400 font-semibold mb-2">{character.title}</p>
      <p className="text-sm text-slate-300 line-clamp-2 mb-3">{character.description}</p>
      <div className="flex justify-between items-center bg-black/40 p-2 rounded text-xs uppercase tracking-wider font-bold">
        <span className="text-red-400">Corruption: {character.initialCorruption}</span>
        <span className="text-green-400">Influence: {character.initialInfluence}</span>
      </div>
    </div>
  );
};

export default CharacterCard;
