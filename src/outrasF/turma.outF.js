

export function initialMaiuculas(texto) {
    try {
        const subTexto = texto.toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
            return a.toUpperCase();
        });
        return subTexto;
    } catch (error) {
    return res.send(error)
    }
} 