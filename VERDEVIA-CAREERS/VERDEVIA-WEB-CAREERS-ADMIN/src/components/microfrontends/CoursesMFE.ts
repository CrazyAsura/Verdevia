import CoursesService, { Course } from '../../services/courses.service';

class CoursesMFE extends HTMLElement {
  private courses: Course[] = [];
  private isLoading = true;
  private editingCourse: Course | null = null;
  private showForm = false;

  constructor() {
    super();
  }

  connectedCallback() {
    this.loadCourses();
  }

  private async loadCourses() {
    this.isLoading = true;
    this.render();
    try {
      this.courses = await CoursesService.getCourses();
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private render() {
    this.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-black uppercase italic tracking-tighter text-glow">Gestão de <span class="text-primary">Cursos (MFE)</span></h2>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gerencie aulas e trilhas de aprendizagem</p>
          </div>
          <button id="btn-toggle-form" class="bg-primary hover:bg-primary/95 text-black font-black uppercase tracking-widest text-[10px] h-10 px-5 rounded-xl transition-all active:scale-95 flex items-center gap-2">
            ${this.showForm ? 'Voltar para Lista' : 'Criar Curso'}
          </button>
        </div>

        ${this.showForm ? this.renderForm() : this.renderList()}
      </div>
    `;

    this.setupEventListeners();
  }

  private renderForm() {
    return `
      <div class="backdrop-blur-md bg-[#080808]/80 border border-white/5 p-6 rounded-3xl max-w-2xl mx-auto shadow-2xl">
        <h3 class="text-md font-black uppercase tracking-wider mb-6 text-primary">
          ${this.editingCourse ? 'Editar Curso' : 'Novo Curso'}
        </h3>
        <form id="course-form" class="space-y-4">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Título do Curso</label>
            <input type="text" id="course-title" name="title" value="${this.editingCourse?.title || ''}" required 
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors" placeholder="Ex: Introdução ao Impacto Social" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nível</label>
              <select id="course-level" name="level" required 
                class="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors">
                <option value="Iniciante" ${this.editingCourse?.level === 'Iniciante' ? 'selected' : ''}>Iniciante</option>
                <option value="Intermediário" ${this.editingCourse?.level === 'Intermediário' ? 'selected' : ''}>Intermediário</option>
                <option value="Avançado" ${this.editingCourse?.level === 'Avançado' ? 'selected' : ''}>Avançado</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Duração</label>
              <input type="text" id="course-duration" name="duration" value="${this.editingCourse?.duration || ''}" 
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors" placeholder="Ex: 12 Horas" />
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Descrição</label>
            <textarea id="course-description" name="description" rows="4" 
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors" placeholder="Descreva brevemente o conteúdo do curso...">${this.editingCourse?.description || ''}</textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" id="btn-cancel" class="bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-10 px-5 rounded-xl transition-all">Cancelar</button>
            <button type="submit" class="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-5 rounded-xl transition-all">Salvar</button>
          </div>
        </form>
      </div>
    `;
  }

  private renderList() {
    if (this.isLoading) {
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="h-44 bg-white/5 border border-white/5 rounded-3xl animate-pulse"></div>
          <div class="h-44 bg-white/5 border border-white/5 rounded-3xl animate-pulse"></div>
        </div>
      `;
    }

    if (this.courses.length === 0) {
      return `
        <div class="backdrop-blur-md bg-white/1 border border-white/5 p-12 rounded-3xl text-center text-slate-500">
          Nenhum curso cadastrado ainda.
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.courses.map(course => `
          <div class="backdrop-blur-md bg-[#080808]/80 border border-white/5 rounded-3xl p-6 hover:border-primary/20 transition-all flex flex-col justify-between group">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/10">
                  ${course.level}
                </span>
                <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  ${course.duration || 'N/A'}
                </span>
              </div>
              <h4 class="font-bold text-base text-white group-hover:text-primary transition-colors line-clamp-1 mb-2">
                ${course.title}
              </h4>
              <p class="text-xs text-slate-500 line-clamp-2 mb-4">
                ${course.description || 'Sem descrição cadastrada para este curso.'}
              </p>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
              <span class="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                ${course.studentsCount ?? 0} alunos
              </span>
              <div class="flex items-center gap-2">
                <button class="btn-edit p-2 hover:bg-primary/20 text-slate-400 hover:text-primary rounded-xl transition-all" data-id="${course.id}">
                  Editar
                </button>
                <button class="btn-delete p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-xl transition-all" data-id="${course.id}">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private setupEventListeners() {
    const btnToggleForm = this.querySelector('#btn-toggle-form');
    btnToggleForm?.addEventListener('click', () => {
      this.showForm = !this.showForm;
      if (!this.showForm) this.editingCourse = null;
      this.render();
    });

    const btnCancel = this.querySelector('#btn-cancel');
    btnCancel?.addEventListener('click', () => {
      this.showForm = false;
      this.editingCourse = null;
      this.render();
    });

    const form = this.querySelector('#course-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form as HTMLFormElement);
      const payload = {
        title: formData.get('title') as string,
        level: formData.get('level') as string,
        duration: formData.get('duration') as string,
        description: formData.get('description') as string,
      };

      try {
        if (this.editingCourse) {
          await CoursesService.updateCourse(this.editingCourse.id, payload);
        } else {
          await CoursesService.createCourse(payload);
        }
        this.showForm = false;
        this.editingCourse = null;
        this.loadCourses();
      } catch (err) {
        console.error('Error saving course:', err);
      }
    });

    this.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const course = this.courses.find(c => c.id === id);
        if (course) {
          this.editingCourse = course;
          this.showForm = true;
          this.render();
        }
      });
    });

    this.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (id && confirm('Deseja excluir este curso permanentemente?')) {
          try {
            await CoursesService.deleteCourse(id);
            this.loadCourses();
          } catch (err) {
            console.error('Error deleting course:', err);
          }
        }
      });
    });
  }
}

if (!customElements.get('courses-mfe')) {
  customElements.define('courses-mfe', CoursesMFE);
}

export default CoursesMFE;
