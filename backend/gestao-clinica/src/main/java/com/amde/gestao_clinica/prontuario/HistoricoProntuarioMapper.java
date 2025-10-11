package com.amde.gestao_clinica.prontuario;

import com.amde.gestao_clinica.usuario.ProntuarioDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface HistoricoProntuarioMapper {

    // id -> idProntuario; demais possuem mesmo nome
    @org.mapstruct.Mapping(source = "id", target = "idProntuario")
    ProntuarioDTO toDTO(HistoricoProntuario historico);
}
