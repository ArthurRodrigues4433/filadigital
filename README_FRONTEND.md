# FilaDigital - Frontend

## Estrutura Organizada do Frontend

O frontend do FilaDigital foi reestruturado para melhor organização e escalabilidade:

```
frontend/
├── pages/              # Páginas HTML da aplicação
│   ├── index.html              # Página de login
│   ├── dashboard-dono.html     # Dashboard do proprietário
│   ├── dashboard-funcionario.html  # Dashboard do funcionário
│   ├── dashboard-cliente.html  # Dashboard do cliente
│   ├── qrcode.html             # Página de QR Code
│   └── resgister.html          # Página de registro
├── js/                 # Arquivos JavaScript
│   ├── api.js                  # Funções de API
│   ├── script.js               # Scripts principais
│   └── test-integration.js     # Testes de integração
├── css/                # Arquivos de estilo
│   └── style.css               # Estilos principais
├── config/             # Arquivos de configuração
│   ├── package.json            # Dependências Node.js
│   ├── pnpm-lock.yaml          # Lock file do pnpm
│   ├── vite.config.js          # Configuração do Vite
│   └── template_config.json    # Configurações do template
├── utils/              # Utilitários e documentação
│   └── todo.md                 # Lista de tarefas
├── assets/             # Recursos estáticos (imagens, etc.)
└── .gitignore          # Arquivos ignorados pelo Git
```

## Como Executar

### Servidor HTTP Simples
```bash
cd frontend
python -m http.server 8000
```

### Com Vite (desenvolvimento)
```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades

- **Login/Registro**: Sistema de autenticação completo
- **Dashboard Dono**: Gerenciamento de estabelecimentos e filas
- **Dashboard Funcionário**: Controle de filas e atendimento
- **Dashboard Cliente**: Visualização de posição nas filas
- **QR Code**: Entrada rápida via código QR

## Estrutura de Arquivos

### Páginas (pages/)
Cada página HTML contém:
- Estrutura semântica HTML5
- Referências atualizadas para CSS e JS
- Funcionalidades específicas do módulo

### JavaScript (js/)
- `api.js`: Funções para comunicação com a API backend
- `script.js`: Lógica principal da interface
- `test-integration.js`: Testes de integração

### CSS (css/)
- `style.css`: Estilos responsivos e modernos

### Configuração (config/)
- Arquivos de configuração do projeto
- Dependências e build tools

## Desenvolvimento

Para adicionar novas funcionalidades:

1. **Nova página**: Criar arquivo em `pages/` e atualizar referências
2. **Novo script**: Adicionar em `js/` e importar nas páginas necessárias
3. **Novos estilos**: Adicionar em `css/style.css`
4. **Nova configuração**: Adicionar em `config/`

## Navegação

A navegação entre páginas é feita através de:
- Links diretos nos HTML
- JavaScript para navegação dinâmica
- Redirecionamentos baseados em autenticação

## Responsividade

O design é responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## Compatibilidade

Compatível com navegadores modernos:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+