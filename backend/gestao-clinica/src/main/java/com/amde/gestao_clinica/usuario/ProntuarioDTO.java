package com.amde.gestao_clinica.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProntuarioDTO {
    private String nomeArquivo;
    private LocalDateTime dataAtualizacao;
}
