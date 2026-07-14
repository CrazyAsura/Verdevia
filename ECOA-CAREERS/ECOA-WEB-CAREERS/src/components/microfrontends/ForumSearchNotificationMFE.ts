import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../../services/api';
import ForumService, { ForumPost } from '../../services/forum.service';

type OperationalNotification = {
  id: string;
  message: string;
  type: string;
  time: string;
};

class ForumSearchNotificationMFE extends HTMLElement {
  private posts: ForumPost[] = [];
  private notifications: OperationalNotification[] = [];
  private searchQuery = '';
  private selectedCategory = '';
  private isLoading = false;
  private notificationsConnected = false;
  private socket: Socket | null = null;

  connectedCallback() {
    this.loadPosts();
    this.setupRealtimeNotifications();
  }

  disconnectedCallback() {
    this.socket?.disconnect();
    this.socket = null;
  }

  private async loadPosts() {
    this.isLoading = true;
    this.render();
    try {
      const response = await ForumService.getPosts(
        1,
        10,
        this.searchQuery || undefined,
        this.selectedCategory || undefined,
      );
      this.posts = response.items ?? [];
    } catch (err) {
      console.error('Error loading forum posts:', err);
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private setupRealtimeNotifications() {
    if (this.socket) return;

    this.notifications = [
      {
        id: 'connection-status',
        message: 'Conectando ao canal operacional em tempo real...',
        type: 'info',
        time: 'Agora',
      },
    ];

    const socketUrl = getApiBaseUrl().replace(/\/api$/, '');
    this.socket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      this.notificationsConnected = true;
      this.notifications = [
        {
          id: 'connected',
          message: 'Canal de notificações conectado. Aguardando eventos reais do backend.',
          type: 'success',
          time: 'Agora',
        },
      ];
      this.render();
    });

    this.socket.on('disconnect', () => {
      this.notificationsConnected = false;
      this.notifications.unshift({
        id: `disconnect-${Date.now()}`,
        message: 'Canal de notificações desconectado. Tentando reconectar...',
        type: 'warning',
        time: 'Agora',
      });
      this.trimNotifications();
      this.render();
    });

    this.socket.on(
      'notification',
      (payload: { id?: string; title?: string; message?: string; type?: string; timestamp?: string }) => {
        this.addNotification({
          id: payload.id || String(Date.now()),
          message: [payload.title, payload.message].filter(Boolean).join(' - '),
          type: payload.type || 'info',
          time: this.formatTime(payload.timestamp),
        });
      },
    );

    this.socket.on(
      'global_notification',
      (payload: { title?: string; message?: string; timestamp?: string }) => {
        this.addNotification({
          id: `global-${Date.now()}`,
          message: [payload.title, payload.message].filter(Boolean).join(' - '),
          type: 'global',
          time: this.formatTime(payload.timestamp),
        });
      },
    );
  }

  private addNotification(notification: OperationalNotification) {
    this.notifications.unshift(notification);
    this.trimNotifications();
    this.render();
  }

  private trimNotifications() {
    this.notifications = this.notifications.slice(0, 8);
  }

  private formatTime(timestamp?: string) {
    if (!timestamp) return 'Agora';
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  }

  private escapeHtml(value: unknown) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[char];
    });
  }

  private render() {
    this.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="backdrop-blur-md bg-[#080808]/80 border border-white/5 p-6 rounded-3xl space-y-4">
            <div>
              <h3 class="text-md font-black uppercase tracking-tight text-white">Moderação de Fórum</h3>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Busque e modere tópicos criados pela comunidade</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <input type="text" id="forum-search-input" value="${this.escapeHtml(this.searchQuery)}" placeholder="Buscar tópicos por palavras-chave..."
                class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50" />
              <select id="forum-category-select" class="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50">
                <option value="">Todas Categorias</option>
                <option value="Saneamento" ${this.selectedCategory === 'Saneamento' ? 'selected' : ''}>Saneamento</option>
                <option value="Segurança" ${this.selectedCategory === 'Segurança' ? 'selected' : ''}>Segurança</option>
                <option value="Educação" ${this.selectedCategory === 'Educação' ? 'selected' : ''}>Educação</option>
              </select>
            </div>
          </div>

          <div class="space-y-4">
            ${this.isLoading ? `
              <div class="h-32 bg-white/5 rounded-3xl animate-pulse"></div>
            ` : this.posts.length === 0 ? `
              <div class="backdrop-blur-md bg-white/1 border border-white/5 p-12 rounded-3xl text-center text-slate-500">
                Nenhum tópico encontrado com esses filtros.
              </div>
            ` : this.posts.map(post => `
              <div class="backdrop-blur-md bg-[#080808]/80 border border-white/5 p-6 rounded-3xl hover:border-primary/20 transition-all flex flex-col justify-between group">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-white">${this.escapeHtml(post.userName)}</span>
                    <span class="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase text-slate-500 tracking-widest">${this.escapeHtml(post.category)}</span>
                  </div>
                  <button class="btn-delete-post text-[10px] text-slate-600 hover:text-red-500 font-black uppercase tracking-widest" data-id="${this.escapeHtml(post.id)}">
                    Excluir
                  </button>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed mb-4">${this.escapeHtml(post.content)}</p>
                <div class="flex items-center gap-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  <span>${post.views ?? 0} Visualizações</span>
                  <span>${post.likes ?? 0} Curtidas</span>
                  <span>${post.commentsCount ?? 0} Comentários</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="backdrop-blur-md bg-[#080808]/80 border border-white/5 p-6 rounded-3xl space-y-6">
            <div>
              <h3 class="text-md font-black uppercase tracking-tight text-white flex items-center gap-2">
                Notificações <span class="w-2 h-2 rounded-full ${this.notificationsConnected ? 'bg-primary animate-ping' : 'bg-amber-500'}"></span>
              </h3>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Alertas operacionais em tempo real via WebSocket</p>
            </div>

            <div class="space-y-4">
              ${this.notifications.map(notif => `
                <div class="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-start justify-between gap-3 group hover:bg-white/4 hover:border-primary/20 transition-all">
                  <div class="space-y-1">
                    <p class="text-xs text-slate-300 leading-relaxed">${this.escapeHtml(notif.message)}</p>
                    <span class="text-[8px] text-slate-600 font-bold uppercase tracking-widest block">${this.escapeHtml(notif.time)}</span>
                  </div>
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${this.notificationClass(notif.type)}">
                    ${this.escapeHtml(notif.type)}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  private notificationClass(type: string) {
    if (type === 'error' || type === 'complaint') return 'bg-red-500/10 text-red-500';
    if (type === 'success' || type === 'mention') return 'bg-primary/10 text-primary';
    if (type === 'warning') return 'bg-amber-500/10 text-amber-500';
    return 'bg-slate-800 text-slate-400';
  }

  private setupEventListeners() {
    const searchInput = this.querySelector('#forum-search-input') as HTMLInputElement;
    searchInput?.addEventListener('change', () => {
      this.searchQuery = searchInput.value;
      this.loadPosts();
    });

    const categorySelect = this.querySelector('#forum-category-select') as HTMLSelectElement;
    categorySelect?.addEventListener('change', () => {
      this.selectedCategory = categorySelect.value;
      this.loadPosts();
    });

    this.querySelectorAll('.btn-delete-post').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (id && confirm('Excluir este tópico permanentemente?')) {
          try {
            await ForumService.removePost(id);
            this.loadPosts();
          } catch (err) {
            console.error(err);
          }
        }
      });
    });
  }
}

if (!customElements.get('forum-search-notification-mfe')) {
  customElements.define('forum-search-notification-mfe', ForumSearchNotificationMFE);
}

export default ForumSearchNotificationMFE;
