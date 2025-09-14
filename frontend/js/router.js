// Sistema de Roteamento para FilaDigital
// Este arquivo pode ser usado quando implementar um SPA ou servidor com roteamento

class Router {
    constructor() {
        this.routes = {
            '/': 'pages/dashboard.html',
            '/dashboard': 'pages/dashboard.html',
            '/estabelecimentos': 'pages/estabelecimentos.html',
            '/minhas-filas': 'pages/minhas-filas.html',
            '/minha-posicao': 'pages/minha-posicao.html'
        };

        this.currentRoute = '/';
        this.init();
    }

    init() {
        // Interceptar cliques nos links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link');
            if (link && link.getAttribute('href').startsWith('/')) {
                e.preventDefault();
                const route = link.getAttribute('href');
                this.navigate(route);
            }
        });

        // Detectar navegação do navegador (botão voltar/avançar)
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.navigate(e.state.route, false);
            }
        });

        // Carregar rota inicial
        this.navigate(window.location.pathname);
    }

    navigate(route, updateHistory = true) {
        const filePath = this.routes[route] || this.routes['/'];

        if (filePath) {
            this.currentRoute = route;

            if (updateHistory) {
                history.pushState({ route }, '', route);
            }

            // Atualizar classe ativa na navbar
            this.updateActiveLink(route);

            // Se estiver usando SPA, aqui você carregaria o conteúdo dinamicamente
            // Por enquanto, redireciona para o arquivo estático
            if (window.location.pathname !== route) {
                window.location.href = filePath;
            }
        } else {
            console.warn('Rota não encontrada:', route);
        }
    }

    updateActiveLink(route) {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const linkRoute = link.getAttribute('href');
            if (linkRoute === route) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Método para adicionar novas rotas dinamicamente
    addRoute(route, filePath) {
        this.routes[route] = filePath;
    }

    // Método para obter a rota atual
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Para uso futuro com SPA
// const router = new Router();

// Para uso atual com arquivos estáticos, mantemos o sistema simples no app.js

// Exportar para uso em outros arquivos
window.Router = Router;