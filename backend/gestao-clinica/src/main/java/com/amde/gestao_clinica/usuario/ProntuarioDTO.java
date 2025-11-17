package com.amde.gestao_clinica.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProntuarioDTO {
    private Long idRegistro;          // Era idProntuario
    private String tituloDocumento;   // Novo
    private String nomeArquivoOriginal; // Novo (para exibir no download)
    private LocalDateTime dataRegistro; // Era dataAtualizacao
    
    // Campos achatados da categoria para facilitar o frontend
    private Long idCategoria;
    private String nomeCategoria;
}