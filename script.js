const URL_FEED = 'https://corsproxy.io/?https://www.conjur.com.br/feed/';

async function carregarNoticias() {
    const container = document.getElementById('container-noticias');

    container.innerHTML = '<div class="carregando"><div class="spinner"></div><p>Carregando notícias...</p></div>';

    try {
        const resposta = await fetch(URL_FEED);
        const texto = await resposta.text();
        const xml = new DOMParser().parseFromString(texto, 'text/xml');
        const itens = xml.querySelectorAll('item');

        if (itens.length === 0) {
            container.innerHTML = '<div class="erro"><h2>Nenhuma notícia encontrada</h2></div>';
            return;
        }

        const noticias = Array.from(itens).slice(0, 15).map(item => {
            const descricaoCompleta = item.querySelector('description').textContent;
            const textoLimpo = descricaoCompleta.replace(/<[^>]*>/g, '').replace(/\[…\]/g, '').trim();

            return {
                titulo: item.querySelector('title').textContent,
                descricao: textoLimpo.substring(0, 200) + '...',
                url: item.querySelector('link').textContent,
                data: new Date(item.querySelector('pubDate').textContent),
                categorias: Array.from(item.querySelectorAll('category')).map(cat => cat.textContent)
            };
        });

        renderizarNoticias(noticias);

    } catch (erro) {
        console.error('Erro ao carregar notícias:', erro);
        container.innerHTML = '<div class="erro"><h2>Erro ao carregar notícias</h2><p>Tente novamente mais tarde.</p></div>';
    }
}

function renderizarNoticias(noticias) {
    const container = document.getElementById('container-noticias');

    container.innerHTML = `
        <div class="grade-noticias">
            ${noticias.map(noticia => `
                <article class="cartao-noticia">
                    <div class="cartao-noticia-cabecalho">
                        <span class="noticia-fonte">Consultor Jurídico</span>
                        <time class="noticia-data">${formatarData(noticia.data)}</time>
                    </div>
                    <div class="cartao-noticia-corpo">
                        <h2 class="noticia-titulo">${noticia.titulo}</h2>
                        ${noticia.categorias.length > 0 ? `<div class="noticia-categorias">${noticia.categorias.slice(0, 3).map(cat => `<span class="categoria">${cat}</span>`).join('')}</div>` : ''}
                        <p class="noticia-descricao">${noticia.descricao}</p>
                        <a href="${noticia.url}" target="_blank" rel="noopener" class="noticia-link">Ler mais →</a>
                    </div>
                </article>
            `).join('')}
        </div>
    `;
}

function formatarData(data) {
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

carregarNoticias();
