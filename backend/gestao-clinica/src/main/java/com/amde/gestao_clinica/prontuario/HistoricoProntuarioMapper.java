package com.amde.gestao_clinica.prontuario;

import com.amde.gestao_clinica.usuario.ProntuarioDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface HistoricoProntuarioMapper {

    // mapeia os campos com os mesmos nomes: nomeArquivo -> nomeArquivo, dataAtualizacao -> dataAtualizacao
    ProntuarioDTO toDTO(HistoricoProntuario historico);
}
