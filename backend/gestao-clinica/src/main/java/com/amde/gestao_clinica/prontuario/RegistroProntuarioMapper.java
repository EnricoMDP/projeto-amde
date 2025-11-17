package com.amde.gestao_clinica.prontuario;

import com.amde.gestao_clinica.usuario.ProntuarioDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RegistroProntuarioMapper {

    // Mapeamentos explícitos
    @Mapping(source = "idRegistro", target = "idRegistro")
    @Mapping(source = "dataRegistro", target = "dataRegistro")
    
    // Mapeando os dados da Categoria (Navegando pelo objeto categoria)
    @Mapping(source = "categoria.idCategoria", target = "idCategoria")
    @Mapping(source = "categoria.nome", target = "nomeCategoria")
    
    ProntuarioDTO toDTO(RegistroProntuario registro);
}