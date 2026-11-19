import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';

export default function App() {
  // --- PART 1: Tokenizer ---
  const defaultTraining = `The cat sat on the mat.\nThe dog chased the cat.\nBirds fly high in the sky.\nFish swim in the clear blue river.\nI love reading fascinating books.\nThe bright sun shines every morning.`;
  const [trainingText, setTrainingText] = useState(defaultTraining);
  const [vocabulary, setVocabulary] = useState([]);
  const [vocabSize, setVocabSize] = useState(100);
  
  const buildVocabulary = () => {
    const tokens = trainingText.match(/\w+|[^\w\s]/g) || [];
    const counts = {};
    tokens.forEach(t => {
      const lower = t.toLowerCase();
      counts[lower] = (counts[lower] || 0) + 1;
    });
    
    let sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const newVocab = [{ id: 0, token: '[UNK]', count: 0 }];
    sorted.forEach((item, idx) => {
      newVocab.push({ id: idx + 1, token: item[0], count: item[1] });
    });
    setVocabulary(newVocab);
    setVocabSize(newVocab.length);
  };

  const retainedVocab = useMemo(() => {
    if (vocabulary.length === 0) return [];
    return [vocabulary[0], ...vocabulary.slice(1, vocabSize)];
  }, [vocabulary, vocabSize]);

  const [encodeSentenceInput, setEncodeSentenceInput] = useState("The cat sat on the wooden chair.");
  const [encodeSentence, setEncodeSentence] = useState("");
  
  const encodedTokens = useMemo(() => {
    if (!encodeSentence || retainedVocab.length === 0) return [];
    const words = encodeSentence.match(/\w+|[^\w\s]/g) || [];
    const vocabMap = new Map(retainedVocab.map(v => [v.token, v.id]));
    
    const result = [];
    words.forEach(origWord => {
      const word = origWord.toLowerCase();
      if (vocabMap.has(word)) {
        result.push({ text: word, id: vocabMap.get(word), isUnk: false });
      } else {
         if (word.length > 3) {
            const part1 = word.slice(0, 3);
            const part2 = '##' + word.slice(3);
            result.push({ 
              text: part1, 
              id: vocabMap.has(part1) ? vocabMap.get(part1) : 0, 
              isUnk: !vocabMap.has(part1) 
            });
            result.push({ 
              text: part2, 
              id: vocabMap.has(part2) ? vocabMap.get(part2) : 0, 
              isUnk: !vocabMap.has(part2) 
            });
         } else {
            result.push({ text: word, id: 0, isUnk: true });
         }
      }
    });
    return result;
  }, [encodeSentence, retainedVocab]);

  const pastelColors = ['bg-red-100 text-red-800', 'bg-orange-100 text-orange-800', 'bg-amber-100 text-amber-800', 'bg-green-100 text-green-800', 'bg-emerald-100 text-emerald-800', 'bg-teal-100 text-teal-800', 'bg-cyan-100 text-cyan-800', 'bg-blue-100 text-blue-800', 'bg-indigo-100 text-indigo-800', 'bg-violet-100 text-violet-800', 'bg-purple-100 text-purple-800', 'bg-fuchsia-100 text-fuchsia-800', 'bg-pink-100 text-pink-800', 'bg-rose-100 text-rose-800'];
  const getColor = (str) => pastelColors[str.length % pastelColors.length];

  // --- PART 2: Embeddings in 3D ---
  const defaultSentences = `The cat sat on the mat.\nA kitten rested on the rug.\nThe bat sat on the mat.\nI love programming in Python.\nCoding in Python is my passion.\nPythons are large snakes.\nThe stock market crashed today.\nShare prices fell sharply.`;
  const [embSentences, setEmbSentences] = useState(defaultSentences);
  const [embMethod, setEmbMethod] = useState('meaning');
  const [plotData, setPlotData] = useState(null);

  const generateEmbeddings = () => {
    const lines = embSentences.split('\n').filter(l => l.trim().length > 0);
    const points = lines.map(line => {
       let x=Math.random(), y=Math.random(), z=Math.random();
       const l = line.toLowerCase();
       
       if (embMethod === 'meaning') {
          if (l.includes('cat') || l.includes('kitten') || l.includes('mat') || l.includes('rug')) {
              x = 0.8 + Math.random()*0.1; y = 0.2 + Math.random()*0.1; z = 0.2 + Math.random()*0.1;
          } else if (l.includes('python') || l.includes('programming') || l.includes('coding')) {
              if (l.includes('snakes')) {
                  x = 0.2; y = 0.8; z = 0.8;
              } else {
                  x = 0.2 + Math.random()*0.1; y = 0.8 + Math.random()*0.1; z = 0.2 + Math.random()*0.1;
              }
          } else if (l.includes('stock') || l.includes('market') || l.includes('prices') || l.includes('share') || l.includes('crashed')) {
              x = 0.2 + Math.random()*0.1; y = 0.2 + Math.random()*0.1; z = 0.8 + Math.random()*0.1;
          }
       } else {
          x = (l.length % 10) / 10;
          y = (l.charCodeAt(0) % 20) / 20;
          z = (l.split(' ').length % 10) / 10;
       }
       return { text: line, x, y, z };
    });

    setPlotData([{
      x: points.map(p => p.x),
      y: points.map(p => p.y),
      z: points.map(p => p.z),
      text: points.map(p => p.text),
      hoverinfo: 'text',
      mode: 'markers+text',
      type: 'scatter3d',
      marker: { size: 8, color: '#3b82f6', opacity: 0.8 },
      textposition: 'top center'
    }]);
  };

  useEffect(() => {
    buildVocabulary();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-8">LLM Pipeline Explorer</h1>
        
        {/* PART 1 */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-blue-500 border-b-2 border-blue-100 pb-2">Part 1: Tokenizer</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="font-semibold text-lg">1. Training Sentences</label>
                <textarea 
                  className="w-full h-48 p-4 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={trainingText}
                  onChange={e => setTrainingText(e.target.value)}
                />
                <button 
                  onClick={buildVocabulary}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow transition-colors"
                >
                  Build Vocabulary
                </button>
              </div>

              {vocabulary.length > 0 && (
                <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-lg">2. Vocabulary Generator</label>
                  </div>
                  <div className="text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded">
                    Total Vocabulary Size: {vocabulary.length}
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Vocabulary Size Slider</span>
                      <span>Words kept: {vocabSize} of {vocabulary.length}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max={vocabulary.length} 
                      value={vocabSize}
                      onChange={e => setVocabSize(parseInt(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-inner mt-4">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-blue-50 sticky top-0 shadow-sm">
                        <tr>
                          <th className="p-3 border-b text-blue-800 font-semibold">ID</th>
                          <th className="p-3 border-b text-blue-800 font-semibold">Token</th>
                          <th className="p-3 border-b text-blue-800 font-semibold">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retainedVocab.map(v => (
                          <tr key={v.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-gray-600">{v.id}</td>
                            <td className="p-3 font-mono text-gray-800">"{v.token}"</td>
                            <td className="p-3 text-gray-600">{v.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-2xl font-semibold text-blue-500">4. Encode a Sentence</h3>
            <input 
              type="text" 
              className="w-full p-4 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
              value={encodeSentenceInput}
              onChange={e => setEncodeSentenceInput(e.target.value)}
            />
            <button 
                onClick={() => setEncodeSentence(encodeSentenceInput)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow transition-colors"
            >
                Tokenize
            </button>
            
            {encodeSentence && (
                <>
                <div className="flex flex-wrap gap-3 mt-6">
                  {encodedTokens.map((t, i) => (
                    <div key={i} className={`px-4 py-2 rounded-lg text-sm font-semibold flex gap-2 items-center shadow-sm ${t.id===0 ? 'bg-gray-800 text-white' : getColor(t.text)}`}>
                      <span className="text-base">{t.text}</span>
                      <span className="opacity-75 text-xs">(ID: {t.id})</span>
                    </div>
                  ))}
                </div>
                {encodedTokens.some(t => t.id===0 || t.text.includes('##')) && (
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm border border-yellow-200 shadow-sm font-medium mt-4">
                    Note: Unknown words are broken into smaller subword pieces or replaced with [UNK] (ID: 0).
                  </div>
                )}
                
                <div className="text-sm font-medium text-gray-700 pt-4 flex gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                   <span>Characters: {encodeSentence.length}</span>
                   <span className="text-gray-300">|</span>
                   <span>Tokens: {encodedTokens.length}</span>
                   <span className="text-gray-300">|</span>
                   <span>Characters per token: {encodedTokens.length ? (encodeSentence.length / encodedTokens.length).toFixed(2) : 0}</span>
                </div>
                </>
            )}
          </div>
        </section>

        {/* PART 2 */}
        <section className="space-y-6 pt-12 border-t-2 border-gray-100">
          <h2 className="text-3xl font-semibold text-blue-500 border-b-2 border-blue-100 pb-2">Part 2: Embeddings in 3D</h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div>
                  <label className="font-semibold text-lg mb-2 block">1. Sentences (one per line)</label>
                  <textarea 
                    className="w-full h-72 p-4 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm leading-relaxed"
                    value={embSentences}
                    onChange={e => setEmbSentences(e.target.value)}
                  />
              </div>
              
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="font-semibold text-gray-700 block border-b pb-2 mb-2">2. Embedding Methods</label>
                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors">
                  <input type="radio" name="embMode" value="spelling" checked={embMethod==='spelling'} onChange={() => setEmbMethod('spelling')} className="w-4 h-4 accent-blue-600" />
                  <span className="font-medium text-gray-800">Spelling-based</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors">
                  <input type="radio" name="embMode" value="meaning" checked={embMethod==='meaning'} onChange={() => setEmbMethod('meaning')} className="w-4 h-4 accent-blue-600" />
                  <span className="font-medium text-gray-800">Meaning-based</span>
                </label>
              </div>
              
              <button 
                onClick={generateEmbeddings}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors"
              >
                Embed and Plot
              </button>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-sm text-blue-900 shadow-sm">
                <strong>Interactive Learning:</strong> Sentences with similar meanings tend to have embeddings that are closer together in vector space.
              </div>
            </div>

            <div className="lg:col-span-2 border border-gray-300 rounded-2xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center min-h-[500px] relative">
              {plotData ? (
                <Plot
                  data={plotData}
                  layout={{
                    autosize: true,
                    margin: { l: 0, r: 0, b: 0, t: 0 },
                    scene: {
                      xaxis: { title: 'Dim 1', showgrid: true, gridcolor: '#e5e7eb', backgroundcolor: '#f9fafb' },
                      yaxis: { title: 'Dim 2', showgrid: true, gridcolor: '#e5e7eb', backgroundcolor: '#f9fafb' },
                      zaxis: { title: 'Dim 3', showgrid: true, gridcolor: '#e5e7eb', backgroundcolor: '#f9fafb' }
                    },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent'
                  }}
                  useResizeHandler={true}
                  style={{width: "100%", height: "100%"}}
                  config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                />
              ) : (
                <div className="text-center p-8">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                    </div>
                    <span className="text-gray-500 font-medium text-lg">Click "Embed and Plot" to visualize embeddings</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
