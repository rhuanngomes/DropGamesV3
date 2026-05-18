const notificacaoElemento = document.createElement("div");
const imagemDaNotificacao = document.createElement("img");
const conteudoDaNotificacao = document.createElement("div");
const tituloDaNotificacao = document.createElement("h3");
const textoDaNotificacao = document.createElement("p");
const botaoFechar = document.createElement("button");

notificacaoElemento.setAttribute('role', 'status');
notificacaoElemento.setAttribute('aria-live', 'polite');
document.body.appendChild(notificacaoElemento);
notificacaoElemento.appendChild(imagemDaNotificacao);
notificacaoElemento.appendChild(conteudoDaNotificacao);
notificacaoElemento.appendChild(botaoFechar);
conteudoDaNotificacao.appendChild(tituloDaNotificacao);
conteudoDaNotificacao.appendChild(textoDaNotificacao);

notificacaoElemento.style.position = "fixed";
notificacaoElemento.style.bottom = "20px";
notificacaoElemento.style.right = "20px";
notificacaoElemento.style.display = "flex";
notificacaoElemento.style.alignItems = "center";
notificacaoElemento.style.gap = "12px";
notificacaoElemento.style.width = "360px";
notificacaoElemento.style.maxWidth = "calc(100% - 40px)";
notificacaoElemento.style.backgroundColor = "#111";
notificacaoElemento.style.color = "white";
notificacaoElemento.style.padding = "12px 12px 12px 12px";
notificacaoElemento.style.borderRadius = "10px";
notificacaoElemento.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
notificacaoElemento.style.zIndex = "1";

imagemDaNotificacao.style.width = "64px";
imagemDaNotificacao.style.height = "64px";
imagemDaNotificacao.style.objectFit = "cover";
imagemDaNotificacao.style.borderRadius = "8px";
imagemDaNotificacao.style.flex = "0 0 64px";
imagemDaNotificacao.alt = "Imagem da notificação";

// imagemDaNotificacao.src = 'img/exemplo.png' // defina o src se tiver uma imagem
conteudoDaNotificacao.style.display = "flex";
conteudoDaNotificacao.style.flexDirection = "column";
conteudoDaNotificacao.style.justifyContent = "center";
conteudoDaNotificacao.style.flex = "1";

tituloDaNotificacao.style.margin = "0 0 4px 0";
tituloDaNotificacao.style.fontSize = "16px";
tituloDaNotificacao.style.fontWeight = "700";

textoDaNotificacao.style.margin = "0";
textoDaNotificacao.style.fontSize = "13px";
textoDaNotificacao.style.color = "#d0d6dd";

botaoFechar.textContent = "✕";
botaoFechar.setAttribute('aria-label', 'Fechar notificação');
botaoFechar.style.background = "transparent";
botaoFechar.style.border = "none";
botaoFechar.style.color = "#fff";
botaoFechar.style.fontSize = "18px";
botaoFechar.style.cursor = "pointer";
botaoFechar.style.padding = "6px";
botaoFechar.style.marginLeft = "8px";
botaoFechar.style.flex = "0 0 auto";

botaoFechar.addEventListener('click', (e) => {
	e.stopPropagation();
	notificacaoElemento.style.opacity = '0';
	notificacaoElemento.style.transform = 'translateY(12px)';
	notificacaoElemento.style.transition = 'all 300ms ease';
	setTimeout(() => {
		if (notificacaoElemento.parentNode) notificacaoElemento.parentNode.removeChild(notificacaoElemento);
	}, 300);
});

// Clique na notificação para redirecionar
const urlRedirecionamento = './dados.html'; // Altere para a URL desejada
notificacaoElemento.style.cursor = 'pointer';
notificacaoElemento.addEventListener('click', () => {
	window.location.href = urlRedirecionamento;
});

// Conteúdo do elemento
imagemDaNotificacao.src = './img/card-lego-batman.jpg'
tituloDaNotificacao.textContent = "Novo jogo disponível";
textoDaNotificacao.textContent = "Confira agora o lançamento mais recente!";

// Mostrar a notificação com pequena animação
notificacaoElemento.style.opacity = '0';
notificacaoElemento.style.transform = 'translateY(8px)';
setTimeout(() => {
	notificacaoElemento.style.transition = 'all 300ms ease';
	notificacaoElemento.style.opacity = '1';
	notificacaoElemento.style.transform = 'translateY(0)';
}, 10);