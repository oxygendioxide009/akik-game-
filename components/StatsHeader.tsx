
import React from 'react';
import { GameState } from '../types';
import { VOTE_TARGET } from '../constants';

const StatsHeader: React.FC<{ state: GameState }> = ({ state }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalVotes = state.votes + state.fakeVotes;
  const progress = Math.min(100, (totalVotes / VOTE_TARGET) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 bg-slate-800 p-4 rounded-xl border-b-4 border-blue-600 shadow-xl">
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">সময় বাকি</span>
        <span className={`text-2xl font-black ${state.timeLeft < 20 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {formatTime(state.timeLeft)}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">ভোট প্রগতি</span>
        <div className="w-full bg-slate-700 h-3 rounded-full mt-2 overflow-hidden border border-slate-600">
          <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] text-green-400 font-bold mt-1">{totalVotes.toLocaleString()} / {VOTE_TARGET.toLocaleString()}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">টাকা (৳)</span>
        <span className="text-xl font-bold text-yellow-400">{state.money.toLocaleString()}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">জনপ্রিয়তা</span>
        <div className="w-full bg-slate-700 h-3 rounded-full mt-2 overflow-hidden border border-slate-600">
          <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${state.publicSupport}%` }} />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">দুর্নীতি</span>
        <div className="w-full bg-slate-700 h-3 rounded-full mt-2 overflow-hidden border border-slate-600">
          <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${state.corruptionLevel}%` }} />
        </div>
      </div>
      <div className="flex flex-col items-center col-span-2 md:col-span-1">
        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">ক্যাম্পেইন ডে</span>
        <span className="text-xl font-bold text-white"># {state.day}</span>
      </div>
    </div>
  );
};

export default StatsHeader;
