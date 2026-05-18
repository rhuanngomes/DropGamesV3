const popUpAceitarTermos = document.createElement('section');
const divPopUp = document.createElement('div');
const textoPopUpAceitarTermos = document.createElement('p');
const linkPopUpAceitarTermos = document.createElement('a');
const botaoAceitarTermos = document.createElement('button');
let estadoDosTermos = false;

estadoDosTermos = localStorage.getItem("respostaSobreOsTermos");
// Relação entre elementos
document.body.appendChild(popUpAceitarTermos);
popUpAceitarTermos.appendChild(divPopUp);
divPopUp.appendChild(textoPopUpAceitarTermos);
divPopUp.appendChild(linkPopUpAceitarTermos);
popUpAceitarTermos.appendChild(botaoAceitarTermos);

// Caixa de notificacao de termos
popUpAceitarTermos.style.opacity = "1"
popUpAceitarTermos.style.height = "80px"
popUpAceitarTermos.style.width = "100%"
popUpAceitarTermos.style.backgroundColor = "#000000e5"
popUpAceitarTermos.style.position = "fixed"
popUpAceitarTermos.style.bottom = "0"
popUpAceitarTermos.style.justifySelf = "center"
popUpAceitarTermos.style.display = "flex"
popUpAceitarTermos.style.justifyContent = "center"
popUpAceitarTermos.style.alignItems = "center"
popUpAceitarTermos.style.gap = "30px"
popUpAceitarTermos.style.transition = "all 1s"
popUpAceitarTermos.style.zIndex = "2";

// Caixa do texto
divPopUp.style.display = "flex"
divPopUp.style.alignItems = "center"
divPopUp.style.gap = "5px"

// Texto
textoPopUpAceitarTermos.textContent = "Ao usar este site, você aceita nossos "
textoPopUpAceitarTermos.style.color = "white"
textoPopUpAceitarTermos.style.margin = "auto"

// Link dos termos
linkPopUpAceitarTermos.textContent = "Termos de Uso";
linkPopUpAceitarTermos.style.color = "white"
linkPopUpAceitarTermos.href = "./termos-de-uso.html";
linkPopUpAceitarTermos.style.textDecoration = "underline";
linkPopUpAceitarTermos.target = "blank";

// Botao de aceitar termos
botaoAceitarTermos.textContent = "Aceitar"
botaoAceitarTermos.style.height = "60px"
botaoAceitarTermos.style.width = "120px"
botaoAceitarTermos.style.borderRadius = "10px"
botaoAceitarTermos.style.borderStyle = "none"
botaoAceitarTermos.style.color = "0d0c0c"
botaoAceitarTermos.style.fontWeight = "bolder"
botaoAceitarTermos.style.backgroundColor = "#00bfff"

// Hover do botao
botaoAceitarTermos.addEventListener('mouseover', () => {
    botaoAceitarTermos.style.backgroundColor = "#07a5da"
    botaoAceitarTermos.style.cursor = "pointer"
});
botaoAceitarTermos.addEventListener('mouseleave', () => {
    botaoAceitarTermos.style.backgroundColor = "#00bfff"
})

// Salvar dados
botaoAceitarTermos.addEventListener('click', () => {
    estadoDosTermos = true;
    localStorage.setItem("respostaSobreOsTermos", estadoDosTermos)
    popUpAceitarTermos.style.opacity = "0"
    setTimeout(() => { popUpAceitarTermos.style.display = "none" }, 1100)
})

// Verificar dados
if (estadoDosTermos) {
    popUpAceitarTermos.style.display = "none"
} else {
    popUpAceitarTermos.style.display = "flex"
};

localStorage.clear()