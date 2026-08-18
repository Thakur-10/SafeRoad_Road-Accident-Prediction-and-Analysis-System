import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Sparkles, Radio, ShieldAlert } from 'lucide-react';

interface VoiceCommandAssistantProps {
  setActiveTab: (tab: string) => void;
  onTriggerEmergency: () => void;
}

export const VoiceCommandAssistant: React.FC<VoiceCommandAssistantProps> = ({
  setActiveTab,
  onTriggerEmergency
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastCommandFeedback, setLastCommandFeedback] = useState<string>('Say "Open Map", "Camera AI", or "Trigger Emergency"');
  const [recognitionSupported, setRecognitionSupported] = useState<boolean>(true);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      setLastCommandFeedback('Voice recognition not supported in this browser.');
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setLastCommandFeedback('Listening for voice command...');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript.toLowerCase().trim();
        setTranscript(text);

        if (event.results[current].isFinal) {
          processCommand(text);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setLastCommandFeedback('Voice recognition error. Try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  const processCommand = (cmd: string) => {
    console.log('Voice Command Processed:', cmd);

    if (cmd.includes('emergency') || cmd.includes('sos') || cmd.includes('accident alert')) {
      setLastCommandFeedback('Voice Command: Triggering Emergency Alert!');
      onTriggerEmergency();
    } else if (cmd.includes('map') || cmd.includes('hotspot')) {
      setLastCommandFeedback('Voice Command: Opening Live Map');
      setActiveTab('map');
    } else if (cmd.includes('camera') || cmd.includes('monitor') || cmd.includes('fatigue')) {
      setLastCommandFeedback('Voice Command: Opening Camera AI');
      setActiveTab('camera');
    } else if (cmd.includes('predict') || cmd.includes('severity') || cmd.includes('assessment')) {
      setLastCommandFeedback('Voice Command: Opening AI Predictor');
      setActiveTab('predict');
    } else if (cmd.includes('analytics') || cmd.includes('stats') || cmd.includes('chart')) {
      setLastCommandFeedback('Voice Command: Opening Analytics');
      setActiveTab('analytics');
    } else if (cmd.includes('home') || cmd.includes('landing') || cmd.includes('start')) {
      setLastCommandFeedback('Voice Command: Returning Home');
      setActiveTab('landing');
    } else {
      setLastCommandFeedback(`Command "${cmd}" not recognized. Try "Open Map" or "Trigger Emergency".`);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3">
      
      {/* Status / Feedback Pill */}
      {(isListening || transcript) && (
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs flex items-center space-x-3 animate-fade-in max-w-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <div className="truncate">
            <div className="font-bold text-rose-400 font-mono text-[10px] uppercase">Hands-Free Voice Assistant</div>
            <div className="text-slate-200 truncate">{transcript || lastCommandFeedback}</div>
          </div>
        </div>
      )}

      {/* Floating Mic Button */}
      <button
        onClick={toggleListening}
        className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${
          isListening 
            ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/50 ring-4 ring-rose-400/30' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/40'
        }`}
        title={isListening ? 'Listening... Click to stop' : 'Click to speak voice command'}
      >
        {isListening ? <Mic className="w-6 h-6 animate-bounce" /> : <Mic className="w-6 h-6" />}
      </button>

    </div>
  );
};
