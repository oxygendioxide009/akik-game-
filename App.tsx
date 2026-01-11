
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, GameState, Character } from './types';
import { PLAYABLE_SYMBOLS, INITIAL_GAME_STATE, SPECIAL_NPCS, VOTE_TARGET, GAME_DURATION } from './constants';
import CharacterCard from './components/CharacterCard';
import StatsHeader from './components/StatsHeader';
import { generateSatiricalNews, generateCharacterDialogue } from './geminiService';

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.LOBBY);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNPCModal, setShowNPCModal] = useState<{show: boolean, npcId: string | null}>({show: false, npcId: null});
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use useCallback for addNews to keep references stable
  const addNews = useCallback((text: string) => {
    setGameState(prev => ({
      ...prev,
      newsLog: [text, ...prev.newsLog.slice(0, 4)]
    }));
  }, []);

  const stopGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endGame = useCallback((won: boolean) => {
    stopGame();
    setGameState(prev => ({ ...prev, hasWon: won }));
    setPhase(GamePhase.GAMEOVER);
  }, [stopGame]);

  // Mission Watcher: Monitor win/loss conditions reliably
  useEffect(() => {
    if (phase !== GamePhase.PLAYING) return;

    const totalVotes = gameState.votes + gameState.fakeVotes;
    
    // Win Condition
    if (totalVotes >= VOTE_TARGET && gameState.hasWon === null) {
      endGame(true);
      return;
    }

    // Loss Condition: Corruption
    if (gameState.corruptionLevel >= 100 && gameState.hasWon === null) {
      addNews("জনগণ আপনার মিথ্যা আশ্বাস ধরে ফেলেছে! জনরোষে আপনার অবস্থা খারাপ!");
      // Delay slightly for dramatic effect
      const lossTimer = setTimeout(() => endGame(false), 1500);
      return () => clearTimeout(lossTimer);
    }

    // Loss Condition: Time
    if (gameState.timeLeft <= 0 && gameState.hasWon === null) {
      addNews("সময় শেষ! নির্বাচন কমিশন আপনার ফলাফল স্থগিত করেছে।");
      endGame(false);
    }
  }, [gameState.votes, gameState.fakeVotes, gameState.corruptionLevel, gameState.timeLeft, phase, gameState.hasWon, endGame, addNews]);

  const startGame = () => {
    if (!selectedChar) return;
    
    // Reset state
    setGameState({
      ...INITIAL_GAME_STATE,
      activeCharacter: selectedChar,
      corruptionLevel: selectedChar.initialCorruption,
      publicSupport: selectedChar.initialInfluence,
      timeLeft: GAME_DURATION,
      hasWon: null,
      day: 1
    });
    
    setPhase(GamePhase.PLAYING);
    setCurrentDialogue("দেড় মিনিটের মধ্যে জয় নিশ্চিত করতে হবে!");
    addNews(`${selectedChar.name} মার্কা নিয়ে নির্বাচনী যুদ্ধ শুরু! লক্ষ্য: ৫০,০০০ ভোট!`);

    stopGame();
    timerRef.current = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }));
    }, 1000);
  };

  const handleManualClick = (e: React.MouseEvent) => {
    if (phase !== GamePhase.PLAYING || gameState.hasWon !== null) return;
    
    const clickValue = 150; // Boosted click value for better UX
    setGameState(prev => ({
      ...prev,
      votes: prev.votes + clickValue
    }));

    // Floating text feedback
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, x: e.clientX, y: e.clientY, text: `+${clickValue} ভোট` }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 800);
  };

  const handleAction = async (type: string, npcId?: string) => {
    if (isProcessing || phase !== GamePhase.PLAYING || gameState.hasWon !== null) return;
    setIsProcessing(true);
    setShowNPCModal({show: false, npcId: null});

    const actor = npcId || gameState.activeCharacter?.id || 'candidate';
    
    try {
      const dialogue = await generateCharacterDialogue(actor, type);
      setCurrentDialogue(dialogue);

      setGameState(prev => {
        let newState = { ...prev };
        
        switch(type) {
          case 'july_card':
            newState.corruptionLevel = Math.max(0, prev.corruptionLevel - 20);
            newState.publicSupport = Math.min(100, prev.publicSupport + 15);
            break;
          case 'drone_strike':
            newState.votes += 4000;
            newState.money -= 500;
            break;
          case 'fake_news':
            newState.fakeVotes += 6000;
            newState.money -= 1200;
            newState.corruptionLevel = Math.min(100, prev.corruptionLevel + 15);
            break;
          case 'mediation':
            newState.corruptionLevel = Math.max(0, prev.corruptionLevel - 15);
            newState.money -= 800;
            break;
          case 'ballot_stuffing':
            newState.fakeVotes += 9000;
            newState.corruptionLevel = Math.min(100, prev.corruptionLevel + 30);
            break;
          case 'promise':
            newState.publicSupport = Math.min(100, prev.publicSupport + 12);
            newState.votes += 2000;
            break;
        }

        newState.day += 1;
        return newState;
      });

      const news = await generateSatiricalNews(gameState.activeCharacter?.name || "প্রার্থী", type);
      addNews(news);
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => stopGame();
  }, [stopGame]);

  const renderLobby = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        <h1 className="text-6xl md:text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-green-400 via-yellow-400 to-red-500 drop-shadow-2xl uppercase select-none">
          NIRBACHON<br/>CHAOS
        </h1>
        <div className="absolute -top-4 -right-8 bg-white text-slate-900 px-4 py-2 font-black rounded-full rotate-12 text-lg shadow-xl bebas animate-bounce">
          90 SECONDS MISSION
        </div>
      </div>
      <div className="max-w-2xl bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-700 backdrop-blur-sm shadow-2xl">
        <p className="text-xl text-slate-200 font-bold mb-4">মিশন: ১.৫ মিনিটে গদি দখল!</p>
        <p className="text-slate-400 font-medium">
          বাংলাদেশের নির্বাচনী রাজনীতি এক জটিল খেলা। ধানের শীষ, দাড়ি পাল্লা বা শাপলা কলি নিয়ে মাঠে নামুন। 
          নির্বাচন আপা, আকিক আর রাজীব স্যারদের সাহায্য নিয়ে দেড় মিনিটের মধ্যে ৫০,০০০ ভোট যোগাড় করুন। 
          সাবধান! দুর্নীতি ১০০% হলে পাবলিক গণধোলাই দিবে!
        </p>
      </div>
      <button 
        onClick={() => setPhase(GamePhase.CHAR_SELECT)}
        className="group relative px-16 py-6 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-3xl rounded-3xl shadow-[0_10px_0_rgb(180,83,9)] active:translate-y-2 active:shadow-none transition-all uppercase italic"
      >
        খেলতে রাজি (ইন!)
      </button>
    </div>
  );

  const renderCharSelect = () => (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-5xl font-black text-center mb-16 text-white uppercase tracking-tighter italic">
        আপনার <span className="text-yellow-400">মার্কা</span> বেছে নিন
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLAYABLE_SYMBOLS.map(char => (
          <CharacterCard 
            key={char.id} 
            character={char} 
            onSelect={setSelectedChar}
            selected={selectedChar?.id === char.id}
          />
        ))}
      </div>
      <div className="mt-16 flex justify-center">
        <button 
          disabled={!selectedChar}
          onClick={startGame}
          className={`px-12 py-5 rounded-3xl font-black text-2xl uppercase transition-all shadow-2xl ${
            selectedChar ? 'bg-green-500 hover:bg-green-400 text-black cursor-pointer scale-110' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          {selectedChar ? `এগিয়ে যান: ${selectedChar.name}` : 'মার্কা না নিলে মনোনয়ন বাতিল!'}
        </button>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="max-w-7xl mx-auto py-6 px-4 flex flex-col min-h-screen animate-in zoom-in-95 duration-500">
      <StatsHeader state={gameState} />
      
      <div className="bg-black/60 border-y-2 border-blue-500 h-12 overflow-hidden flex items-center mb-8 backdrop-blur-md relative">
        <div className="bg-blue-600 px-6 h-full flex items-center font-black text-sm uppercase tracking-widest z-10 italic shadow-[5px_0_10px_rgba(0,0,0,0.5)]">হলুদ নিউজ ২৪:</div>
        <div className="news-ticker flex-1 text-base font-bold text-yellow-400">
           {gameState.newsLog.join(' || ')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div 
            onClick={handleManualClick}
            className="bg-slate-800/80 p-6 rounded-3xl border-4 border-slate-700 shadow-2xl relative overflow-hidden group cursor-pointer active:scale-95 transition-transform select-none"
          >
            <div className="absolute top-0 right-0 p-4 bg-yellow-500 text-black font-black -rotate-12 translate-x-2 -translate-y-2 group-hover:rotate-0 transition-transform z-10">
              CLICK TO VOTE
            </div>
            <img 
              src={gameState.activeCharacter?.image} 
              alt="Symbol"
              className="w-full h-80 object-cover rounded-2xl mb-6 shadow-inner border-2 border-slate-700 pointer-events-none" 
            />
            <h3 className="text-3xl font-black text-yellow-400 mb-2">{gameState.activeCharacter?.name}</h3>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-6">{gameState.activeCharacter?.title}</p>
            <div className="bg-slate-950 p-6 rounded-2xl border-l-8 border-yellow-500 shadow-xl min-h-[120px] flex items-center justify-center text-center">
              <p className="text-xl text-white font-medium italic">"{currentDialogue || 'ছবির ওপর ট্যাপ করে ভোট বাড়ান!'}"</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-slate-800/40 p-8 rounded-[3rem] border-2 border-slate-700 shadow-2xl">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 uppercase">
              <span className="p-3 bg-red-600 rounded-2xl shadow-lg"><i className="fas fa-gavel"></i></span>
              নির্বাচনী কার্যক্রম
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button 
                onClick={() => handleAction('promise')}
                disabled={isProcessing}
                className="group p-6 bg-slate-900 border-2 border-blue-500/30 hover:border-blue-500 rounded-[2rem] transition-all flex flex-col items-center gap-4 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <i className="fas fa-bullhorn"></i>
                </div>
                <div className="text-center">
                  <span className="block font-black text-xl text-white">মিথ্যা আশ্বাস</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">পাবলিক সাপোর্ট ও ভোট বাড়বে</span>
                </div>
              </button>

              <button 
                onClick={() => handleAction('ballot_stuffing')}
                disabled={isProcessing}
                className="group p-6 bg-slate-900 border-2 border-red-500/30 hover:border-red-500 rounded-[2rem] transition-all flex flex-col items-center gap-4 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-400 text-3xl group-hover:bg-red-600 group-hover:text-white transition-all">
                  <i className="fas fa-archive"></i>
                </div>
                <div className="text-center">
                  <span className="block font-black text-xl text-white">জাল ভোট</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">প্রচুর ভোট, দুর্নীতি +৩০</span>
                </div>
              </button>
            </div>

            <h3 className="text-xl font-black mt-12 mb-6 text-slate-400 uppercase tracking-widest flex items-center gap-3">
              <span className="h-px bg-slate-700 flex-1"></span>
              সহযোগী দলবল
              <span className="h-px bg-slate-700 flex-1"></span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowNPCModal({show: true, npcId: 'apa'})}
                className="p-4 bg-purple-900/30 border-2 border-purple-500/20 hover:border-purple-500 rounded-2xl transition-all text-center group active:scale-95"
              >
                <p className="font-black text-sm text-purple-400 uppercase group-hover:text-white">নির্বাচন আপা</p>
                <span className="text-[10px] text-slate-500">ইমোশনাল কার্ড</span>
              </button>
              
              <button 
                onClick={() => setShowNPCModal({show: true, npcId: 'akik'})}
                className="p-4 bg-cyan-900/30 border-2 border-cyan-500/20 hover:border-cyan-500 rounded-2xl transition-all text-center group active:scale-95"
              >
                <p className="font-black text-sm text-cyan-400 uppercase group-hover:text-white">আকিক</p>
                <span className="text-[10px] text-slate-500">ড্রোন অ্যাটাক</span>
              </button>

              <button 
                onClick={() => setShowNPCModal({show: true, npcId: 'reporter'})}
                className="p-4 bg-yellow-900/30 border-2 border-yellow-500/20 hover:border-yellow-500 rounded-2xl transition-all text-center group active:scale-95"
              >
                <p className="font-black text-sm text-yellow-400 uppercase group-hover:text-white">হলুদ নিউজ</p>
                <span className="text-[10px] text-slate-500">ভুয়া খবর</span>
              </button>

              <button 
                onClick={() => setShowNPCModal({show: true, npcId: 'rajib'})}
                className="p-4 bg-slate-700/30 border-2 border-slate-500/20 hover:border-slate-500 rounded-2xl transition-all text-center group active:scale-95"
              >
                <p className="font-black text-sm text-slate-300 uppercase group-hover:text-white">রাজীব স্যার</p>
                <span className="text-[10px] text-slate-500">সমঝোতা</span>
              </button>
            </div>
          </div>
          
          <div className="bg-red-600/10 border-2 border-red-600/30 p-6 rounded-3xl flex items-center gap-6 shadow-inner">
            <div className="bg-red-600 p-4 rounded-2xl text-white text-3xl animate-bounce shadow-lg">
              <i className="fas fa-skull-crossbones"></i>
            </div>
            <div>
              <p className="font-black text-red-500 text-lg uppercase italic">জনরোষ এলার্ট!</p>
              <p className="text-slate-400 font-medium text-sm">ভোট চুরি ধরা পড়লে কিন্তু কপালে দুঃখ আছে! দুর্নীতি ১০০% হলে গেম ওভার!</p>
            </div>
          </div>
        </div>
      </div>

      {showNPCModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-slate-800 p-10 rounded-[3rem] border-4 border-yellow-500 max-w-lg w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.3)]">
            <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl text-yellow-400 shadow-2xl border-4 border-slate-600">
              <i className={
                showNPCModal.npcId === 'apa' ? 'fas fa-gavel' : 
                showNPCModal.npcId === 'akik' ? 'fas fa-helicopter' : 
                showNPCModal.npcId === 'reporter' ? 'fas fa-microphone' : 'fas fa-handshake'
              }></i>
            </div>
            <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">
              {SPECIAL_NPCS.find(n => n.id === showNPCModal.npcId)?.name}
            </h3>
            <p className="text-yellow-400 font-bold mb-8 uppercase text-xs tracking-[0.2em]">
              {SPECIAL_NPCS.find(n => n.id === showNPCModal.npcId)?.role}
            </p>
            
            <div className="bg-slate-900 p-6 rounded-2xl mb-10 border border-slate-700 text-slate-300 italic">
              {showNPCModal.npcId === 'apa' && '"আমার ছেলে তো জুলাইতে আহত হয়েছিল... আপনার জন্যেও এই কার্ড টা খেলা যাবে!"'}
              {showNPCModal.npcId === 'akik' && '"ড্রোন ওড়াতে গেলে খরচ আছে ওস্তাদ। অপোজিশনের ফাইল সব রেডি!"'}
              {showNPCModal.npcId === 'reporter' && '"আপনার টাকা, আমার খবর। ভিউস আকাশ ছোঁবে, পাবলিক বিভ্রান্ত হবেই!"'}
              {showNPCModal.npcId === 'rajib' && '"ভাই গরমিল করে লাভ নাই। রাজীব স্যার থাকতে সব মেটানো সম্ভব।"'}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => {
                  const actionMap: Record<string, string> = {
                    'apa': 'july_card',
                    'akik': 'drone_strike',
                    'reporter': 'fake_news',
                    'rajib': 'mediation'
                  };
                  handleAction(actionMap[showNPCModal.npcId!], showNPCModal.npcId!);
                }}
                className="w-full py-5 bg-yellow-500 text-slate-900 font-black text-xl rounded-2xl hover:bg-yellow-400 shadow-xl transition-all active:scale-95 uppercase"
              >
                ডিল ফাইনাল!
              </button>
              <button 
                onClick={() => setShowNPCModal({show: false, npcId: null})}
                className="w-full py-4 text-slate-400 font-black uppercase text-sm tracking-widest hover:text-white transition-colors"
              >
                পরে কথা বলছি
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Click Animations */}
      {floatingTexts.map(t => (
        <div 
          key={t.id}
          className="fixed pointer-events-none text-yellow-400 font-black text-2xl animate-out fade-out slide-out-to-top-20 duration-1000 z-50 select-none"
          style={{ left: t.x, top: t.y }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );

  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 animate-in slide-in-from-bottom-20 duration-1000">
      <div className={`${gameState.hasWon ? 'bg-green-600 shadow-[0_0_40px_rgba(22,163,74,0.5)]' : 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.5)]'} text-white p-8 rounded-[3rem] mb-12`}>
        <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter">
          {gameState.hasWon ? 'অভিনন্দন! জয়ী!' : 'নির্বাচন বাতিল!'}
        </h1>
      </div>
      
      <div className="bg-slate-800 p-10 rounded-[3rem] border-4 border-slate-700 max-w-3xl w-full shadow-2xl relative">
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 ${gameState.hasWon ? 'bg-green-500' : 'bg-yellow-500'} text-black px-8 py-3 rounded-full font-black text-xl shadow-xl uppercase`}>
          চুড়ান্ত ফলাফল
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <div className="p-6 bg-slate-900 rounded-3xl border-b-4 border-green-500">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">গৃহীত ভোট</p>
            <p className="text-4xl font-black text-green-400">{(gameState.votes + gameState.fakeVotes).toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">লক্ষ্য: {VOTE_TARGET.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-slate-900 rounded-3xl border-b-4 border-blue-500">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">সময় লেগেছে</p>
            <p className="text-4xl font-black text-blue-400">{GAME_DURATION - gameState.timeLeft} সে.</p>
          </div>
          <div className="p-6 bg-slate-900 rounded-3xl border-b-4 border-red-500">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">দুর্নীতি ইনডেক্স</p>
            <p className="text-4xl font-black text-red-400">{gameState.corruptionLevel}%</p>
          </div>
        </div>
        
        <div className="mt-12 bg-black/40 p-8 rounded-3xl border-l-8 border-yellow-500">
          <p className="text-2xl text-yellow-400 font-black italic mb-4">
            {gameState.hasWon 
              ? `"অবশেষে গদি আমাদের! এখন ৫ বছর শুধু লুটপাট আর উন্নয়ন!"` 
              : `"জনগণ সব বুঝে গেছে ওস্তাদ! আমাদের টিকেট এখন জেলে বা বিদেশে!"`}
          </p>
          <p className="text-slate-400 font-bold">-- হলুদ সাংবাদিক ২৪ (লাইভ ফিনিশিং)</p>
        </div>
      </div>

      <button 
        onClick={() => { setPhase(GamePhase.LOBBY); setGameState(INITIAL_GAME_STATE); setSelectedChar(null); stopGame(); }}
        className="mt-16 px-16 py-6 bg-white text-slate-900 font-black text-3xl rounded-3xl hover:bg-slate-200 transition-all shadow-2xl active:scale-95 uppercase"
      >
        আবার খেলুন (কুপিয়ে!)
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-yellow-400 selection:text-black font-['Hind_Siliguri']">
      {phase === GamePhase.LOBBY && renderLobby()}
      {phase === GamePhase.CHAR_SELECT && renderCharSelect()}
      {phase === GamePhase.PLAYING && renderGame()}
      {phase === GamePhase.GAMEOVER && renderGameOver()}
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-5 overflow-hidden -z-10">
        <div className="absolute top-[10%] left-[5%] text-[120px] animate-pulse">🌾</div>
        <div className="absolute bottom-[15%] right-[8%] text-[100px] animate-bounce">⚖️</div>
        <div className="absolute top-[60%] right-[15%] text-[80px] -rotate-45">🗳️</div>
        <div className="absolute bottom-[40%] left-[10%] text-[140px] opacity-20">🪷</div>
      </div>
    </div>
  );
};

export default App;
