import React, { useState } from 'react';
import { PredictionResult, Alert } from '../types';
import { X, Send, Copy, Share2, Check, Mail, MessageSquare, ShieldAlert, PhoneCall } from 'lucide-react';

interface EmergencyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction?: PredictionResult;
  userId?: string;
  userName?: string;
  onAlertSent?: (alert: Alert) => void;
}

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  isOpen,
  onClose,
  prediction,
  userId,
  userName,
  onAlertSent
}) => {
  const [recipient, setRecipient] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const severity = prediction?.severity || 'Fatal';
  const lat = prediction?.input.location.latitude || 37.7749;
  const lng = prediction?.input.location.longitude || -122.4194;
  const city = prediction?.input.location.city || 'San Francisco';
  const weather = prediction?.input.weatherCondition || 'Stormy Rain';
  const timestamp = new Date().toLocaleString();

  // Standard Emergency Message Template
  const alertMessage = `🚨 ROAD ACCIDENT RISK EMERGENCY ALERT

Severity: ${severity.toUpperCase()} RISK (${prediction?.riskScore || 85}/100)
Location: ${city} (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})
Weather: ${weather} (Visibility: ${prediction?.input.visibilityKm || 2.0}km)
Vehicle: ${prediction?.input.vehicleType || 'Car'}
Timestamp: ${timestamp}

Automated Alert dispatched via SafeRoad Emergency System.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(alertMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = async () => {
    const encoded = encodeURIComponent(alertMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    await recordAlertInDb('whatsapp');
  };

  const handleSendSmsDemo = async () => {
    if (!recipient.trim()) {
      alert('Please enter recipient phone number for SMS broadcast.');
      return;
    }
    setSending(true);
    await recordAlertInDb('sms');
    setSending(false);
  };

  const handleSendEmailDemo = async () => {
    if (!recipient.trim()) {
      alert('Please enter recipient email address.');
      return;
    }
    setSending(true);
    await recordAlertInDb('email');
    setSending(false);
  };

  const recordAlertInDb = async (type: 'whatsapp' | 'sms' | 'email' | 'copy') => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictionId: prediction?.id,
          userId,
          userName,
          alertMessage,
          recipient: recipient || '+1 (555) 019-9888',
          type,
          severity,
          location: { city, latitude: lat, longitude: lng }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSentSuccess(`Emergency alert logged & dispatched via ${type.toUpperCase()}!`);
        if (onAlertSent && data.alert) {
          onAlertSent(data.alert);
        }
      }
    } catch (e) {
      console.error('Alert record error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-rose-200 bg-rose-50">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg font-bold font-['Outfit'] text-slate-900">Emergency Risk Broadcast System</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-rose-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {sentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{sentSuccess}</span>
            </div>
          )}

          {/* Formatted Alert Message Box */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Generated Emergency Risk Message</label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 whitespace-pre-wrap leading-relaxed relative group">
              {alertMessage}
            </div>
          </div>

          {/* Recipient Input */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Emergency Recipient (Phone Number or Email)</label>
            <input
              type="text"
              placeholder="+1 (555) 999-8877 or contact@emergency.gov"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Broadcast Channels Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            
            <button
              onClick={handleSendWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center justify-center gap-2 border border-slate-200"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Alert Text'}</span>
            </button>

            <button
              onClick={handleSendSmsDemo}
              disabled={sending}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Send SMS (API Demo)</span>
            </button>

            <button
              onClick={handleSendEmailDemo}
              disabled={sending}
              className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email Alert</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
