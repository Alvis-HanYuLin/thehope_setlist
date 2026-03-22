"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, MapPin, Music, User, Users, Mic2, 
  Settings2, Headphones, Link as LinkIcon, Coffee, 
  Youtube, Activity, Plus, Trash2, X, Loader2, Edit2
} from 'lucide-react';

// Helpers
const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Data
const PERSONNEL = [
  "Aaron", "Sandy", "Liya", "Daphne", "加恩", "Vincent", "JD", "Jerry", "洪小白", "卜卜"
];

const DEFAULT_ROSTER: Record<string, string> = {
  vox1: "Aaron",
  vox2: "Sandy",
  vox3: "Liya",
  kb: "Daphne",
  drums: "加恩",
  eg: "Vincent",
  bass: "JD",
  leadEngineer: "Jerry",
  assistant1: "洪小白",
  assistant2: "卜卜",
  bandLeader: "Aaron",
  audioTeamLeader: "Jerry",
  musicDirector: "Daphne"
};

const INITIAL_SONGS: Record<string, any[]> = {
  worship1: [
    { title: "每當我瞻仰祢", author: "Wayne & Cathy Perrin", key: "A", bpm: "74", time: "4/4", lead: "Sandy", youtubeId: "rBJrxpYBx_A" },
    { title: "因祢十架 Kar'na Salib-Mu", author: "JPCC", key: "A", bpm: "62", time: "4/4", lead: "Aaron", youtubeId: "7BMMr1vZBEs" }
  ],
  mcSpot: [
    { title: "Welcome Music - Sugar", author: "", key: "C", bpm: "120", time: "4/4", lead: "None" }
  ],
  worship2: [
    { title: "I Know A Name", author: "Elevation + Track", key: "C", bpm: "86", time: "6/8", lead: "Aaron", youtubeId: "2wJKiOEdUsk" }
  ]
};

// UI Components
const Card = ({ children, className = "" }: any) => (
  <div className={`bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon }: any) => (
  <div className="flex items-center space-x-3 pb-4 border-b border-gray-800 mb-6">
    <div className="p-2 bg-blue-500/10 rounded-lg">
      <Icon className="w-5 h-5 text-blue-400" />
    </div>
    <h2 className="text-xl font-semibold text-white tracking-wide">{title}</h2>
  </div>
);

const Select = ({ value, onChange, options }: any) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors appearance-none cursor-pointer"
  >
    <option value="" disabled>Select...</option>
    {options.map((opt: string) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const SongForm = ({ initialData, onSubmit, onCancel }: any) => {
  const [song, setSong] = useState(initialData || { title: '', author: '', key: 'C', bpm: '70', time: '4/4', lead: PERSONNEL[0], youtubeUrl: '' });
  
  // Search state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isTitleSelected, setIsTitleSelected] = useState(!!initialData); // Auto-prevent search on edit start

  // Debounced search effect
  useEffect(() => {
    if (!song.title.trim() || isTitleSelected || !showResults) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/youtube?q=${encodeURIComponent(song.title)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timeoutId);
  }, [song.title, isTitleSelected, showResults]);

  const handleSelectResult = (result: any) => {
    setIsTitleSelected(true);
    setShowResults(false);
    setSong({
      ...song,
      title: result.title,
      // Attempt to clean up author if it has " - topic" or similar
      author: result.author.replace(' - Topic', ''),
      youtubeUrl: `https://youtube.com/watch?v=${result.videoId}`
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (song.title.trim()) {
      const payload = { ...song, youtubeId: getYoutubeId(song.youtubeUrl) };
      delete payload.youtubeUrl; // Clean payload
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
          {initialData ? 'Edit Song Details' : 'New Song Details'}
        </h4>
        <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Title input with Dropdown */}
        <div className="relative">
          <label className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            Song Title
            {isSearching && <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />}
          </label>
          <input 
            type="text" 
            required
            value={song.title}
            onChange={e => {
              setIsTitleSelected(false);
              setShowResults(true);
              setSong({...song, title: e.target.value});
            }}
            onFocus={() => {
              if (song.title && !isTitleSelected && !initialData) setShowResults(true);
            }}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            placeholder="e.g. 10000 Reasons"
          />
          
          {/* Autocomplete Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1">
              {searchResults.map(result => (
                <div 
                  key={result.videoId}
                  className="flex items-center gap-3 p-2 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors"
                  onClick={() => handleSelectResult(result)}
                >
                  <img src={result.thumbnail} alt="" className="w-12 h-8 object-cover rounded shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-200 truncate">{result.title}</div>
                    <div className="text-[10px] text-gray-500 truncate">{result.author} • {result.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Author / Version</label>
          <input 
            type="text" 
            value={song.author}
            onChange={e => setSong({...song, author: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            placeholder="e.g. Matt Redman"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Key</label>
          <input 
            type="text" 
            value={song.key}
            onChange={e => setSong({...song, key: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none"
            placeholder="e.g. G"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">BPM</label>
          <input 
            type="text" 
            value={song.bpm}
            onChange={e => setSong({...song, bpm: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none"
            placeholder="e.g. 72"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Time Sig.</label>
          <input 
            type="text" 
            value={song.time}
            onChange={e => setSong({...song, time: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none"
            placeholder="e.g. 4/4"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Lead Vocal</label>
          <select 
            value={song.lead}
            onChange={e => setSong({...song, lead: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none appearance-none"
          >
            {PERSONNEL.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* YouTube section */}
      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-1">YouTube Link (Selected via Search or Manual)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Youtube className="h-4 w-4 text-gray-500" />
          </div>
          <input 
            type="text" 
            value={song.youtubeUrl}
            onChange={e => setSong({...song, youtubeUrl: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 p-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition shadow-lg shadow-emerald-500/20"
        >
          {initialData ? 'Save Changes' : 'Add Song'}
        </button>
      </div>
    </form>
  );
};

const SongRow = ({ song, index, onRemove, onEdit }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const thumbnailUrl = song.youtubeId ? `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg` : null;

  if (isEditing) {
    const initialData = { 
      ...song, 
      youtubeUrl: song.youtubeId ? `https://youtube.com/watch?v=${song.youtubeId}` : '' 
    };

    return (
      <SongForm 
        initialData={initialData} 
        onSubmit={(updatedSong: any) => {
          onEdit(updatedSong);
          setIsEditing(false);
        }} 
        onCancel={() => setIsEditing(false)} 
      />
    );
  }

  return (
    <div className="group relative bg-gray-800/40 hover:bg-gray-800/80 transition-all duration-300 rounded-xl p-4 mb-4 border border-gray-800/50 flex flex-col gap-4">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-start gap-4 flex-1 pl-2">
        <span className="flex items-center justify-center w-6 h-6 shrink-0 mt-1 rounded-full bg-gray-700 text-xs font-bold text-gray-400">
          {index + 1}
        </span>
        
        {thumbnailUrl ? (
          <a href={`https://youtube.com/watch?v=${song.youtubeId}`} target="_blank" rel="noopener noreferrer" className="shrink-0 relative overflow-hidden rounded-md w-24 h-14 bg-gray-900 group/img border border-gray-700 block mt-1">
            <img src={thumbnailUrl} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
          </a>
        ) : (
          <div className="shrink-0 w-24 h-14 bg-gray-800 rounded-md border border-gray-700 flex items-center justify-center text-gray-600 mt-1">
            <Music className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0 pr-8">
          <h3 className="text-lg font-bold text-gray-100 truncate">{song.title}</h3>
          <p className="text-sm text-gray-400 truncate mb-3">{song.author}</p>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 border border-gray-700">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-sm font-medium text-gray-200">Key: {song.key}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 border border-gray-700">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-medium text-gray-200">{song.bpm}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 border border-gray-700">
              <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm font-medium text-gray-200">{song.time}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 border border-blue-900/50 text-blue-400">
              <Mic2 className="w-3.5 h-3.5" />
              <span className="text-sm font-medium capitalize">{song.lead}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 items-end shrink-0">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
            title="Edit Song"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onRemove}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Remove Song"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickLink = ({ icon: Icon, title, href, color }: any) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-gray-800/30 hover:bg-gray-800 transition-all group ${color}`}
  >
    <div className={`p-2 rounded-lg bg-gray-900 group-hover:scale-110 transition-transform ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{title}</span>
  </a>
);

export default function SetlistDashboard() {
  const [roster, setRoster] = useState(DEFAULT_ROSTER);
  const [songs, setSongs] = useState(INITIAL_SONGS);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const updateRoster = (key: string, value: string) => {
    setRoster(prev => ({ ...prev, [key]: value }));
  };

  const addSong = (section: string, song: any) => {
    setSongs(prev => ({
      ...prev,
      [section]: [...prev[section], song]
    }));
    setAddingTo(null);
  };

  const editSong = (section: string, index: number, updatedSong: any) => {
    setSongs(prev => {
      const newSection = [...prev[section]];
      newSection[index] = updatedSong;
      return { ...prev, [section]: newSection };
    });
  };

  const removeSong = (section: string, index: number) => {
    setSongs(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 font-sans selection:bg-blue-500/30 pb-20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 flex justify-center items-center pointer-events-none opacity-20">
        <div className="absolute top-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600 rounded-full blur-[150px]"></div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Upcoming Service
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">TC SETLIST</h1>
            <div className="flex items-center gap-2 text-xl text-gray-400 font-medium">
              <Calendar className="w-6 h-6" />
              <span>11/02, 2025</span>
              <span className="text-gray-600 mx-2">•</span>
              <span>9:30 AM & 11:30 AM</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl shadow-inner">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Call Time</p>
                <p className="text-sm font-semibold text-gray-200">Sunday 6:50 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl shadow-inner">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Rehearsal Time</p>
                <p className="text-sm font-semibold text-gray-200">Saturday 4:30PM - 6:30PM</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Team Roster */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="p-6">
              <SectionHeader title="Team Roster" icon={User} />
              
              <div className="space-y-6">
                {/* Vox */}
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2">
                    <Mic2 className="w-4 h-4" /> Vox
                  </h3>
                  <div className="space-y-3">
                    {['vox1', 'vox2', 'vox3'].map((role, i) => (
                      <div key={role} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-400 w-12">Vox {i + 1}</span>
                        <Select value={roster[role]} onChange={(val: string) => updateRoster(role, val)} options={PERSONNEL} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Band */}
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2 mt-6">
                    <Music className="w-4 h-4" /> Band
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'kb', label: 'KB' },
                      { id: 'drums', label: 'Drums' },
                      { id: 'eg', label: 'EG' },
                      { id: 'bass', label: 'Bass' }
                    ].map(({id, label}) => (
                      <div key={id} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-400 w-12">{label}</span>
                        <Select value={roster[id]} onChange={(val: string) => updateRoster(id, val)} options={PERSONNEL} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOH */}
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2 mt-6">
                    <Headphones className="w-4 h-4" /> Audio & Tech
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'leadEngineer', label: 'Lead' },
                      { id: 'assistant1', label: 'Asst 1' },
                      { id: 'assistant2', label: 'Asst 2' }
                    ].map(({id, label}) => (
                      <div key={id} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-400 w-12">{label}</span>
                        <Select value={roster[id]} onChange={(val: string) => updateRoster(id, val)} options={PERSONNEL} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Leadership */}
                <div className="pt-4 border-t border-gray-800 mt-6">
                  <div className="space-y-3">
                    {[
                      { id: 'bandLeader', label: 'Band Ldr' },
                      { id: 'audioTeamLeader', label: 'Audio Ldr' },
                      { id: 'musicDirector', label: 'MD' }
                    ].map(({id, label}) => (
                      <div key={id} className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-blue-400 w-16 whitespace-nowrap">{label}</span>
                        <Select value={roster[id]} onChange={(val: string) => updateRoster(id, val)} options={PERSONNEL} />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Card>

            {/* Links section */}
            <div className="grid grid-cols-1 gap-3">
              <QuickLink icon={LinkIcon} title="Online Transpose Tool" href="https://transpose.video/zh-tw/" color="text-blue-400" />
              <QuickLink icon={Coffee} title="Lunch Order" href="https://sundaylunchtc.paperform.co/" color="text-amber-400" />
            </div>
          </div>

          {/* Right Column: Setlist */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="p-6 md:p-8">
              
              {/* Worship I Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <SectionHeader title="Worship I" icon={Activity} />
                  {addingTo !== 'worship1' && (
                    <button 
                      onClick={() => setAddingTo('worship1')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add Song
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {songs.worship1.map((song, i) => (
                    <SongRow 
                      key={`worship1-${i}`} 
                      song={song} index={i} 
                      onEdit={(updated: any) => editSong('worship1', i, updated)}
                      onRemove={() => removeSong('worship1', i)} 
                    />
                  ))}
                </div>

                {addingTo === 'worship1' && (
                  <div className="mt-4">
                    <SongForm onSubmit={(song: any) => addSong('worship1', song)} onCancel={() => setAddingTo(null)} />
                  </div>
                )}
              </div>

              {/* MC Spot Section */}
              <div className="mb-8 mt-12">
                <div className="flex justify-between items-center mb-6 relative">
                  <div className="absolute inset-0 flex items-center z-0" aria-hidden="true">
                    <div className="w-full border-t border-gray-800/80 border-dashed"></div>
                  </div>
                  <div className="relative z-10 flex w-full justify-between items-center">
                    <div className="bg-[#0A0A0B] pr-4">
                      <span className="text-sm tracking-widest text-emerald-400 font-bold uppercase rounded-full border border-gray-800 py-1 px-4 flex items-center gap-2 shadow-lg">
                        <MapPin className="w-4 h-4" /> MC SPOT
                      </span>
                    </div>
                    {addingTo !== 'mcSpot' && (
                      <div className="bg-[#0A0A0B] pl-4">
                        <button 
                          onClick={() => setAddingTo('mcSpot')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
                        >
                          <Plus className="w-4 h-4" /> Add Music
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {songs.mcSpot?.map((song, i) => (
                    <SongRow 
                      key={`mcSpot-${i}`} 
                      song={song} index={i} 
                      onEdit={(updated: any) => editSong('mcSpot', i, updated)}
                      onRemove={() => removeSong('mcSpot', i)} 
                    />
                  ))}
                </div>

                {addingTo === 'mcSpot' && (
                  <div className="mt-4">
                    <SongForm onSubmit={(song: any) => addSong('mcSpot', song)} onCancel={() => setAddingTo(null)} />
                  </div>
                )}
              </div>

              {/* Worship II Section */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <SectionHeader title="Worship II" icon={Activity} />
                  {addingTo !== 'worship2' && (
                    <button 
                      onClick={() => setAddingTo('worship2')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add Song
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {songs.worship2.map((song, i) => (
                    <SongRow 
                      key={`worship2-${i}`} 
                      song={song} 
                      index={i} 
                      onEdit={(updated: any) => editSong('worship2', i, updated)}
                      onRemove={() => removeSong('worship2', i)} 
                    />
                  ))}
                </div>

                {addingTo === 'worship2' && (
                  <div className="mt-4">
                    <SongForm onSubmit={(song: any) => addSong('worship2', song)} onCancel={() => setAddingTo(null)} />
                  </div>
                )}
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
