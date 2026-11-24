# Adaptive Design System

Robin é referência de acabamento, composição, storytelling, superfícies e movimento, não de marca. Não assumir verde, Geist, cards ou gradientes como padrão de produto. O Studio pode ter aparência neutra, explicitamente separada. Usar system font para o fallback de desenvolvimento.

## Tokens
Cores semânticas: background, surface, surface-raised, foreground, muted, border, primary, on-primary, accent, focus, success, warning, danger, info; pares on-color com contraste verificável. Temas claro/escuro independentes se implementados. Escala 4px como ponto inicial; raios, sombras, densidade, largura de conteúdo e espaçamento ajustáveis. Fontes display/body/mono separadas, tamanho/peso/line-height/tracking parametrizados. Sem cores/fontes de marca em componentes. Base UI sem estilo + Tailwind v4, variantes por CVA quando úteis.

## Catálogo P0
Button, IconButton, Input, Textarea, Select, Checkbox, Switch, Dialog, Popover, Tooltip, Tabs, Card, Badge, Spinner, Skeleton, Progress, EmptyState, ErrorState, Toast, Container, Stack, Grid, Typography. FileUpload com limites quando necessário. P1: Drawer, Dropdown, Sidebar, Navbar, Breadcrumb, DataTable, Slider, Metric, BeforeAfter, ProcessTimeline, EvidencePanel, ResultPanel, ArtifactViewer, Hero/FeatureSection. Não criar páginas de negócio para demonstrar catálogo.

## Layouts
Presentation, application, workspace e focused/mobile como composições independentes, não estruturas obrigatórias. Permitir canvas/mapa/tela única. Priorizar ação principal e feedback compreensível.

## Qualidade
WCAG 2.2 AA como meta: contraste textual normal 4.5:1, grande 3:1, foco/controles perceptíveis, teclado, nomes acessíveis e erros textuais. Não depender só de cor. Verificar 360/768/1440 px e zoom. Evitar excesso de cards, blur, gradientes clichês, ícones decorativos sem função e animações que atrasem tarefas. Screenshot tests de componentes relevantes; revisão humana, não só snapshots.
