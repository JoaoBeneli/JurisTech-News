const PROXY_CORS = 'https://corsproxy.io/?';
const URL_FEED = 'https://www.conjur.com.br/feed/';

async function carregarNoticias() {
    const container = document.getElementById('container-noticias');

    container.innerHTML = `
        <div class="carregando">
            <div class="spinner"></div>
            <p>Carregando notícias...</p>
        </div>
    `;

    try {
        const resposta = await fetch(PROXY_CORS + encodeURIComponent(URL_FEED));
        const texto = await resposta.text();

        const analisador = new DOMParser();
        const xml = analisador.parseFromString(texto, 'text/xml');

        const itens = xml.querySelectorAll('item');
        const noticias = [];

        itens.forEach((item, indice) => {
            if (indice < 15) {
                const titulo = item.querySelector('title')?.textContent || 'Sem título';
                const descricao = item.querySelector('description')?.textContent || 'Sem descrição';
                const link = item.querySelector('link')?.textContent || '#';
                const dataPublicacao = item.querySelector('pubDate')?.textContent || new Date().toISOString();

                noticias.push({
                    titulo: titulo.trim(),
                    descricao: descricao.replace(/<[^>]*>/g, '').substring(0, 200).trim() + '...',
                    url: link.trim(),
                    dataPublicacao: new Date(dataPublicacao)
                });
            }
        });

        if (noticias.length === 0) {
            container.innerHTML = `
                <div class="erro">
                    <h2>⚠️ Nenhuma notícia encontrada</h2>
                    <p>Não foi possível carregar notícias no momento. Tente novamente mais tarde.</p>
                </div>
            `;
            return;
        }

        renderizarNoticias(noticias);

    } catch (erro) {
        console.error('Erro ao carregar notícias:', erro);
        container.innerHTML = `
            <div class="erro">
                <h2>❌ Erro ao carregar notícias</h2>
                <p>Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

function renderizarNoticias(noticias) {
    const container = document.getElementById('container-noticias');

    const html = `
        <div class="grade-noticias">
            ${noticias.map(noticia => `
                <div class="cartao-noticia">
                    <div class="cartao-noticia-cabecalho">
                        <div class="noticia-fonte">Consultor Jurídico</div>
                        <div class="noticia-data">${formatarData(noticia.dataPublicacao)}</div>
                    </div>
                    <div class="cartao-noticia-corpo">
                        <h2 class="noticia-titulo">${noticia.titulo}</h2>
                        <p class="noticia-descricao">${noticia.descricao}</p>
                        <a href="${noticia.url}" target="_blank" class="noticia-link">
                            Ler mais →
                        </a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

function formatarData(data) {
    const opcoes = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(data).toLocaleDateString('pt-BR', opcoes);
}

carregarNoticias();

setInterval(carregarNoticias, 30 * 60 * 1000);
