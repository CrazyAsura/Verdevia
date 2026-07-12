import ComplaintsService, { Complaint } from '../../services/complaints.service';

const REGISTERED_COMPANIES = [
  { name: 'EcoTech', plan: 'Premium' },
  { name: 'SocialFlow', plan: 'Plus' },
  { name: 'GreenEnergy', plan: 'Premium' },
  { name: 'HealthGuard', plan: 'Enterprise' },
  { name: 'AquaVida', plan: 'Basic' }
];

class ComplaintsMFE extends HTMLElement {
  private complaints: Complaint[] = [];
  private selectedComplaint: Complaint | null = null;
  private chatMessages: { sender: string; text: string; time: string }[] = [];
  private isLoading = true;
  private activeStatusTab = 'todos';

  constructor() {
    super();
  }

  connectedCallback() {
    this.loadComplaints();
  }

  private async loadComplaints() {
    this.isLoading = true;
    this.render();
    try {
      const response = await ComplaintsService.getComplaints(1, 20);
      this.complaints = response.items ?? [];
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private render() {
    this.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Complaints List & Filter -->
        <div class="lg:col-span-1 space-y-6">
          <div class="backdrop-blur-md bg-[#080808]/80 border border-white/5 p-6 rounded-3xl space-y-4">
            <div>
              <h3 class="text-md font-black uppercase tracking-tight text-white">Filtro de Status</h3>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gerencie e ordene as reclamações</p>
            </div>
            <div class="flex flex-wrap gap-2">
              ${['todos', 'pendente', 'em análise', 'resolvido'].map(status => `
                <button class="tab-btn px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  this.activeStatusTab === status 
                    ? 'bg-primary text-black' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }" data-status="${status}">
                  ${status}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="backdrop-blur-md bg-[#080808]/80 border border-white/5 p-6 rounded-3xl space-y-4 max-h-[500px] overflow-y-auto">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">Reclamações Recentes</h3>
            ${this.isLoading ? `
              <div class="space-y-4">
                <div class="h-20 bg-white/5 rounded-2xl animate-pulse"></div>
                <div class="h-20 bg-white/5 rounded-2xl animate-pulse"></div>
              </div>
            ` : this.filteredComplaints.length === 0 ? `
              <p class="text-center text-slate-600 text-xs py-8">Nenhuma queixa encontrada.</p>
            ` : this.filteredComplaints.map(item => `
              <div class="complaint-card p-4 bg-white/2 border ${this.selectedComplaint?.id === item.id ? 'border-primary/50' : 'border-white/5'} rounded-2xl cursor-pointer hover:border-primary/30 transition-all space-y-2" data-id="${item.id}">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black uppercase tracking-widest ${
                    item.status.toLowerCase() === 'resolvido' ? 'text-primary' : item.status.toLowerCase() === 'em análise' ? 'text-amber-400' : 'text-slate-400'
                  }">
                    ${item.status}
                  </span>
                  <span class="text-[8px] text-slate-600 font-bold">
                    ${new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h4 class="text-sm font-bold text-white line-clamp-1">${item.type}</h4>
                <p class="text-xs text-slate-500 line-clamp-1">${item.location}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Complaint Details & Internal Chat -->
        <div class="lg:col-span-2">
          ${this.selectedComplaint ? this.renderDetailView() : `
            <div class="backdrop-blur-md bg-[#080808]/80 border border-white/5 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
              <p class="text-sm font-bold">Selecione uma queixa para ver os detalhes e iniciar o atendimento</p>
            </div>
          `}
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  private get filteredComplaints() {
    if (this.activeStatusTab === 'todos') return this.complaints;
    return this.complaints.filter(c => c.status.toLowerCase() === this.activeStatusTab.toLowerCase());
  }

  private renderDetailView() {
    const comp = this.selectedComplaint!;
    return `
      <div class="backdrop-blur-md bg-[#080808]/80 border border-white/5 rounded-3xl p-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <h3 class="text-lg font-black uppercase tracking-tight text-white">${comp.type}</h3>
            <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Localização: ${comp.location}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Alterar Status:</span>
            <select id="status-select" class="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50">
              <option value="Pendente" ${comp.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
              <option value="Em análise" ${comp.status === 'Em análise' ? 'selected' : ''}>Em análise</option>
              <option value="Resolvido" ${comp.status === 'Resolvido' ? 'selected' : ''}>Resolvido</option>
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="text-xs font-black uppercase tracking-widest text-slate-400">Descrição do Ocorrido</h4>
          <p class="text-sm text-slate-300 leading-relaxed">${comp.description}</p>
        </div>

        <!-- Chat Section -->
        <div class="space-y-4">
          <h4 class="text-xs font-black uppercase tracking-widest text-slate-400">Atendimento Interno</h4>
          <div class="border border-white/5 rounded-2xl bg-black/40 overflow-hidden flex flex-col h-[300px]">
            <!-- Messages container -->
            <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3">
              ${this.chatMessages.map(msg => `
                <div class="flex flex-col ${msg.sender === 'Admin' ? 'items-end' : 'items-start'}">
                  <div class="max-w-[75%] rounded-2xl px-4 py-2 text-xs ${
                    msg.sender === 'Admin' 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-white/5 text-white border border-white/10'
                  }">
                    ${msg.text}
                  </div>
                  <span class="text-[8px] text-slate-600 font-bold mt-1">${msg.time}</span>
                </div>
              `).join('')}
            </div>

            <!-- Input area with autocomplete overlay -->
            <div class="relative p-3 border-t border-white/5 bg-[#080808]/90 flex gap-2">
              <div id="company-autocomplete" class="hidden absolute bottom-full left-0 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 mb-2 shadow-2xl z-50 max-h-48 overflow-y-auto space-y-1">
                <div class="text-[8px] font-black uppercase text-slate-500 tracking-widest px-2 py-1">Empresas com Plano Assinado</div>
                ${REGISTERED_COMPANIES.map(company => `
                  <button class="autocomplete-item w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-primary/20 hover:text-primary rounded-lg transition-all" data-name="${company.name}">
                    @${company.name} <span class="text-[8px] text-slate-500 bg-white/5 px-1 py-0.5 rounded ml-1">${company.plan}</span>
                  </button>
                `).join('')}
              </div>

              <input type="text" id="chat-input" placeholder="Mensagem interna... Use @ para mencionar empresa" 
                class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary/50" />
              <button id="send-chat-btn" class="bg-primary text-black font-black uppercase tracking-widest text-[9px] px-4 rounded-xl active:scale-95 transition-all">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners() {
    this.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeStatusTab = btn.getAttribute('data-status') || 'todos';
        this.render();
      });
    });

    this.querySelectorAll('.complaint-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        this.selectedComplaint = this.complaints.find(c => c.id === id) || null;
        this.chatMessages = [
          { sender: 'Comum', text: 'Gostaria de relatar este problema. Ele afeta minha rua há dias.', time: '13:00' },
        ];
        this.render();
      });
    });

    const statusSelect = this.querySelector('#status-select');
    statusSelect?.addEventListener('change', async (e) => {
      const newStatus = (e.target as HTMLSelectElement).value;
      if (this.selectedComplaint) {
        try {
          await ComplaintsService.updateComplaintStatus(this.selectedComplaint.id, newStatus);
          this.selectedComplaint.status = newStatus;
          this.loadComplaints();
        } catch (err) {
          console.error(err);
        }
      }
    });

    const chatInput = this.querySelector('#chat-input') as HTMLInputElement;
    const autocomplete = this.querySelector('#company-autocomplete') as HTMLDivElement;

    chatInput?.addEventListener('input', (e) => {
      const val = chatInput.value;
      const lastWord = val.split(' ').pop() || '';
      if (lastWord.startsWith('@')) {
        autocomplete?.classList.remove('hidden');
      } else {
        autocomplete?.classList.add('hidden');
      }
    });

    this.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        const name = item.getAttribute('data-name');
        const val = chatInput.value;
        const words = val.split(' ');
        words.pop(); // remove last typed "@..."
        words.push(`@${name}`);
        chatInput.value = words.join(' ') + ' ';
        autocomplete?.classList.add('hidden');
        chatInput.focus();
      });
    });

    const sendBtn = this.querySelector('#send-chat-btn');
    const sendMsg = () => {
      const text = chatInput?.value.trim();
      if (text) {
        this.chatMessages.push({
          sender: 'Admin',
          text,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
        chatInput.value = '';
        autocomplete?.classList.add('hidden');
        this.render();
        // scroll chat down
        const chatBox = this.querySelector('#chat-messages');
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      }
    };

    sendBtn?.addEventListener('click', sendMsg);
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendMsg();
      }
    });
  }
}

if (!customElements.get('complaints-mfe')) {
  customElements.define('complaints-mfe', ComplaintsMFE);
}

export default ComplaintsMFE;
