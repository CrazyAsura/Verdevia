'use client';

import React, { useState, useEffect } from 'react';
import {
  Unplug,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';
import api from '@/services/api';

type IntegrationConfig = {
  provider: string;
  config: string; // JSON stringified config
};

type OmnichannelTabProps = {
  token: string;
};

export function OmnichannelTab({ token }: OmnichannelTabProps) {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // WhatsApp Config state
  const [waPhone, setWaPhone] = useState('');
  const [waToken, setWaToken] = useState('');

  // Telegram Config state
  const [tgBotToken, setTgBotToken] = useState('');

  // Omnichannel message testing state
  const [testChannel, setTestChannel] = useState<'whatsapp' | 'telegram' | 'webhook'>('whatsapp');
  const [testConvId, setTestConvId] = useState('');
  const [testSenderId, setTestSenderId] = useState('');
  const [testText, setTestText] = useState('');
  const [testLawfulBasis, setTestLawfulBasis] = useState('Consentimento');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const fetchCredentials = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get<IntegrationConfig[]>('/ai/omnichannel/credentials');
      setIntegrations(response.data || []);
      // Pre-fill fields from credentials if found
      const waConfig = response.data.find((item) => item.provider === 'whatsapp');
      if (waConfig) {
        try {
          const parsed = JSON.parse(waConfig.config);
          setWaPhone(parsed.phoneNumberId || '');
          setWaToken(parsed.accessToken || '');
        } catch {}
      }
      const tgConfig = response.data.find((item) => item.provider === 'telegram');
      if (tgConfig) {
        try {
          const parsed = JSON.parse(tgConfig.config);
          setTgBotToken(parsed.botToken || '');
        } catch {}
      }
    } catch (err: any) {
      setErrorMsg('Nenhuma credencial configurada ainda ou erro ao buscar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [token]);

  const handleSaveIntegration = async (provider: 'whatsapp' | 'telegram', configData: Record<string, string>) => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.post('/ai/omnichannel/credentials', {
        provider,
        config: JSON.stringify(configData),
      });
      setSuccessMsg(`Configuração de ${provider.toUpperCase()} atualizada com sucesso!`);
      fetchCredentials();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Falha ao salvar configuração.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestSending(true);
    setTestResult(null);
    setErrorMsg(null);

    try {
      const response = await api.post('/ai/omnichannel/send', {
        channel: testChannel,
        conversationId: testConvId,
        senderId: testSenderId,
        text: testText,
        lawfulBasis: testLawfulBasis,
        metadata: {
          clientName: 'Teste Omnichannel VERDEVIA',
          env: 'development',
        },
      });
      setTestResult(response.data);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Falha ao enviar mensagem de teste.');
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/5">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider">Integrações Omnichannel</h2>
          <p className="text-[11px] text-zinc-400">Configure os webhooks de atendimento e teste o barramento de envio de mensagens.</p>
        </div>
        <button
          onClick={fetchCredentials}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Recarregar configurações"
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw size={14} />}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[11px] font-semibold animate-pulse">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-[11px] font-semibold">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Channel Credentials */}
        <div className="space-y-6">
          {/* WhatsApp Cloud API */}
          <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">WhatsApp Cloud API</h3>
              <p className="text-[10px] text-zinc-500">Configure o identificador de telefone e chave permanente.</p>
            </div>
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Phone Number ID</label>
                <input
                  type="text"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="Ex: 10452378951234"
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Access Token (Meta Developer)</label>
                <input
                  type="password"
                  value={waToken}
                  onChange={(e) => setWaToken(e.target.value)}
                  placeholder="EAAA..."
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <button
                onClick={() => handleSaveIntegration('whatsapp', { phoneNumberId: waPhone, accessToken: waToken })}
                disabled={saving}
                className="w-full h-9 flex items-center justify-center bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Salvar WhatsApp'}
              </button>
            </div>
          </div>

          {/* Telegram Bot config */}
          <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Telegram Bot API</h3>
              <p className="text-[10px] text-zinc-500">Insira a chave do bot obtida com @BotFather.</p>
            </div>
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Bot Token</label>
                <input
                  type="password"
                  value={tgBotToken}
                  onChange={(e) => setTgBotToken(e.target.value)}
                  placeholder="123456789:ABCdefGhI..."
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <button
                onClick={() => handleSaveIntegration('telegram', { botToken: tgBotToken })}
                disabled={saving}
                className="w-full h-9 flex items-center justify-center bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Salvar Telegram'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Omnichannel testing console */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Console de Envio</h3>
            <p className="text-[10px] text-zinc-500">Teste o envio de mensagens de forma segura e auditada (LGPD).</p>
          </div>

          <form onSubmit={handleTestSendMessage} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Canal</label>
                <select
                  value={testChannel}
                  onChange={(e: any) => setTestChannel(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="webhook">Webhook externo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Base Legal LGPD</label>
                <select
                  value={testLawfulBasis}
                  onChange={(e) => setTestLawfulBasis(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="Consentimento">Consentimento do Titular</option>
                  <option value="Execução de Contrato">Execução de Contrato</option>
                  <option value="Interesse Legítimo">Legítimo Interesse</option>
                  <option value="Cumprimento de Obrigação Legal">Obrigação Legal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">ID da Conversa</label>
                <input
                  type="text"
                  required
                  value={testConvId}
                  onChange={(e) => setTestConvId(e.target.value)}
                  placeholder="Ex: conv_12345"
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">ID do Remetente (Hash)</label>
                <input
                  type="text"
                  required
                  value={testSenderId}
                  onChange={(e) => setTestSenderId(e.target.value)}
                  placeholder="Ex: 557999887766"
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Conteúdo do Texto</label>
              <textarea
                required
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Olá! Sou o assistente RAG. Como posso ajudar com sua denúncia?"
                rows={3}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={testSending}
              className="w-full h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer gap-2"
            >
              {testSending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Enviar Mensagem de Teste</span>
                </>
              )}
            </button>
          </form>

          {/* Test Response Console */}
          {testResult && (
            <div className="mt-2 bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-zinc-300 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-1 select-none">
                <span>Retorno do Servidor (Sucesso)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ID da Mensagem:</span>
                <span className="text-white font-bold">{testResult.messageId || 'msg_null'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Canal:</span>
                <span className="text-white uppercase">{testResult.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Base Legal LGPD:</span>
                <span className="text-emerald-400 font-bold">{testResult.lawfulBasis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Destinatário Hash:</span>
                <span className="text-white truncate max-w-[180px]" title={testResult.recipientIdHash}>{testResult.recipientIdHash || 'N/A'}</span>
              </div>
              <div className="flex flex-col mt-2 pt-2 border-t border-white/5">
                <span className="text-zinc-500 text-[9px] uppercase tracking-wider">Payload Sanitizado:</span>
                <pre className="text-zinc-400 text-[9px] mt-1 select-all overflow-x-auto bg-zinc-950 p-2 rounded border border-white/5">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
