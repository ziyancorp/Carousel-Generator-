import React, { useState } from 'react';
import {
  Key,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Trash2,
  Cpu,
  Globe,
  Sliders,
  Sparkles,
  Server
} from 'lucide-react';
import { AiProvider, ApiKeyConfig } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiKeyConfig;
  onSaveConfig: (config: ApiKeyConfig) => void;
  hasEnvKey: boolean;
}

const PROVIDERS: {
  id: AiProvider;
  name: string;
  badge: string;
  defaultModel: string;
  models: string[];
  placeholder: string;
  getKeyUrl: string;
  defaultBaseUrl?: string;
  description: string;
}[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Default / Recommended',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    placeholder: 'AIzaSy...',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    description: 'Model multimodal canggih dari Google dengan context window besar & latency ultra-cepat.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'GPT-4o & o3',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini'],
    placeholder: 'sk-proj-...',
    getKeyUrl: 'https://platform.openai.com/api-keys',
    description: 'Model penalaran dan penulisan terkemuka dari OpenAI.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    badge: 'Claude 3.7 / 3.5',
    defaultModel: 'claude-3-7-sonnet-20250219',
    models: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
    placeholder: 'sk-ant-...',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Model dengan gaya penulisan cerdas, nuansa alami, dan pemahaman instruksi mendalam.',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    badge: 'V3 & R1 Reasoner',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    placeholder: 'sk-...',
    getKeyUrl: 'https://platform.deepseek.com/api_keys',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    description: 'Model penalaran & kode sangat efisien dengan harga termurah per token.',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'Ultra Fast Llama',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    placeholder: 'gsk_...',
    getKeyUrl: 'https://console.groq.com/keys',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    description: 'Eksekusi inferensi AI tercepat di dunia menggunakan chip LPU Groq.',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: 'Universal Multi-LLM',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    models: ['anthropic/claude-3.5-sonnet', 'google/gemini-2.5-flash', 'openai/gpt-4o', 'deepseek/deepseek-r1'],
    placeholder: 'sk-or-...',
    getKeyUrl: 'https://openrouter.ai/keys',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    description: 'Satu API Key untuk mengakses ratusan model AI dari berbagai provider dunia.',
  },
  {
    id: 'xkiro',
    name: 'XKiro API',
    badge: '1M Token • Qwen Free',
    defaultModel: 'qwen/qwen3.8-max:free',
    models: [
      'qwen/qwen3.8-max:free',
      'qwen/qwen-2.5-72b-instruct',
      'deepseek/deepseek-r1:free',
      'meta-llama/llama-3.3-70b-instruct'
    ],
    placeholder: 'sk-xt-...',
    getKeyUrl: 'https://api.xkiro.com',
    defaultBaseUrl: 'https://api.xkiro.com/v1',
    description: 'Akses API OpenAI-compatible berkecepatan tinggi dengan context window 1 Juta Token & model Qwen Max gratis permanen.',
  },
  {
    id: 'custom',
    name: 'Custom / Local API',
    badge: 'Ollama / vLLM / Proxy',
    defaultModel: 'custom-model',
    models: ['custom-model', 'llama3', 'mistral', 'qwen2.5-coder'],
    placeholder: 'sk-... (optional for local)',
    getKeyUrl: '',
    defaultBaseUrl: 'http://localhost:11434/v1',
    description: 'Gunakan server OpenAI-compatible milikmu sendiri (Ollama, LM Studio, vLLM, dll).',
  },
];

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  hasEnvKey,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(config.provider || 'gemini');
  const [inputKey, setInputKey] = useState(config.apiKey || '');
  const [selectedModel, setSelectedModel] = useState(
    config.model || PROVIDERS.find((p) => p.id === (config.provider || 'gemini'))?.defaultModel || ''
  );
  const [customBaseUrl, setCustomBaseUrl] = useState(config.baseUrl || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const currentProviderDef = PROVIDERS.find((p) => p.id === selectedProvider) || PROVIDERS[0];

  const handleProviderChange = (providerId: AiProvider) => {
    setSelectedProvider(providerId);
    const def = PROVIDERS.find((p) => p.id === providerId);
    if (def) {
      setSelectedModel(def.defaultModel);
      setCustomBaseUrl(def.defaultBaseUrl || '');
    }
    setTestResult(null);
  };

  const handleTestKey = async () => {
    const keyToTest = inputKey.trim();
    if (!keyToTest && selectedProvider !== 'custom') {
      setTestResult({ success: false, message: 'Harap masukkan API Key terlebih dahulu.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: keyToTest,
          model: selectedModel,
          baseUrl: customBaseUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setTestResult({
          success: true,
          message: `✓ Koneksi ke ${currentProviderDef.name} (${selectedModel || 'Default'}) BERHASIL & Siap Digunakan!`,
        });
      } else {
        setTestResult({ success: false, message: data.error || 'Koneksi API Key gagal.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Gagal menguji koneksi API Key.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      provider: selectedProvider,
      apiKey: inputKey.trim(),
      model: selectedModel.trim(),
      baseUrl: customBaseUrl.trim() || undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setInputKey('');
    onSaveConfig({
      provider: selectedProvider,
      apiKey: '',
      model: currentProviderDef.defaultModel,
      baseUrl: undefined,
    });
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#111114] border border-[#2d2d35] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Konfigurasi AI Provider & API Key</h3>
              <p className="text-[11px] text-gray-400">Gunakan Gemini, OpenAI, Claude, DeepSeek, Groq, atau OpenRouter</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1f] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Provider Selector Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Pilih AI Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROVIDERS.map((prov) => {
                const isSelected = selectedProvider === prov.id;
                return (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => handleProviderChange(prov.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-[#18181d] border-[#2d2d35] text-gray-400 hover:text-gray-200 hover:bg-[#202027]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs text-white">{prov.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <span className="text-[9.5px] text-blue-400/90 font-mono line-clamp-1">{prov.badge}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
              {currentProviderDef.description}
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span>Model AI Target</span>
              <span className="text-[10px] text-blue-400 font-normal">Bisa pilih atau ketik kustom</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition font-mono"
              >
                {currentProviderDef.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder="Atau masukkan custom model name..."
                className="flex-1 bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition font-mono"
              />
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span>{currentProviderDef.name} API Key</span>
              {currentProviderDef.getKeyUrl && (
                <a
                  href={currentProviderDef.getKeyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                >
                  Dapatkan API Key di sini ↗
                </a>
              )}
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder={currentProviderDef.placeholder}
                className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-gray-400 hover:text-white transition"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[10px] text-gray-500 flex items-center justify-between">
              <span>Disimpan aman di localStorage browser Anda.</span>
              {inputKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" /> Hapus Key
                </button>
              )}
            </div>
          </div>

          {/* Custom Base URL (For DeepSeek, Groq, OpenRouter, Custom / Local) */}
          {(selectedProvider === 'custom' || selectedProvider === 'openrouter' || selectedProvider === 'deepseek' || selectedProvider === 'groq') && (
            <div className="space-y-1.5 p-3 rounded-xl bg-[#16161a] border border-[#26262e]">
              <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Custom Endpoint / Base URL (Opsional)</span>
              </label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder={currentProviderDef.defaultBaseUrl || 'http://localhost:11434/v1'}
                className="w-full bg-[#1e1e24] border border-[#2d2d35] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          {/* Test Status Box */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn ${
                testResult.success
                  ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-800 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={isTesting || (!inputKey.trim() && selectedProvider !== 'custom')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1a1a1f] hover:bg-[#25252c] border border-[#2d2d35] text-gray-300 hover:text-white transition disabled:opacity-40 flex items-center gap-1.5"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menguji...</span>
              </>
            ) : (
              <span>Uji Koneksi Provider</span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Provider</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
