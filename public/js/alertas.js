(function () {
    'use strict';

    const tempoExibicao = 5000;

    function removerAlerta(alerta) {
        if (!alerta || alerta.classList.contains('is-hiding')) return;

        alerta.classList.add('is-hiding');

        window.setTimeout(function () {
            alerta.remove();
        }, 220);
    }

    document.addEventListener('click', function (evento) {
        const botao = evento.target.closest('.flash-alert__close');

        if (botao) {
            removerAlerta(botao.closest('.flash-alert'));
        }
    });

    document.querySelectorAll('.flash-alert').forEach(function (alerta) {
        window.setTimeout(function () {
            removerAlerta(alerta);
        }, tempoExibicao);
    });
})();