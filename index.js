// Acessa elementos do DOM
const cadastroForm = document.getElementById('cadastroForm');
const gerarPdfBtn = document.getElementById('gerarPdfBtn');
const mensagemDiv = document.getElementById('mensagem');

// Elementos para controle de visibilidade do Cônjuge
const estadoCivilSelect = document.querySelector('[name="estadoCivil"]');
const nomeConjugeDiv = document.getElementById('conjugeFields');

// Mostrar/esconder campos de cônjuge
function toggleConjugeFields() {
    const estadoCivil = document.getElementById('estadoCivil').value;
    const conjugeFields = document.getElementById('conjugeFields');

    if (estadoCivil === 'casado' || estadoCivil === 'uniao_estavel') {
        conjugeFields.style.display = 'flex';
    } else {
        conjugeFields.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const estadoCivilSelect = document.getElementById('estadoCivil');
    if (estadoCivilSelect) {
        estadoCivilSelect.addEventListener('change', toggleConjugeFields);
        toggleConjugeFields();
    }
});

// Geração do PDF
if (gerarPdfBtn && cadastroForm && mensagemDiv) {
    gerarPdfBtn.addEventListener('click', function () {
        const formData = {};
        const formElements = cadastroForm.elements;

        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.name) {
                if (element.type === 'radio' || element.type === 'checkbox') {
                    if (element.checked) {
                        formData[element.name] = element.value;
                    }
                } else if (element.tagName !== 'BUTTON') {
                    formData[element.name] = element.value;
                }
            }
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        doc.setFont("helvetica");
        const lineHeight = 6;
        const marginX = 20;
        const colWidth = 80;
        const gap = 10;
        let yPos = 20;
        let col = 0;

        // Título
        doc.setFontSize(14);
        const nomeCliente = formData['nomeCliente'] || 'Documento';
        doc.text(`FORMULÁRIO DE CADASTRO - ${nomeCliente.toUpperCase()}`, doc.internal.pageSize.width / 2, yPos, { align: "center" });
        yPos += 8;
        doc.setLineWidth(0.5);
        doc.line(marginX, yPos, doc.internal.pageSize.width - marginX, yPos);
        yPos += 10;
        doc.setFontSize(9);

        const fieldOrder = [
            "nomeCliente", "emailCliente", "telefone1", "telefone2", "cpf", "dataNascimento",
            "rg", "nacionalidade", "naturalidade", "estadoCivil", "nomeConjuge", "ccpfConjuge",
            "rendimentoTitular", "filiacao",
            "parcelasEmbutidas", "dataAssembleia", "pagiIncorporado", "valorParcela", "valorCredito", "grupoDuracao",
            "cep", "ruaAv", "complemento", "bairro", "numero", "cidade", "estado",
            "tipoConta", "banco", "agencia", "conta", "ppe",
            "tipoPagamento", "valorPagamento", "codigoVendedor", "formaCapitacao", "nomeVendedor", "cpfVendedor"
        ];

        const sections = {
            "nomeCliente": "DADOS DO CONSORCIADO",
            "parcelasEmbutidas": "DADOS DO PLANO",
            "cep": "DADOS DE ENDEREÇO",
            "tipoConta": "DADOS BANCÁRIOS",
            "tipoPagamento": "DADOS DO PAGAMENTO"
        };

        for (const key of fieldOrder) {
            if ((key === 'nomeConjuge' || key === 'ccpfConjuge') && nomeConjugeDiv.classList.contains('hidden')) continue;

            if (sections[key]) {
                if (col === 1) yPos += lineHeight;
                doc.setFont("helvetica", "bold");
                doc.text(sections[key], marginX, yPos);
                yPos += 2;
                doc.setLineWidth(0.1);
                doc.line(marginX, yPos, doc.internal.pageSize.width - marginX, yPos);
                yPos += lineHeight;
                doc.setFont("helvetica", "normal");
            }

            const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
            const value = formData[key] ? formData[key] : 'NÃO INFORMADO';
            const content = `${label}: ${value}`;

            let x = marginX + col * (colWidth + gap);
            doc.text(content, x, yPos);

            col = (col + 1) % 2;
            if (col === 0) yPos += lineHeight;

            if (yPos > 240) break;
        }

        // Rodapé personalizado
        yPos = 275;
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 255);
        doc.textWithLink("multimarcasconsorcios.com.br", doc.internal.pageSize.width - 65, yPos, { url: "https://multimarcasconsorcios.com.br" });

        doc.setTextColor(0, 0, 0);
        yPos += 5;
        doc.setFont("helvetica", "bold");
        doc.text("MULTIMARCAS ADMINISTRADORA DE CONSÓRCIOS LTDA", marginX, yPos);

        doc.setFont("helvetica", "normal");
        yPos += 5;
        doc.text("Av. Amazonas, 126, Centro - Belo Horizonte/MG", marginX, yPos);
        yPos += 5;
        doc.text("Fone: (31) 3065-8000 | Ouvidoria: 0800-727-1656", marginX, yPos);

        // Salvar PDF
        try {
            const nomeArquivo = `cadastro_${nomeCliente.replace(/\s+/g, '_').toLowerCase()}.pdf`;
            doc.save(nomeArquivo);
            mensagemDiv.textContent = 'Documento PDF gerado e baixado com sucesso!';
            mensagemDiv.className = 'success';
            mensagemDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Erro ao gerar o PDF:', error);
            mensagemDiv.textContent = 'Erro ao gerar o documento PDF. Verifique o console para detalhes.';
            mensagemDiv.className = 'error';
            mensagemDiv.classList.remove('hidden');
        }
    });
} else {
    console.error("Um ou mais elementos HTML necessários não foram encontrados. Verifique os IDs/names.");
}
