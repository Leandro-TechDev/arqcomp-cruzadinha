
# Termo de Arquitetura
 
Jogo interativo no estilo **Termo / Wordle**, feito em HTML, CSS e JavaScript puros, para a disciplina de **Tópicos de Arquitetura Computacional**.
 
Em cada rodada, o jogador recebe uma **pista conceitual** da aula e tem até **6 tentativas** para descobrir o termo técnico correspondente. O tabuleiro se adapta ao tamanho da palavra: de siglas curtas como `UC` até termos longos como `MICROCONTROLADOR`.
  
## Como jogar
 
1. Leia a pista exibida na tela.
2. Digite o termo pelo teclado físico ou pelo teclado virtual.
3. Envie a tentativa com **Enter**. Apague letras com **Backspace** (⌫).
4. Use as cores como feedback:
   - 🟩 **Verde:** a letra existe e está na posição correta.
   - 🟨 **Amarelo:** a letra existe na palavra, mas em outra posição.
   - ⬜ **Cinza:** a letra não existe na palavra.
5. Os termos com mais de uma palavra são escritos juntos, sem espaços (exemplo: `MEMORIADEMASSA`).
6. Acompanhe o placar ("X de 16 termos descobertos") e use **Próxima palavra** ou **Reiniciar jogo**.
## Termos do jogo
 
`CPU`, `ULA`, `UC`, `REGISTRADORES`, `RAM`, `ROM`, `EEPROM`, `FLASH`, `CACHE`, `MEMORIADEMASSA`, `DMA`, `ADDRESSBUS`, `DATABUS`, `MICROCONTROLADOR`, `DUALCORE`, `QUADCORE`
 
## Estrutura do projeto
 
```
.
├── index.html   # Estrutura da página (pista, tabuleiro, teclado, placar)
├── style.css    # Estilos, grade dinâmica e cores de feedback
├── script.js    # Lógica do jogo
└── README.md    # Este arquivo
```
 
## Como executar localmente
 
Não há dependências nem etapa de build. Basta clonar o repositório e abrir o `index.html` no navegador:
 
```bash
git clone <URL>
cd <PASTA>
```
 
Depois, abra o `index.html` com um duplo clique ou use uma extensão como o **Live Server** do VS Code.

## Tecnologias
 
- HTML5
- CSS3 (Grid, Flexbox e variáveis CSS)
- JavaScript (ES6+), sem frameworks nem bibliotecas
 
